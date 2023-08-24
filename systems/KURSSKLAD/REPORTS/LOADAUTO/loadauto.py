# -*- coding: utf-8 -*-

from systems.KURSSKLAD.TASKMANAGER.taskmanagerview import TaskManagerView
from systems.KURSSKLAD.REPORTS.LOADAUTO.templates.index import index
#from systems.KURSSKLAD.REPORTS.WORKTASK.templates.worktaskdetail import worktaskdetail
#from systems.KURSSKLAD.REPORTS.WORKTASK.templates.worktask import worktask
#from systems.KURSSKLAD.REPORTS.WORKTASK.templates.worktaskbyempl import worktaskbyempl
#from systems.KURSSKLAD.taskInfo import TaskInfo


import conf.engine_conf as cfg
import db


class LoadAuto(TaskManagerView):
    tmplIndex = index

    def index(self, id_system=None):
        TaskManagerView.index(self, id_system)
        return self.loadAuto()

    index.exposed = True

    def loadAuto(self):
        return self.drawTemplate(templ=self.tmplIndex, data=[])

    loadAuto.exposed = True

    def getLoadAutoTask(self, dbeg, dend, autoid):
        try:
            data = self.dbExec('select * from WHR_LOADAUTO_GETTASKS(?,?,?)', [dbeg, dend, autoid], 'all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data, ext_data={'dbeg': dbeg, 'dend': dend, 'autoid': autoid})

    getLoadAutoTask.exposed = True

    def getLoadPalletTask(self, taskid):
        try:
            data = self.dbExec('select * from WHR_LOADAUTO_GETLOADPAL(?)', [taskid], 'all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data)

    getLoadPalletTask.exposed = True

    def getAuto(self):
        try:
            data = self.dbExec('select * from K_AUTO_LISTAUTO(?)', [None], 'all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data)

    getAuto.exposed = True

    def getLoadPalletTaskInfo(self, dbeg, dend, autoid, objid, toobj):
        if objid == 'null':
            objid = None
        try:
            data = self.dbExec('select * from WHR_LOADUATO_TASKINFO(?,?,?,?,?)', [dbeg, dend, autoid, objid, toobj],
                               'all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data)

    getLoadPalletTaskInfo.exposed = True