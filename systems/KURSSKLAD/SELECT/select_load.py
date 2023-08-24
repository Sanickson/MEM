# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.cheetahutils import TimeStampToDate

from systems.KURSSKLAD.SELECT.templates.main_load import main_load as tmplmain

import db

class Select(WHCommon):

    SYS_TERMSELECT_NAME = '/KURSSKLAD/KURSTERM/SELECT'
    dtCodes = 'SALE->PiH'
    
    def index(self, id_system=None):
        super().index()
        return self.drawTemplate(templ=tmplmain, data=[])
    index.exposed = True
    
    def listObjects(self, incname=None):
        return self.pyDumps( super().listObjects(objtypes='C,D',namemask=incname,sqladd='order by lo.NAME') )
    listObjects.exposed = True
    
    def listZoneObjects(self):
        return self.pyDumps(data=super().listZoneObjects(manid = self.GetKEmployeeID()), ext_data={'OBJID': self.employeeObj()})
    listZoneObjects.exposed = True

    def listClients(self, objid):
        try:
            data = self.dbExecC(sql='select * from K_SELMANAG_LISTCLIENTS(?,?)',params=[objid,self.dtCodes], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data = data, ext_data={'OBJID':objid})
    listClients.exposed = True
    
    def listTaskGateAuto(self):
        try:
            data = self.dbExecC(sql='select * from WH_SELECT_GATEAUTOLIST',params=[], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data = data)
    listTaskGateAuto.exposed = True
    
    def listClientDocs(self, objid, clid, cldate):
        try:
            data = self.dbExecC(sql='select * from K_SELMANAG_LISTCLIENTDOCS(?,?,?,?)',params=[objid,clid,cldate,self.dtCodes], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data = data, ext_data={'OBJID':objid,'CLID':clid})
    listClientDocs.exposed = True

    def listGateAutoDoc(self, taskid,status=None):
        try:
            data = self.dbExec(sql="select * from WH_SELMANAG_LISTTASKDOCS(?,?)",params=[taskid,status],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listGateAutoDoc.exposed = True
    
    def docSelectPreview(self, docid):
        try:
            d = self.dbExecC(sql='select * from K_SELECT_DOCINFO(?)', params=[docid], fetch='one')
            data = self.dbExecC(sql="select * from WH_SELMNGR_CREATESELECT_PVIEW(?)", fetch='all', params=[docid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'DOCID': docid, 'DOCNUM': d['DOCNUM'], 'RDOCDATE': TimeStampToDate(d['RDOCDATE'])})

    docSelectPreview.exposed = True

    def docToSelect(self, docid):
        try:
            d = self.dbExecC(sql='select * from K_SELMANAG_DOCTOSELECT(?)', params=[docid], fetch='one')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=d)

    docToSelect.exposed = True
    
    def selectCargo(self,docid):
        try: 
            cg = self.dbExecC(sql="select * from K_WH_SELECT_DOC_MAP_EX(?)",fetch='all',params=[docid])
            d = self.dbExecC(sql="select * from document d where d.docid=?",fetch='one',params=[docid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=cg,ext_data={'docid':docid,'docnum':d['NUMBER'],'docdate':TimeStampToDate(d['REALDOCDATE'])})
    selectCargo.exposed = True
    
    def listClientTaskes(self, objid, clid, cldate):
        try:
            data = self.dbExecC(sql='select * from K_SELMANAG_LISTCLIENTTASKES(?,?,?,?)',params=[objid,clid,cldate,self.dtCodes], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data = data, ext_data={'OBJID':objid,'CLID':clid})
    listClientTaskes.exposed = True

    def listGateAutoTaskes(self, taskid):
        try:
            data = self.dbExecC(sql='select * from WH_SELMANAG_GATEAUTOTASKES(?)',params=[taskid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data = data)
    listGateAutoTaskes.exposed = True
    
    def listTaskWares(self,tid):        
        try:
            tw = self.dbExecC(sql="select * from K_WH_SELECT_TASK_MAP_EX(?)",fetch='all',params=[tid] )
            t = self.dbExecC(sql="select * from K_WH_TASKINFO(?)",fetch='one',params=[tid] )
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=tw,ext_data={'tid':tid,'docnum':t['DOCNUM'],'docdate':TimeStampToDate(t['DOCDATE'])})
    listTaskWares.exposed = True
    
    def listTaskes(self, whid, dBeg, dEnd, toid=None, sgid=None):
        if toid=='null':
            toid = None
        try:
            t = self.dbExecC(sql="select * from K_SELMANAG_LISTTASKES(?,?,?,?,?,?)",fetch='all',params=[whid,toid,dBeg,dEnd,self.dtCodes,sgid] )
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=t)
    listTaskes.exposed = True

    def listTaskesTid(self, taskid, carlic):
        try:
            t = self.dbExecC(sql="select * from WH_SELMANAG_LISTTASKES(?)",fetch='all',params=[taskid] )
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=t, ext_data={'GATETASK': taskid, 'CARLIC': carlic})
    listTaskesTid.exposed = True
    
    
    def listWorkers(self):
        users = db.dbExec(sql="select ID_USER,max(FIO) as FIO,min(BTIME) as BTIME from EQUIP_SYSTEM_ACTIVEUSERS(?,Null) group by ID_USER", params=[self.SYS_TERMSELECT_NAME], fetch='all', id_system=-1)
        dset = []
        for user in users['datalist']:
            kinfo = self.dbExec(sql="select * from K_SELECT_CALC_USERINFO(?)", params=[user['ID_USER']], fetch='one')
            dset.append({'ID_USER':user['ID_USER'],'FIO':user['FIO'],'BTIME':user['BTIME'],'OBJID':kinfo['OBJID'],'TID':kinfo['TID'],'PER':kinfo['PER'],'QA':kinfo['QA']})
        return self.pyDumps(data=dset)        
    listWorkers.exposed = True

    def setWorker(self, tid, eid):
        task = self.dbExec(sql="select * from K_SELECT_SET_WORKER(?,?)",params=(tid,eid), fetch='all')
        ext_data = {'tid':tid,'eid':eid}
        if eid and str(eid)!='0':
            worker = self.dbExec(sql="select fullname as fio from getobjectname(?,'03')",params=(eid,), fetch='one')
            ext_data['fio'] = worker['fio']
        else:
            ext_data['fio'] = ''
        return self.pyDumps(data=task,ext_data=ext_data)
    setWorker.exposed = True
    
    def taskToSelect(self, taskid):        
        return self.pyDumps(data=self.dbExec(sql="select * from K_SELECT_TASKTOSELECT(?)",fetch='one',params=(taskid,) ))
    taskToSelect.exposed = True    

    def listGates(self, taskid=None):
        try:
            data = self.dbExec(sql="select * from GATE_LIST(?)", params=[taskid], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'TASKID': taskid})
    listGates.exposed = True

    def gateAutoSetSite(self, gateid, taskid):
        try:
            self.dbExec(sql="update wm_task t set t.siteid=? where t.taskid=?", params=[gateid, taskid], fetch="none")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={'TASKID': taskid, 'GATEID': gateid})
    gateAutoSetSite.exposed = True