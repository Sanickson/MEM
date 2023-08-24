# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.LOADPLAN.templates.main import main
from conf.client_conf import planLoadEditPermission

class LoadPlan(WHCommon):
    editPermission = planLoadEditPermission

    def chkEditPermission(func):
        def wrapped(self, **kwargs):
            if not self.editPermission:
                return self.pyDumps(ext_data={'errMes': _('Интерфейс работает в усеченном режиме, редактирование запрещено!')})
            return func(self, **kwargs)
        return wrapped

    def index(self):
        super().index()
        manid = self.getUserInfo()['MANID']
        return self.drawTemplate(templ=main,
                                 data=[self.listZoneObjects(manid=manid),
                                       {'curzone': self.employeeObj(employeeID=manid)}])
    index.exposed = True

    def getCars(self):
        try:
            data = self.dbExec(sql="select * from rbs_loadplan_getcars",params=[],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    getCars.exposed = True
    
    def getCarDocs(self, task, car):
        try:
            data = self.dbExec(sql="select * from RBS_LOADPLAN_GETCARDOCS(?,?)",params=[car, task],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, formats={'DOCDATE':'%d.%m.%Y'})
    getCarDocs.exposed = True
    
    def getCarTasks(self, car):
        try:
            data = self.dbExec(sql="select * from RBS_LOADPLAN_GETCARTASKS(?)",params=[car],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, formats={'PLANDATETIME': '%d.%m.%Y %H:%M'})
    getCarTasks.exposed = True
    
    def getDocs(self, whid, date):
        try:
            data = self.dbExec(sql="select * from RBS_LOADPLAN_GETDOCS(?,?)",params=[whid, date],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    getDocs.exposed = True
    
    def addDocs(self, docs, car, task):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_add_doc(?,?,?)",
                               params=[docs, car, task], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    addDocs.exposed = True
    
    def getGates(self):
        try:
            data = self.dbExec(sql="select * from RBS_LOADPLAN_getgates",params=[],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    getGates.exposed = True
    
    def setGates(self, car, gateid):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_setgates(?,?)",
                               params=[car, gateid],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    setGates.exposed = True
    
    def statusUp(self, car):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_statusup(?)",params=[car],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    statusUp.exposed = True
    
    def numUp(self, task):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_NUMUP(?)",params=[task],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    numUp.exposed = True
    
    def numDown(self, task):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_NUMDown(?)",params=[task],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    numDown.exposed = True

    @chkEditPermission
    def addTask(self, car, date, gate):
        try:
            data = self.dbExec(sql="select * from RBS_LOADPLAN_addtask(?,?,?)",
                               params=[car, date, gate],fetch='one')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    addTask.exposed = True
    
    def editTask(self, task, date, gate):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_edittask(?,?,?)",
                               params=[task, date, gate],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    editTask.exposed = True
    
    def stopPlaning(self, task):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_stopplan(?)",
                               params=[task],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    stopPlaning.exposed = True
    
    def getCargo(self, doc):
        try:
            d = self.dbExec(sql="select NUMBER from DOCUMENT where docid=?",params=[doc],fetch='one')
            data = self.dbExec(sql="select * from WH_LOADPLAN_LISTCARGO(?)",params=[doc],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'DOCNUM': d['NUMBER']})
    getCargo.exposed = True

    @chkEditPermission
    def clearTask(self, task, ntask=None):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_cleartask(?,?)",
                               params=[task, ntask],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    clearTask.exposed = True

    @chkEditPermission
    def delTask(self, task):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_deltask(?)",
                               params=[task],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    delTask.exposed = True
    
    def chgPrior(self, task, prior):
        try:
            data = self.dbExec(sql="execute procedure RBS_LOADPLAN_chgprior(?,?)",
                               params=[task, prior],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    chgPrior.exposed = True