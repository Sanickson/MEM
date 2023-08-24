# -*- coding: utf-8 -*-

import os
import BasePlugin as BP
import rbssendemail as e
import krconst as c
import configparser

class Plugin(BP.BasePlugin):
    """
        класс работы с почтой
    """
    section_subject_param = 'Subject'
    section_procedure_name = 'ProcNames'
    section_procedure_param = 'ProcParams'
    section_procedure_fetch = 'ProcFetches'
    section_datalist = 'ProcDataList'
    section_dimension = 'Dimension'
    section_convert = 'Convert'
    report_config = None
    kwards_email = None
    file_name_report_print = None
    type_convert = 'pdf'
    name_printer = None

    def run(self):
        """
            отправка почты
        """

        if self.queueparamsxml:
            self.report_config = None
            self.kwards_email = None

            """ определить где находится файл с настройками """
            sql_text = 'select R.FILENAME from RBS_Q_GETFILEREPORT(?) R'
            res = self.execute_sql(sql_text,
                                   sql_params=[self.rule],
                                   fetch='one')
            report_file_name = None
            if res['status'] == c.kr_sql_error:
                self.LogFile(res['message'])
                return False

            if res['datalist']:
                report_file_name = res['datalist']['FILENAME']
            else:
                self.log_file(c.kr_message_error_errorreportimdb % self.rule)
                self.result['result'] = c.plugin_error
                return False

            self.kwards_email = self.xml_get_all_params(self.queueparamsxml, as_dic=True)
            if self.result['result'] == c.plugin_error:
                return False

            self.prepare_email(report_file_name)

        else:
            self.result['result'] = c.plugin_error
            self.log_file(c.m_e_params_is_null)
            return False

    def prepare_email(self, report_file_name):

        procedures = self.get_proc_from_file(os.path.join(self.parent.k_conf.global_dir_report, report_file_name))
        subject_type = self.get_subject_params()
        subject_text = ''
        out_data = {}
        out_data['html'] = '\n\t' + self.report_config.get('html', 'html').replace('<', '\n\t<').replace('#', '\n\t#')
        out_data['html'] = out_data['html'].replace('$$', '%')
        for item in procedures:
            if item['fetch'] != 'text':
                tmp = self.execute_sql(item['procname'],
                                       sql_params=item['procparams'],
                                       fetch=item['fetch'])
                if tmp['status'] == c.kr_sql_error:
                    return False
                if subject_type != item['proc_item']:
                    out_data[item['dl']] = tmp['datalist']
                else:
                    subject_text = tmp['datalist']['subject']
            else:
                if subject_type == item['proc_item']:
                    subject_text = item['procname']

        out_data['html'] = '\n\t' + self.report_config.get('html', 'html').replace('<', '\n\t<').replace('#', '\n\t#')
        out_data['html'] = out_data['html'].replace('$$', '%')
        # out_data['html'] = out_data['html'].decode('utf8').encode('cp1251')

        tmpl_report = self.parent.k_conf.global_tmpl_report
        report_full_file_name = self.parent.k_conf.global_dir_report + '.' + tmpl_report
        exec('from %s import %s' % (report_full_file_name, tmpl_report))
        # получили тело письма
        html_report = str(locals()[tmpl_report](searchList=[out_data]))

        toaddress = self.parser_xml(self.queueparamsxml, 'to_address')
        if toaddress is None:
            toaddress = self.parser_xml(self.taskparamsxml, 'to_address')

        a = e.Email(self,
                    smtp_server=self.parser_xml(self.taskparamsxml, 'smtp_server'),
                    port=self.parser_xml(self.taskparamsxml, 'port'),
                    username=self.parser_xml(self.taskparamsxml, 'username'),
                    password=self.parser_xml(self.taskparamsxml, 'password'),
                    from_address=self.parser_xml(self.taskparamsxml, 'from_address'),
                    use_tls=self.parser_xml(self.taskparamsxml, 'usetls'),
                    to_address=toaddress,
                    subject=subject_text,
                    message=html_report,
                    coding='utf-8',
                    Content_Type='text/html')
        if not a.send_email():
            self.result['result'] = c.plugin_error
            return False
        return True

    def get_proc_from_file(self, file_name, get_name=None):
        self.report_config = configparser.ConfigParser(interpolation=configparser.ExtendedInterpolation())
        self.report_config.read(file_name)
        procedures = []
        for item in self.report_config.options(self.section_procedure_name):
            procedures.append({
                'procname': self.report_config.get(self.section_procedure_name, item),
                'procparams': self.get_params_to_proc(item, get_name),
                'fetch': self.get_fetch_from_proc(item),
                'dl': self.get_dl_from_proc(item),
                'proc_item': item
            })
        return procedures

    def get_subject_params(self):
        return self.report_config.get(self.section_subject_param, 'text')


    def get_params_to_proc(self, name_param, get_name=None):
        try:
            params = self.report_config.get(self.section_procedure_param, name_param)
        except:
            return []
        params_mas = []
        if get_name is not None:
            return params
        for item in params.split(','):
            val = self.kwards_email[item]
            if val == 'None':
                params_mas.append(None)
            else:
                params_mas.append(val)
        return params_mas

    def get_fetch_from_proc(self, name_param):
        if self.report_config.has_section(self.section_procedure_fetch):
            if self.report_config.has_option(self.section_procedure_fetch, name_param):
                return self.report_config.get(self.section_procedure_fetch, name_param)
        return 'all'

    def get_dl_from_proc(self, name_param):
        if self.report_config.has_section(self.section_datalist):
            if self.report_config.has_option(self.section_datalist, name_param):
                return self.report_config.get(self.section_datalist, name_param)
