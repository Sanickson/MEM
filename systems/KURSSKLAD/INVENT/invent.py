# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon

#from systems.KURSSKLAD.mwdetail import MWDetail
from systems.KURSSKLAD.INVENT.templates.main import main as tmplmain
from systems.KURSSKLAD.ksprav import KSprav
from datetime_utils import formatMxDateTime

import simplejson as json


class Invent(KSprav):
    def index(self, id_system=None):
        WHCommon.index(self, id_system)
        self.setIfaceVar('wmsesid', self.GetKSessionID())
        return self.drawTemplate(templ=tmplmain, data=[])
    index.exposed = True

    def getTaskInfo(self, taskid):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_TASKINFO(?)', [taskid], 'one'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getTaskInfo.exposed = True

    def getSiteZone(self):
        return self.pyDumps(data=self.dbExec('select sz.ZONEID,sz.NAME from SITEZONE sz order by 2', fetch='all'))
    getSiteZone.exposed = True

    def waresGroup(self, wgid=None):
        data = self.dbExec(sql='select * from K_SP_WARESGROUPS_LISTGROUPS(?) order by NAME', params=[wgid], fetch='all')
        return self.pyDumps(data)
    waresGroup.exposed = True

    def locWares(self, wcode=None, wname=None, wbarcode=None):
        dSet = self.dbExecC(
            sql='select w.WARESID as WID, w.WARESCODE as WCODE, w.WARESNAME as WNAME from K_SPWARES_LOC(?,?,?) w order by w.WARESCODE',
            params=[wcode, wname, wbarcode], fetch='all')
        return self.pyDumps(data=dSet, ext_data={'wgid': ''})
    locWares.exposed = True

    def getInventMethod(self):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_GETTMETHOD', fetch='all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getInventMethod.exposed = True

    def getTasks(self, dbeg, dend, zoneid):
        try:
            data = self.dbExec(sql='select * from K_INVENT_GETTASK(?,?,?)', params=[dbeg, dend, zoneid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    getTasks.exposed = True

    def listObjectsData(self, catid=None, incname=None):
        return self.pyDumps(
            self.dbExec(sql="select * from sitezone left join getobjectname(objid,'03') on 1=1", params=[],
                        fetch='all'))
    listObjectsData.exposed = True

    def addTask(self, date, zoneid, methodid):
        try:
            data = self.dbExec(sql='select * from K_INVENT_ADDTASK(?,?,?,?)',
                               params=[date, zoneid, methodid, self.getIfaceVar('wmsesid')], fetch='one')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    addTask.exposed = True

    #def getWS(self):
    #    return self.pyDumps(self.dbExec(sql='select * from K_INVENT_GETWS',params=[],fetch='all'))
    #getWS.exposed = True

    # def getTaskWares(self,taskid,wsetid):
    # if wsetid == 'null': wsetid = None
    # return self.pyDumps(self.dbExec(sql='select * from K_INVENT_GETWARES(?,?) order by name',params=[taskid,wsetid],fetch='all'))
    # getTaskWares.exposed = True

    def getTaskWares(self, taskid, objid):
        return self.pyDumps(self.dbExec(sql='select * from WH_INVENT_GETWARES(?)', params=[taskid], fetch='all'))
    getTaskWares.exposed = True

    def changeStatus(self, taskid, mode):
        try:
            return self.pyDumps(self.dbExec('execute procedure K_INVENT_STATUS(?,?)', [taskid, mode], 'none'),
                                ext_data={'taskid': taskid})
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    changeStatus.exposed = True

    def addWares(self, waresid, taskid):
        try:
            return self.pyDumps(
                self.dbExec(sql='select * from K_INVENT_ADDWARES(?,?)', params=[waresid, taskid], fetch='one'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    addWares.exposed = True

    def delWares(self, waresid, taskid):
        try:
            return self.pyDumps(self.dbExec('execute procedure K_INVENT_DELWARES(?,?)', [waresid, taskid], 'none'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    delWares.exposed = True

    def editWares(self, taskwaresid, val):
        try:
            return self.pyDumps(
                self.dbExec(sql='update wm_task_wares set SUCCESSSCAN=? where taskwaresid=?', params=[val, taskwaresid],
                            fetch='none'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    editWares.exposed = True

    def getParentPallet(self, taskid):
        try:
            return self.pyDumps(self.dbExec(sql='select distinct gh.siteid,gh.code,gh.name\
                                                   from wm_task_pallet tp\
                                                        left join k_invent_gethigher(tp.siteid,?) gh on 1=1\
                                                  where tp.taskid = ?\
                                                  order by 3', params=['R', taskid], fetch='all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getParentPallet.exposed = True

    def getWaresPallet(self, siteid, taskid):
        try:
            return self.pyDumps(
                self.dbExec(sql='select * from K_INVENT_GETPALLET(?,?)', params=[siteid, taskid], fetch='all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getWaresPallet.exposed = True

    def getWaresOnPallet(self, palletid):
        try:
            return self.pyDumps(self.dbExec(sql="select * from K_TERM_PALLETWARES(?)", params=[palletid], fetch='all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getWaresOnPallet.exposed = True

    def searchWares(self, taskid, waresid):
        try:
            return self.pyDumps(
                self.dbExec(sql='select * from K_INVENT_GETWARESONE(?,?)', params=[taskid, waresid], fetch='all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    searchWares.exposed = True

    def getWaresLot(self, waresid):
        try:
            return self.pyDumps(self.dbExec(sql='select * from K_INVENT_GETWARESLOT(?)', params=[waresid], fetch='all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getWaresLot.exposed = True

    # Ход выполнения
    def getTaskProgress(self, taskid):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_GETTASKPROGRESS(?)', [taskid], 'all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getTaskProgress.exposed = True

    def getSiteProgress(self, taskid, siteid):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_GETSITEPROGRESS(?,?)', [taskid, siteid], 'all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getSiteProgress.exposed = True

    # Не инвентаризированные паллеты
    def getNotInventPallet(self, taskid):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_NOTINVENTPAL(?)', [taskid], 'all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getNotInventPallet.exposed = True

    # Не инвентаризированные паллеты (L)
    def getNotInventPalletL(self, taskid):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_L_NOTINVENTPAL(?)', [taskid], 'all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    getNotInventPalletL.exposed = True

    def listWaresSelGroup(self, taskid):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_WSELGROUP(?)', [taskid], fetch='all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    listWaresSelGroup.exposed = True

    def addSelWG(self, tid, sgid):
        try:
            return self.pyDumps(self.dbExec('execute procedure K_WH_INVENT_ADDSG(?,?)', [tid, sgid], 'none'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    addSelWG.exposed = True

    def waresByGroupLocateRest(self, taskid, wgid=None):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_WARES_BY_GROUP(?,?)',[taskid,wgid],'all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    waresByGroupLocateRest.exposed = True

    def notApprDocs(self,taskid):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_NOTAPPRDOCS(?)', [taskid], 'all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    notApprDocs.exposed = True

    def showTrash(self, taskid):
        try:
            return self.pyDumps(self.dbExec('select * from K_WH_INVENT_TRASH(?)', [taskid], 'all'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    showTrash.exposed = True

    def trashPalletWares(self, palletid, objid):
        try:
            params = [palletid, objid]
            return self.pyDumps(data = self.dbExec('select * from WH_INVENT_LISTWARESLOTS(?,?)', params, 'all'),
                                ext_data = {'palletid': palletid})
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    trashPalletWares.exposed = True

    def trashPalletClear(self, wlid, pid, tid):
        '''Очищение паллетов в корзине'''
        try:
            params = [wlid, pid, tid, self.getIfaceVar('wmsesid')]
            return self.pyDumps(self.dbExec('execute procedure WH_INVENT_TRASHPALLETCLEAR(?,?,?,?)',params,'none'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    trashPalletClear.exposed = True

    def qRestPoint(self, objid, wares):
        w = json.loads(wares)
        t = self.trans()
        try:
            rpid = t.dbExec(sql='select * from WH_RESTCONTROL_RESTPOINTSET(?,?)',
                            params=[objid, self.getIfaceVar('wmsesid')], fetch='one')['ID']
            for item in w:
                t.dbExec(sql='execute procedure WH_RESTCONTROL_RESTPOINTSETW(?,?,?,?,?)',
                         params=[rpid, item, w[item]['r'], w[item]['dt'], objid], fetch='none')
            t.dbExec(sql='execute procedure WH_RESTCONTROL_RESTPOINTEXP(?,?)',
                     params=[rpid, self.getUserVar('userfio')], fetch='one')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            t.commit()
            return self.pyDumps({'rpid': rpid})

    qRestPoint.exposed = True
