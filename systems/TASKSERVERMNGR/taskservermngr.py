# -*- coding: utf-8 -*-
import os
from base import BasePage
from systems.TASKSERVERMNGR.templates.taskservermngr_main import taskservermngr_main
from systems.TASKSERVERMNGR.templates.taskservermngr_performing import taskservermngr_performing
from fdb import DatabaseError as FBExc
from conf.engine_conf import START_ROBOT, STOP_ROBOT, STATUS_ROBOT


class TaskServerMngr(BasePage):

    tabs = {
        'taskservermngr_performing': _('Текущие задания'),
        'taskservermngr_main': _('История')
    }
    tabsSort = ('taskservermngr_performing','taskservermngr_main')

    def index(self, id_system=None):
        return self.taskservermngr_performing()

    index.exposed = True

    def errMesText(self, mes):
        return self.pyDumps({"errMes":mes[1]})

    errMesText.exposed = True

    def taskservermngr_main(self):
        return self.drawTemplate(templ=taskservermngr_main, data=[])

    taskservermngr_main.exposed = True

    def taskserver_list(self, in_ftime, in_ltime, in_file, in_params, in_typequeueid, in_statuscode, in_date=None):
        if in_params == '':
            in_params = None
        if in_file == '':
            in_file = None
        if in_typequeueid == 'none':
            in_typequeueid = None
        if in_statuscode == 'none':
            in_statuscode = None

        in_ftime = in_date + ' ' + in_ftime
        in_ltime = in_date + ' ' + in_ltime

        try:
            data_lst = self.dbExec(sql='select * from TS_QUEUELIST(?,?,?,?,?,?)',
                                   params=[in_ftime, in_ltime, in_typequeueid, in_statuscode, in_file, in_params],
                                   fetch='all')

        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst, ext_data={'in_date': in_date, 'in_ftime': in_ftime, 'in_ltime': in_ltime,
                                                     'in_statuscode': in_statuscode, 'in_typequeueid': in_typequeueid,
                                                     'in_file': in_file, 'in_params': in_params})

    taskserver_list.exposed = True

    def taskserver_item(self, taskid=None):

        try:
            data_lst = self.dbExec(sql='select * from TS_QUEUELIST_INFO(?)',
                                   params=[taskid], fetch='one')
        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst, ext_data={'taskid': taskid})

    taskserver_item.exposed=True

    def taskserver_getTask(self, taskid=None):

        try:
            data_lst = self.dbExec(sql='select * from TS_QUEUELIST_INFO(?)',
                                   params=[taskid], fetch='all')
        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst, ext_data={'taskid': taskid})

    taskserver_getTask.exposed=True

    def taskserver_deleteTask(self, taskid):
        try:
            data_lst = self.dbExec(sql='execute procedure TS_DELETETASK(?)',
                                   params=[taskid], fetch='none')
        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst, ext_data={'taskid': taskid})

    taskserver_deleteTask.exposed=True

    def taskserver_tasktypeList(self):
        try:
            data_lst = self.dbExec(sql='select * from TS_QUEUE_TASKTYPELIST',
                                   fetch='all')
        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst)

    taskserver_tasktypeList.exposed=True

    def taskserver_statusList(self):
        try:
            data_lst = self.dbExec(sql='select * from TS_QUEUE_STATUSLIST',
                                   fetch='all')
        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst)

    taskserver_statusList.exposed=True

    def taskserver_overfulfillStatus(self, taskid):
        try:
            data_lst = self.dbExec(sql='execute procedure TS_QUEUELIST_OVERFULFILL(?)',
                                   params=[taskid], fetch='none')
        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst, ext_data={'taskid': taskid})

    taskserver_overfulfillStatus.exposed = True

    def taskserver_getFile(self, path):
        if os.path.exists(path):
            return self.pyDumps({'path':path})
        else:
            return self.pyDumps({'mes':'Файл не найден!'})

    taskserver_getFile.exposed = True

    def taskserver_getResult(self, taskid):
        try:
            data_lst = self.dbExec(sql='select * from TS_GETRESULT(?)',
                                   params=[taskid], fetch='one')
        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst, ext_data={'taskid': taskid})

    taskserver_getResult.exposed = True

    def taskserver_selectQueuebond(self, taskid):
        try:
            data_lst = self.dbExec(sql='select * from TS_SELECTQUEUEBOND(?)',
                                   params=[taskid], fetch='all')


        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst, ext_data={'taskid': taskid})

    taskserver_selectQueuebond.exposed = True

    def taskservermngr_performing(self):
        return self.drawTemplate(templ=taskservermngr_performing, data=[])

    taskservermngr_performing.exposed = True

    def taskserverPerf_list(self):
        try:
            data_lst = self.dbExec(sql='select * from TS_QUEUELIST_PERFOMING', fetch='all')


        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst)

    taskserverPerf_list.exposed=True

    def get_statusTaskserver(self):
        raw_cmd = os.system(STATUS_ROBOT)
        if raw_cmd == 0:
            return self.pyDumps(ext_data={'res': 'Active'})
        else:
            return self.pyDumps(ext_data={'res': 'Inactive'})

    get_statusTaskserver.exposed = True

    def start_Taskserver(self):

        os.system(START_ROBOT)
        return self.get_statusTaskserver()

    start_Taskserver.exposed = True

    def stop_Taskserver(self):

        os.system(STOP_ROBOT)
        return self.get_statusTaskserver()

    stop_Taskserver.exposed = True








