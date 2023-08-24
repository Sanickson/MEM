# -*- coding: utf-8 -*-
import os, subprocess
import re
import time
import datetime
import cherrypy
from base import BasePage
from systems.ENGINE.WEBSERVER.templates.webserver_tmpl import webserver_tmpl
from db import getCntActiveTrans
import layers
import cp_utils as cpu
import py_utils as pu
from th_dic import th_dic
import api.version as version

import conf.engine_conf as cfg

class WebServer(BasePage):

    ###########################################################3
    #               Web server part
    ###########################################################3

    def index(self, id_system=None):
        BasePage.index(self, id_system)
        engine_version, accepted_db_version, engine_date_version = version.get_firepy_version()
        (version_from_db, date_from_db) = version.get_version_from_db()
        if version.check_db_versions(version_from_db):
            db_version_matched = 'OK'
        else:
            db_version_matched = 'DB НЕ СООТВЕТСТВУЕТ версии Fire Py!!!'
        return self.drawTemplate(templ=webserver_tmpl, data=[{'useLayers': layers.layersIsUse(),
                                                              'engine_version': engine_version,
                                                              'accepted_db_version': accepted_db_version,
                                                              'engine_date_version': engine_date_version,
                                                              'version_from_db': version_from_db,
                                                              'date_from_db': date_from_db,
                                                              'db_version_matched': db_version_matched,
                                                              'is_linux': pu.is_linux()}])
    index.exposed=True

    def stop_webserver(self, start_updater='0'):
        cpu.server.server_state = 3
        status=cpu.server.getServerState()
        cnt_active_trans=getCntActiveTrans()
        yield self.pyDumps(ext_data={'status': status, 'cnt_active_trans': 0})
        #cherrypy.request.close_connection=True

        if cnt_active_trans > 0:
            #грязный стоп - с ошибками kinterbasdb в логе (except их не ловит)
            cpu.server.stop_webserver(wait=False, start_updater=bool(self.cInt(start_updater)))
        else:
            #стопаем с ожиданием только когда нечего ждать
            cpu.server.stop_webserver(wait=True, start_updater=bool(self.cInt(start_updater)))
        #print "stop_webserver finish"
    stop_webserver.exposed=True
    #так не стартует хуки - лучше ставить, чтоб статус возвращался только при останове сервера (хотя почему-то никак не влияет)
    #без этого иногда в IE при в адресной строке пишется url без exception
    stop_webserver._cp_config = {"response.stream": True}

    def request_stop(self):
        cpu.server.server_state = 2
        return self.pyDumps()
    request_stop.exposed=True

    def get_status(self, **kwargs):
        status=cpu.server.getServerState()
        cnt_active_trans=getCntActiveTrans()
        data=[]
        cur_time=time.strftime('%H:%M:%S',time.localtime())
        max_threads=''
        if layers.layersIsUse():
            layer_names = layers.layersList()
            layer_names = dict(list(zip([d['LAYER_ID'] for d in layer_names], [{'CODE':d['CODE'], 'ORGANIZATION':d['ORGANIZATION']} for d in layer_names])))
        if kwargs.get('request_threads', '0')!='0':
            max_threads = getattr(cfg, 'thread_pool', 20) + pu.iif(getattr(cfg, 'server2', False), getattr(cfg, 'thread_pool2', 20), 0)
            for th_number in range(1, len(cherrypy.engine.thread_manager.threads) + 1):
                if not layers.layersIsUse():
                    in_trans=th_dic.get_th_store(cpu.th_number_to_id(th_number), 'in_trans')
                    trans_start=th_dic.get_th_store(cpu.th_number_to_id(th_number), 'trans_start')
                    trans_end=th_dic.get_th_store(cpu.th_number_to_id(th_number), 'trans_end')
                    last_sql=th_dic.get_th_store(cpu.th_number_to_id(th_number), 'last_sql')
                else:
                    if kwargs.get('layer_id', 'all') == 'all':
                        (layer_id, in_trans, trans_start, trans_end, last_sql) = th_dic.get_th_status(thread_id=cpu.th_number_to_id(th_number))
                    else:
                        layer_id = int(kwargs.get('layer_id'))
                        in_trans=th_dic.get_th_store(cpu.th_number_to_id(th_number), 'in_trans', layer_id=layer_id)
                        trans_start=th_dic.get_th_store(cpu.th_number_to_id(th_number), 'trans_start', layer_id=layer_id)
                        trans_end=th_dic.get_th_store(cpu.th_number_to_id(th_number), 'trans_end', layer_id=layer_id)
                        last_sql=th_dic.get_th_store(cpu.th_number_to_id(th_number), 'last_sql', layer_id=layer_id)

                trans_len=''
                if trans_start and trans_end:
                    len_float=trans_end - trans_start
                    trans_len = time.strftime('%H:%M:%S.',time.gmtime(len_float))+str(int(round((len_float-int(len_float))*1000)))
                trans_start=trans_start or ''
                trans_end=trans_end or ''
                if trans_start:
                    trans_start=time.strftime('%H:%M:%S',time.localtime(trans_start))
                if trans_end:
                    trans_end=time.strftime('%H:%M:%S',time.localtime(trans_end))

                if not layers.layersIsUse():
                    data.append({'TH_NUMBER': th_number, 'IN_TRANS': in_trans, 'TRANS_START':trans_start, 'TRANS_END':trans_end, 'TRANS_LEN':trans_len, 'LAST_SQL':last_sql})
                else:
                    layer_info = layer_names.get(layer_id)
                    if layer_info:
                        code = layer_info['CODE']
                        organization = layer_info['ORGANIZATION']
                    else:
                        code = ''
                        organization = ''
                    data.append({'TH_NUMBER': th_number, 'LAYER_ID': layer_id, 'CODE': code, 'ORGANIZATION': organization, 'IN_TRANS': in_trans, 'TRANS_START':trans_start, 'TRANS_END':trans_end, 'TRANS_LEN':trans_len, 'LAST_SQL':last_sql})

        return self.pyDumps(data=data, ext_data={'status': status, 'cnt_active_trans': cnt_active_trans, 'cur_time':cur_time, 'max_threads':max_threads})
    get_status.exposed=True

    def cancel_stop(self):
        cpu.server.server_state = 1
        status=cpu.server.getServerState()
        cnt_active_trans=getCntActiveTrans()
        return self.pyDumps(ext_data={'status': status, 'cnt_active_trans': cnt_active_trans})
    cancel_stop.exposed=True

    def get_layers(self):
        return self.pyDumps(data=layers.layersList())
    get_layers.exposed=True

    ###########################################################3
    #               Updater part
    ###########################################################3

    # Utilites

    SSH = 'ssh -p %s %s@%s ' % (pu.iif(cfg.upd_ssh_port, cfg.upd_ssh_port, 22), cfg.upd_ssh_user, cfg.upd_ssh_ip)
    SUFFIX_DIR = '#u7z'

    def ssh_command(self, command):
        command = self.SSH + '"%s"' % command
        # exec os cmd without waiting and no handle errors
        p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        stdout, stderr = p.communicate()
        stdout = stdout.decode('utf-8').encode('cp1251')  # latin1
        stderr = stderr.decode('utf-8').encode('cp1251')
        retcode = p.wait()
        return retcode, stdout, stderr

    def upd_list_dir(self, dir, sort='desc', only_today='1'):
        #retcode, listdir, error = self.ssh_command(r"sudo ls -l %s | awk 'NR>1 && NF>0{print substr(\$1,1,1),\$9}'" % dir)
        retcode, listdir, error = self.ssh_command(r"sudo ls -l %s" % dir)
        ld_new = []
        if not retcode:
            ld = listdir.split('\n')[1:-1]  # отсекаем первую строку с кол-вом и последнюю пустую строку (после \n)
            # каждый элемент имеет вид:
            # drwxr-xr-x. 2 root root  4096 Дек  3  2013 Имя_файла_или_папки
            #
            #ld = listdir.split('\n')[:-1]  # отсекаем последнюю пустую строку
            for elem in ld:
                elem_parts = re.split(r'\s+', elem)
                type = elem_parts[0][0]
                file = elem_parts[8]
                #(type, file) = elem.split(' ')
                if type == 'd':
                    ld_new.append((type,file))
                elif not file.endswith(self.SUFFIX_DIR):
                    today = datetime.date.today()
                    if not bool(self.cInt(only_today)) or \
                        file.startswith(today.strftime("%Y")+ "-" + today.strftime("%m")+ "-" + today.strftime("%d")):

                            match = False
                            for upd_logs_regexp in cfg.upd_logs_regexps:
                                if re.match(upd_logs_regexp, file):
                                    match = True
                                    break
                            if match:
                                ld_new.append((type,file))

            # сортируем свежие вначале, если заказано
            if sort == 'desc':
                ld_new.sort(key=lambda el: el[1], reverse=True)

        return retcode, ld_new, error

    def get_file_contents(self, file_loc):
        retcode, file_contents, error = self.ssh_command(r"sudo cat %s" % file_loc)
        return retcode, file_contents, error

    # exposeds

    def upd_logs_dlg(self):
        try:
            retcode, ld, error = self.upd_list_dir(cfg.upd_logs_dir)
        except UnicodeDecodeError:
            raise Exception('Ошибка при получении содержимого каталога %s. Возможно, в именах файлов или подкаталогов присутствуют спецсимволы.'
                % cfg.upd_logs_dir)

        if retcode:
            raise Exception(str(error))
            # ld = [('Ошибка! ' + str(error), '')]
        d = {'files': ld, 'dir_loc': cfg.upd_logs_dir}
        self.setIfaceVar('upd_level_dir', 0)
        self.setIfaceVar('upd_cur_dir', cfg.upd_logs_dir)

        return self.drawTemplate(templ='webserver_upd_logs', data=[d])
    upd_logs_dlg.exposed=True

    def upd_ls_dir(self, subdir='.', sort='asc', only_today='1'):
        upd_level_dir = self.getIfaceVar('upd_level_dir')
        upd_cur_dir = self.getIfaceVar('upd_cur_dir')

        if subdir == '..':
            # переход в родительскую папку
            if self.getIfaceVar('upd_level_dir') >= 1:
                upd_level_dir = self.getIfaceVar('upd_level_dir') - 1
                upd_cur_dir = os.path.abspath(os.path.join(self.getIfaceVar('upd_cur_dir'), '..'))
        elif subdir != '.' and not '/' in subdir:
            # переход в подпапку
            upd_level_dir = self.getIfaceVar('upd_level_dir') + 1
            upd_cur_dir = os.path.abspath(os.path.join(self.getIfaceVar('upd_cur_dir'), subdir))

        try:
            retcode, ld, error = self.upd_list_dir(dir=upd_cur_dir, sort=sort, only_today=only_today)
        except UnicodeDecodeError:
            raise Exception('Ошибка при получении содержимого каталога %s. Возможно, в именах файлов или подкаталогов присутствуют спецсимволы.'
                % upd_cur_dir)
        if retcode:
            raise Exception(str(error))
            # ld = [('Ошибка! ' + str(error), '')]

        self.setIfaceVar('upd_level_dir', upd_level_dir)
        self.setIfaceVar('upd_cur_dir', upd_cur_dir)

        if upd_level_dir >= 1:
            ld.insert(0, ('d', '..'))
        d = {'files': ld, 'dir_loc': upd_cur_dir}

        return self.pyDumps(ext_data=d)
    upd_ls_dir.exposed=True

    def upd_view_log(self, file):
        file_loc = os.path.abspath(os.path.join(self.getIfaceVar('upd_cur_dir'), file))
        try:
            retcode, file_contents, error = self.get_file_contents(file_loc)
        except UnicodeDecodeError:
            raise Exception('Ошибка при отображении файла %s. Возможно, он является двоичным.' % file_loc)

        if retcode:
            raise Exception(str(error))
        d = {'file_contents': file_contents, 'file_loc': file_loc}
        return self.drawTemplate(templ='webserver_upd_logview', data=[d])
    upd_view_log.exposed=True
