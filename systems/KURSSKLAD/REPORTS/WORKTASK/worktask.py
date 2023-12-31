# -*- coding: utf-8 -*-
#from systems.KURS.common import TCommon
#from systems.KURSSKLAD.REPORTS.WORKTASK.templates.index import index as maintmpl
#from systems.KURSSKLAD.REPORTS.WORKTASK.templates.worktaskdetail import worktaskdetail
from systems.KURSSKLAD.REPORTS.WORKTASK.templates.worktask import worktask
from systems.KURSSKLAD.REPORTS.WORKTASK.templates.worktaskbyempl import worktaskbyempl
from systems.KURSSKLAD.taskInfo import TaskInfo
#from systems.KURSSKLAD.TASKMANAGER.taskmanagerview import TaskManagerView


import conf.engine_conf as cfg
import db


class WorkTask(TaskInfo):
    useTaskWares = 0
    usePosCount = 0

    def index(self, id_system=None):
        TaskInfo.index(self, id_system)
        return self.workTask()

    index.exposed = True

    def workTask(self):
        return self.drawTemplate(templ=worktask,
                                 data=[{'useTaskWares': self.useTaskWares, 'usePosCount': self.usePosCount}])

    workTask.exposed = True

    def listTaskTypes(self):
        try:
            data = self.dbExec(sql="select tasktypeid as ttid,name from wm_tasktype where issystem='0'", params=(),
                               fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    listTaskTypes.exposed = True

    def listWorkers(self, timebeg, timeend, ttid=None, users=None):
        try:
            data = self.dbExec(sql="select * from K_WH_LIST_WORKERS_IN_PERIOD(?,?,?,?)",
                               params=(timebeg, timeend, ttid, users), fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'beg': timebeg, 'end': timeend, 'ttid': ttid})

    listWorkers.exposed = True

    def calcWorkerTask(self, timebeg, timeend, manid, ttid):
        try:
            data = self.dbExec(sql="select * from K_WH_WORKER_TASKDONE(?,?,?,?)",
                               params=(manid, timebeg, timeend, ttid), fetch='all')
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
    def workTaskByEmpl(self):
        return self.drawTemplate(templ=worktaskbyempl, data=[])

    workTaskByEmpl.exposed = True

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

    