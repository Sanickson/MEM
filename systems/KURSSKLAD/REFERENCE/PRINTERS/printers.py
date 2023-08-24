# -*- coding: utf-8 -*-
from systems.KURSSKLAD.REFERENCE.common import RCommon
from systems.KURSSKLAD.REFERENCE.PRINTERS.templates.main import main as tmplmain
from systems.KURSSKLAD.ksprav import KSprav
from systems.KURSSKLAD.REFERENCE.PRINTERS.cups_manager import CupsManager as cmanger
import re
from sys import platform
import db

class Printers(RCommon, cmanger, KSprav):

    def index(self, id_system=None):
        RCommon.index(self, id_system)
        #print self.get_printer_ip('office')
        return self.drawTemplate(templ=tmplmain, data=[])
    index.exposed = True

    def listPrinters(self):
        try:
            data = self.dbExec('select * from K_REF_GET_PRINTERS', fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listPrinters.exposed = True

    def getStatus(self, pname):
        pattern = r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\:\d+"
        patternIP = r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"
        patternPort = r"\d+$"
        gpIP = []
        gpIP = self.get_printer_ip(pname)
        # if pname == 'zebra1':                        #тест
        #     gpIP = ['ok', 'socket://192.168.1.115:516']    # тест
        # else:
        #     gpIP = ['ok', '']
        if gpIP[0] == 'error':
            pstatus = 'Ошибка. lpstat'
        elif gpIP[0] == 'ok':
            if gpIP[1] == '':
                pstatus = 'Невозможно определить IP адрес принтера'
            else:
                IpPort = re.findall(pattern, gpIP[1])
                ip = re.findall(patternIP, gpIP[1])
                port = re.findall(patternPort, gpIP[1])
                chPort = self.check_port(ip[0], port[0])
                # chPort = ['ok', 'Starting Nmap 6.01 ( http://nmap.org ) at 2013-08-27 10:42 EEST Nmap scan '
                #                 'report for 192.168.1.115 Host is up (0.00042s latency). PORT STATE SERVICE '
                #                 '516/tcp open videotex MAC Address: 00:1E:8F:C4:38:28 (Canon) Nmap done: 1 IP '
                #                 'address (1 host up) scanned in 0.03 seconds']#self.check_port(ip[0],port[0])
                statusPort = re.findall('tcp [a-z]*', chPort[1])
                statusHost = re.findall('Host [a-z]* [a-z]*', chPort[1])
                if len(statusPort) == 0:
                    statusPort.append('tcp close')
                if len(statusHost) == 0:
                    statusHost.append('Host is down')
                if statusHost[0] == 'Host is up':
                    if statusPort[0] == 'tcp open':
                        pstatus = 'ok'
                else:
                    pstatus = str(statusHost[0]) + ' ' + str(statusPort[0])
        return self.pyDumps(ext_data=pstatus)
    getStatus.exposed = True

    def cngPrinter(self, **kwargs):
        if kwargs['pid'] == '' or kwargs['pid'] == 'null':
            kwargs['pid'] = None
        params = [kwargs['pid'],
                  kwargs['name'],
                  kwargs['alias']]
        try:
            data = self.dbExecC('select * from K_REF_ADD_PRINTER(?,?,?)', params=params, fetch='one')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    cngPrinter.exposed = True

    def delPrinter(self, **kwargs):
        try:
            data = self.dbExec('execute procedure K_REF_DEL_PRINTER(?)', params=[kwargs['pid']], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    delPrinter.exposed = True

    def printLabels(self, cnt, printer):
        try:
            printer = self.dbExec('select * from wm_printers where printerid = ?', params=[printer], fetch='one')[
                'ALIAS']
            jailed = self.dbExec('select * from equipment where params containing ? and serialnum is not null',
                                 params=[printer], fetch='all')
            if len(jailed['datalist']) > 0: return self.pyDumps(
                {'errMes': 'Данный принтер зарезервинован под конвейер! Печать на нем невозможна.'})
            #for i in xrange(0, int(cnt)):
            self.dbExec(sql="execute procedure K_WH_INCOME_PRINTPALLET('INCOME',?,NULL,?,?)",
                        params=[self.GetKSessionID(), printer, cnt], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps({})

    printLabels.exposed = True

    def statusCups(self):
        res = self.cups_status()
        if res:
            if res[0] == 'enabled':
                return self.pyDumps(ext_data={'res': 'Служба запущена'})
            elif res[0] == 'disabled':
                return self.pyDumps(ext_data={'res': 'Служба остановлена'})
            else:
                return self.pyDumps(ext_data={'res': 'Не возможно установить статус службы печати'})
        return self.pyDumps({'errMes': 'Не удается распознать ответ от службы на запрос о ее состоянии!'})
    
    statusCups.exposed = True
    
    def stopCups(self):
        self.cups_stop()
        return self.statusCups()

    stopCups.exposed = True

    def startCups(self):
        self.cups_start()
        return self.statusCups()    
    
    startCups.exposed = True

    def printerQueue(self, destination=None):
        rstatus = self.get_printer_queue(destination)
        if rstatus[0] != 'ok':
            return self.pyDumps({'errMes': 'Данный принтер не подключен'})
        pattern = re.compile(destination+'-(\d+)\s+\S+\s+\d+\s+\S+\s+(\S+)\s+(\d+)\s+(\d+:\d+:\d+)\s+(\d+)')
        result = []
        for line in rstatus[1].splitlines():
            if pattern.search(line) is not None:
                result.append(pattern.search(line).groups())
        return self.pyDumps({'res': result})

    printerQueue.exposed = True

    def getPlatform(self):
        return platform()

    getPlatform.exposed = True

    def cancelQueue(self, destination):
        res = self.cancel_queue(destination)
        if res is not None:
            if res[0] != 'ok':
                return self.pyDumps({'errMes': 'Не удалось отменить очередь принтера!'})
            else:
                return self.pyDumps(ext_data={'res': 'Очередь очищена'})
        else:
            return self.pyDumps({'errMes': 'Возникла ошибка!'})

    cancelQueue.exposed = True

    def cancelJob(self, destination, job_id):
        if job_id is not None and destination is not None:
            rstatus = ''
            for w in job_id.split(','):
                if w != '':
                    res = self.cancel_job(destination, w)
                    if res is not None:
                        if res[0] != 'ok':
                            rstatus += w + '; '
        if rstatus == '':
            return self.pyDumps(ext_data={'res': 'Задание отменены'})
        else:
            rstatus = 'Не удалось отменить задания: ' + rstatus
            return self.pyDumps({'errMes': rstatus})
    cancelJob.exposed = True

