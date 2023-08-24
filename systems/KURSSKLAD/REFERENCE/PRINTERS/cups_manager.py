# -*- coding: utf-8 -*-
#!/usr/bin/env python

from subprocess import Popen, PIPE
import re

class CupsManager():
    active = r'active|start|running'
    inactive = r'inactive|stop|waiting'

    def __shell(self, cmd):
        p = Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE)
        out, err = p.communicate()
        msg = out + err
        status = (lambda x: 'ok' if x == '' else 'error')(err)
        return (status, msg)


    def cups_status(self):
        #raw_cmd = self.__shell('/etc/init.d/cups status')
        raw_cmd = self.__shell('systemctl status cups.service')
        if raw_cmd[0] == 'error':
            return raw_cmd
        if len(re.findall(self.inactive, raw_cmd[1])) > 0:
            return ('disabled', raw_cmd[1])
        if len(re.findall(self.active, raw_cmd[1])) > 0:
            return ('enabled', raw_cmd[1])


    def cups_start(self):
        #raw_cmd = self.__shell('/etc/init.d/cups start')
        raw_cmd = self.__shell('systemctl start cups.service')
        if raw_cmd[0] == 'error':
            return raw_cmd
        if len(re.findall(self.active, raw_cmd[1])) > 0:
            return raw_cmd
        if len(re.findall(self.inactive, raw_cmd[1])) > 0:
            return ('error', raw_cmd[1])

    def cups_restart(self):
        #raw_cmd = self.__shell('/etc/init.d/cups restart')
        raw_cmd = self.__shell('systemctl restart cups.service')
        if raw_cmd[0] == 'error':
            return raw_cmd
        if len(re.findall(self.active, raw_cmd[1])) > 0:
            return raw_cmd
        if len(re.findall(self.inactive, raw_cmd[1])) > 0:
            return ('error', raw_cmd[1])

    def cups_stop(self):
        #raw_cmd = self.__shell('/etc/init.d/cups stop')
        raw_cmd = self.__shell('systemctl stop cups.service')
        if raw_cmd[0] == 'error':
            return raw_cmd
        if len(re.findall(self.inactive, raw_cmd[1])) > 0:
            return raw_cmd
        if len(re.findall(self.active, raw_cmd[1])) > 0:
            return ('error', raw_cmd[1])

    # @param destination - printer name
    def get_printer_queue(self, destination=None):
        if destination is not None:
            cmd = 'LC_ALL=C lpstat | grep %s-' % destination
        else:
            cmd = 'LC_ALL=C lpstat'
        return self.__shell(cmd)

    # @param job_id
    def cancel_job(self, destination, job_id):
        cmd = 'lprm -P %s %s' % (destination, job_id)
        return self.__shell(cmd)

    # @param destination - printer name
    # @return tuple (status like "ok" or "error", ip like "socket://xxx.xxx.xxx.xxx:ppppp" or "cnijnet:/MA-CA-DD-RE-SS-00")
    def get_printer_ip(self, destination):
        cmd = "lpstat -v | grep %s | awk '{ print $4 }'" % destination
        return self.__shell(cmd)

    # depend installed nmap (yast -i nmap)
    # @param String ip, String or Int port
    # @return "ok" if nmap installed and status. Parse in status ignore case "open" | "fitered" | "closed" | "host seems down"
    def check_port(self, ip, port):
        cmd = 'nmap -p%s %s' % (port, ip)
        return self.__shell(cmd)

    def cancel_queue(self, destination):
        cmd = 'lprm -P %s -' % destination
        return self.__shell(cmd)