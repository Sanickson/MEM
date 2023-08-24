# -*- coding: utf-8 -*-
from base import BasePage
from systems.KURSSKLAD.common import WHCommon
#from systems.KURSSKLAD.taskInfo import TaskInfo
from systems.KURSSKLAD.REPORTS.SKLADSERVICE.templates.index import index



#class SkladService(WHCommon,TaskInfo):
class SkladService(WHCommon):
    
    def index(self):
        super().index()
        self.setIfaceVar('manid',self.GetKEmployeeID())
        return self.drawTemplate(templ=index, data=[])
    index.exposed = True
    
    # def listObjects(self, incname):
    #     return self.pyDumps(data=super().listObjectsC(objtypes='C', namemask=incname))
    # listObjects.exposed = True
    
    def getObjects(self):
        manid = self.getUserInfo()['MANID']
        return self.pyDumps(data=self.listZoneObjects(manid), ext_data={'curzone': self.employeeObj(manid)})
    getObjects.exposed = True

    def listObjects(self, catid=None,incname=None):
        return self.pyDumps(super().listObjects(fields="lo.OBJID,lo.NAME",objtypes='C,D',catid=catid,namemask=incname,sqladd='order by lo.name'))
    listObjects.exposed = True
    
    def skladServByDate(self,dbeg,dend,toobj, objid):
        #if fromobj == 'null' or not fromobj: fromobj = None
        if toobj == 'null': toobj = None
        if objid == 'null': objid = None
        if not objid: objid = None
        ext_data = {'dbeg':dbeg,'dend':dend,'fromobj': objid, 'toobj':toobj}
        try:
            data=self.dbExec(sql="select * from K_WH_SKLADSERVICE_BYDATE(?,?,?,?)",
                             params=[dbeg, dend, objid, toobj], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data,ext_data=ext_data)
    skladServByDate.exposed = True
    
    def skladServByCompany(self, dbeg, dend, toobj, objid):
        # if fromobj == 'null': fromobj = None
        if toobj == 'null': toobj = None
        if objid == 'null': objid = None
        if not objid: objid = None
        ext_data = {'dbeg':dbeg,'dend':dend,'fromobj': objid,'toobj':toobj}
        try:
            data=self.dbExec(sql="select * from K_WH_SKLADSERVICE_BYCOMPANY(?,?,?,?)",params=[dbeg,dend,objid,toobj],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data,ext_data=ext_data)
    skladServByCompany.exposed = True
    
    def skladServDocs(self,dbeg,dend, objid,toobj):
        #if fromobj == 'null' or fromobj: fromobj = None
        if toobj == 'null': toobj = None
        if objid == 'null': objid = None
        if not objid: objid = None
        try:
            data=self.dbExec(sql="select * from K_WH_SKLADSERVICE_DOCS(?,?,?,?)", params=[dbeg, dend, objid, toobj], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    skladServDocs.exposed = True
    
    def skladServTasks(self,docid):
        try:
            data=self.dbExec(sql="select * from K_WH_SKLADSERVICE_TASKS(?)",params=[docid],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    skladServTasks.exposed = True
    
    def skladServTasksDetail(self,taskid):
        try:
            data=self.dbExec(sql="select * from K_WH_SKLADSERVICE_TASKSDET(?)",params=[taskid],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    skladServTasksDetail.exposed = True

    def getDocument(self, dbeg, dend, toobj, objid):
        if toobj == 'null': toobj = None
        if objid == 'null': objid = None
        if not objid: objid = None
        try:
            data = self.dbExec(sql="select * from K_WH_SKLADSERVICE_ALLDOCS(?,?,?,?)", params=[dbeg, dend, objid, toobj], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    getDocument.exposed = True
