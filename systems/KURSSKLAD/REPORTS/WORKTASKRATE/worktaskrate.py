# -*- coding: utf-8 -*-
__author__ = 'Nickson'

from systems.KURSSKLAD.REPORTS.WORKTASKRATE.templates.worktaskrate import worktaskrate
from systems.KURSSKLAD.REPORTS.WORKTASKRATE.templates.worktaskratebyempl import worktaskratebyempl
from systems.KURSSKLAD.taskInfo import TaskInfo


import conf.engine_conf as cfg
import db


class WorkTaskRate(TaskInfo):
    useTaskWares = 0
    usePosCount = 0

    def index(self, id_system=None):
        TaskInfo.index(self, id_system)
        return self.workTaskRate()

    index.exposed = True

    def workTaskRate(self):
        return self.drawTemplate(templ=worktaskrate, data=[])

    workTaskRate.exposed = True

    def userWareHouses(self):
        wh = TaskInfo.userWareHouses(self)
        return self.pyDumps(data=wh)

    userWareHouses.exposed = True

    def listTaskTypes(self):
        try:
            data = self.dbExec(sql="select tasktypeid as ttid,name from wm_tasktype where issystem='0'",
                               params=(), fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    listTaskTypes.exposed = True

    def listWorkers(self, timebeg, timeend, ttid=None, users=None, whid=None):
        try:
            data = self.dbExec(sql="select * from WH_RWORKTASKRATE_LISTWORKERS(?,?,?,?,?)",
                               params=(timebeg, timeend, ttid, users, whid), fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'beg': timebeg, 'end': timeend, 'ttid': ttid})

    listWorkers.exposed = True

    def calcWorkerTask(self, timebeg, timeend, manid, ttid, whid=None):
        try:
            data = self.dbExec(sql="select * from CB_WH_RWORKTASKRATE_MANINFO(?,?,?,?,?)",
                               params=(manid, timebeg, timeend, ttid, whid), fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'manid': manid})

    calcWorkerTask.exposed = True

    def getSystems(self):
        try:
            data = db.dbExec(sql="select list(er.id_user) as id_user,es.show_name\
                                    from ENGINE_FIND_SYSTEM_BY_FULL_REF(?) fr\
                                         left join engine_systems es\
                                              left join engine_rights er on es.id_system = er.id_system\
                                           on fr.id_system = es.higher\
                                   group by 2 order by es.show_name ", params=[cfg.TERMINAL_link], fetch='all',
                             id_system=-1)
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    getSystems.exposed = True

    def getRoles(self):
        try:
            data = db.dbExec(sql="select er.role_name, list(eur.id_user) as id_user\
                                    from engine_roles er\
                                         left join engine_user_roles eur on er.id_role = eur.id_role\
                                   group by 1 order by er.role_name", params=[], fetch='all', id_system=-1)
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    getRoles.exposed = True

    # dtp детализация заданий по сотруднику
    def workTaskRateByEmpl(self):
        return self.drawTemplate(templ=worktaskratebyempl, data=[])

    workTaskRateByEmpl.exposed = True

    def listTaskTypeByPer(self, timebeg, timeend, users):
        try:
            data = self.dbExec(sql="select * from K_WORKTASK_TASKTYPES(?,?,?)", params=[timebeg, timeend, users],
                               fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    listTaskTypeByPer.exposed = True

    def ttDetail(self, ttid, timebeg, timeend, users):
        try:
            data = self.dbExec(sql="select * from K_WORKTASK_TTDETAIL(?,?,?,?)", params=[ttid, timebeg, timeend, users],
                               fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    ttDetail.exposed = True


    def listTask(self, ttid=None, tbeg=None, tend=None, manid=None, warehouses=None):
        try:
            data = self.dbExec(sql="select * from RBS_TASKVIEW_LISTTASK(?,?,?,?,?,?,?)",
                               params=[ttid, tbeg, tend, manid, None, '2', warehouses], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    listTask.exposed = True
