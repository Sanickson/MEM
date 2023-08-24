# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.cheetahutils import TimeStampToDate

from systems.KURSSKLAD.SELECT.templates.main import main as tmplmain

import db


class Select(WHCommon):
    dtCodes = 'SALE'
    SYS_TERMSELECT_NAME = '/KURSSKLAD/KURSTERM/SELECT'

    def index(self):
        super().index()
        return self.drawTemplate(templ=tmplmain, data=[])

    index.exposed = True

    def listObjects(self, incname=None):
        data = super().listObjects(objtypes='C,D', namemask=incname, sqladd='order by lo.NAME')
        return self.pyDumps(data=data)

    listObjects.exposed = True

    def listZoneObjects(self):
        data = super().listZoneObjects(manid=self.GetKEmployeeID())
        return self.pyDumps(data=data, ext_data={'OBJID': self.employeeObj()})

    listZoneObjects.exposed = True

    def listClients(self, objid):
        try:
            data = self.dbExecC(sql='select * from K_SELMANAG_LISTCLIENTS(?,?)', params=[objid, self.dtCodes],
                                fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'OBJID': objid})

    listClients.exposed = True

    def listClientDocs(self, objid, clid, cldate):
        try:
            data = self.dbExecC(sql='select * from K_SELMANAG_LISTCLIENTDOCS(?,?,?,?)',
                                params=[objid, clid, cldate, self.dtCodes], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'OBJID': objid, 'CLID': clid})

    listClientDocs.exposed = True

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

    def selectCargo(self, docid):
        try:
            cg = self.dbExecC(sql="select * from K_WH_SELECT_DOC_MAP_EX(?)", fetch='all', params=[docid])
            d = self.dbExecC(sql="select * from document d where d.docid=?", fetch='one', params=[docid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=cg, ext_data={'docid': docid, 'docnum': d['NUMBER'],
                                               'docdate': TimeStampToDate(d['REALDOCDATE'])})

    selectCargo.exposed = True

    def listClientTaskes(self, objid, clid, cldate):
        try:
            data = self.dbExecC(sql='select * from K_SELMANAG_LISTCLIENTTASKES(?,?,?,?)',
                                params=[objid, clid, cldate, self.dtCodes], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'OBJID': objid, 'CLID': clid})

    listClientTaskes.exposed = True

    def listTaskWares(self, tid):
        try:
            tw = self.dbExecC(sql="select * from K_WH_SELECT_TASK_MAP_EX(?)", fetch='all', params=[tid])
            t = self.dbExecC(sql="select * from K_WH_TASKINFO(?)", fetch='one', params=[tid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=tw,
                            ext_data={'tid': tid, 'docnum': t['DOCNUM'], 'docdate': TimeStampToDate(t['DOCDATE'])})

    listTaskWares.exposed = True

    def listTaskes(self, fromid, dBeg, dEnd, toid=None, sgid=None):
        if toid == 'null': toid = None
        try:
            t = self.dbExecC(sql="select * from K_SELMANAG_LISTTASKES(?,?,?,?,?,?)", fetch='all',
                             params=[fromid, toid, dBeg, dEnd, self.dtCodes, sgid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=t)

    listTaskes.exposed = True

    def listWorkers(self):
        users = db.dbExec(
            sql="select ID_USER,max(FIO) as FIO,min(BTIME) as BTIME from EQUIP_SYSTEM_ACTIVEUSERS(?,Null) group by ID_USER",
            params=[self.SYS_TERMSELECT_NAME], fetch='all', id_system=-1)
        dset = []
        for user in users['datalist']:
            kinfo = self.dbExec(sql="select * from K_SELECT_CALC_USERINFO(?)", params=[user['ID_USER']], fetch='one')
            dset.append(
                {'ID_USER': user['ID_USER'], 'FIO': user['FIO'], 'BTIME': user['BTIME'], 'OBJID': kinfo['OBJID'],
                 'TID': kinfo['TID'], 'PER': kinfo['PER'], 'QA': kinfo['QA']})
        return self.pyDumps(data=dset)

    listWorkers.exposed = True

    def setWorker(self, tid, eid):
        task = self.dbExec(sql="select * from K_SELECT_SET_WORKER(?,?)", params=(tid, eid), fetch='all')
        ext_data = {'tid': tid, 'eid': eid}
        if eid and str(eid) != '0':
            worker = self.dbExec(sql="select fullname as fio from getobjectname(?,'03')", params=(eid,), fetch='one')
            ext_data['fio'] = worker['fio']
        else:
            ext_data['fio'] = ''
        return self.pyDumps(data=task, ext_data=ext_data)

    setWorker.exposed = True

    def taskToSelect(self, taskid):
        data = self.dbExec(sql="select * from K_SELECT_TASKTOSELECT(?)", fetch='one', params=[taskid])
        return self.pyDumps(data=data)

    taskToSelect.exposed = True
