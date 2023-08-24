# -*- coding: utf-8 -*-
from systems.KURSSKLAD.taskInfo import TaskInfo
from systems.KURSSKLAD.REFERENCE.SELGROUP.templates.reference import reference
from systems.KURSSKLAD.REFERENCE.SELGROUP.templates.waresnoselgroup import waresnoselgroup
from systems.KURSSKLAD.ksprav import KSprav


class Selgroup(TaskInfo, KSprav):
        # настройки вкладок

    tabs = {
        'reference': 'Справочник',
        'waresnoselgroup': 'Товары без ГО'
    }

    tabsSort = ('reference', 'waresnoselgroup')


    def index(self, id_system=None):
        KSprav.index(self, id_system)
        return self.reference()
    index.exposed = True

    def waresnoselgroup(self):
        return self.drawTemplate(templ=waresnoselgroup, data=[])
    waresnoselgroup.exposed = True

    def reference(self):
        return self.drawTemplate(templ=reference, data=[])
    reference.exposed = True

    def listZoneObjects(self):
        return self.pyDumps(data=KSprav.listZoneObjects(self, manid = self.GetKEmployeeID()),ext_data={'OBJID':self.employeeObj()})
    listZoneObjects.exposed = True

    def listSelgroup(self):
        try:
            data = self.dbExecC('select * from K_WARES_SELGROUP_SEL', fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    listSelgroup.exposed = True

    def cngSelGroup(self, **kwargs):
        if kwargs['tutype'] == '':
            kwargs['tutype']=None

        if kwargs['tm_income'] == '':
            kwargs['tm_income']=None

        params = [kwargs['sgId'],
                  kwargs['sgCode'],
                  kwargs['sgName'],
                  kwargs['sgCap'],
                  kwargs['sgWght'],
                  kwargs['sgObjId'],
                  self.ajaxValidate(kwargs['sgTmId']),
                  self.ajaxValidate(kwargs['sgSelAccept']),
                  kwargs['sgAcceptTerm'],
                  self.ajaxValidate(kwargs['sgSaleTerm']),
                  kwargs['tutype'],
                  kwargs['tm_income'],
                  kwargs['selectmaxpos'] if 'selectmaxpos' in kwargs and kwargs['selectmaxpos'] else None,
                  self.ajaxValidate(kwargs['sgPreScan'])
                  ]
        #if params[6] == 'undefined':
        #    params[6] = None
        try:
            data = self.dbExecC('execute procedure K_WARES_SELGROUP_UPD(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', params=params, fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    cngSelGroup.exposed = True

    def addSelGroup(self, **kwargs):
        if kwargs['tutype'] == '':
            kwargs['tutype']=None

        if kwargs['tm_income'] == '':
            kwargs['tm_income']=None
        params = [kwargs['sgCode'],
                  kwargs['sgName'],
                  kwargs['sgCap'],
                  kwargs['sgWght'],
                  kwargs['sgObjId'],
                  self.ajaxValidate(kwargs['sgTmId']),
                  self.ajaxValidate(kwargs['sgSelAccept']),
                  kwargs['sgAcceptTerm'],
                  self.ajaxValidate(kwargs['sgSaleTerm']),
                  kwargs['tutype'],
                  kwargs['tm_income'],
                  kwargs['selectmaxpos'] if 'selectmaxpos' in kwargs and kwargs['selectmaxpos'] else None,
                  self.ajaxValidate(kwargs['sgPreScan'])
                  ]
        #if params[5] == 'undefined':
        #    params[5] = None
        try:
            data = self.dbExecC('select * from K_WARES_SELGROUP_INS(?,?,?,?,?,?,?,?,?,?,?,?,?)', params=params, fetch='one')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    addSelGroup.exposed = True

    def delSelGroup(self, **kwargs):
        try:
            data = self.dbExecC('execute procedure K_WARES_SELGROUP_DEL(?)', params=[kwargs['sgId']], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    delSelGroup.exposed = True

    def listObjects(self, catid=None, incname=None):
        return self.pyDumps(
            KSprav.listObjects(self, fields="lo.OBJID,lo.NAME", objtypes='C,D', objstatuses=None, catid=catid,
                                 namemask=incname, sqladd='order by lo.name'))

    listObjects.exposed = True

    def ajaxGetMethod(self):
        return self.pyDumps(self.dbExecC(sql="select * from wh_selgroup_listmethod", params=[], fetch='all'))

    ajaxGetMethod.exposed = True

    def ajaxGetObject(self):
        return self.pyDumps(self.dbExecC(sql="select * from wh_selgroup_listobject", params=[], fetch='all'))

    ajaxGetObject.exposed = True

    def ajaxGetSelAccept(self):
        return self.pyDumps(self.dbExec(sql="select * from wh_selgroup_selaccept", params=[], fetch='all'))

    ajaxGetSelAccept.exposed = True

    def ajaxGetPreScanWares(self):
        return self.pyDumps(self.dbExec(sql="select * from WH_SELGROUP_PRESCANWARES", params=[], fetch='all'))

    ajaxGetPreScanWares.exposed = True


    def ajaxGetTUType(self):
        return self.pyDumps(self.dbExec(sql="select * from WH_TRANSPORT_UNIT_TYPE_SEL", params=[], fetch='all'))

    ajaxGetTUType.exposed = True

    def ajaxGetTM_Income(self):
        return self.pyDumps(self.dbExec(sql="select * from WM_TASKMETHOD_INCOME_SEL", params=[], fetch='all'))

    ajaxGetTM_Income.exposed = True

    def waresByGroupSelAccept(self, objid, wgid=None):
        data = self.dbExec('select * from K_SELGROUP_WARESGROUP(?,?)', params=[wgid,objid], fetch='all')
        return self.pyDumps(data=data)
    waresByGroupSelAccept.exposed = True

    def waresByGroupLocateSG(self, wgid=None):
        dSet = self.dbExecC(sql='select count(WID) as AMOUNT, coalesce(g.wselgrid,0) as wselgrid, g.wselgrcode, g.wselgrname\
                                  from K_WH_SPWARES_BY_GROUP(?) g\
                                 group by g.wselgrid, g.wselgrname, g.wselgrcode\
                                 order by 1 desc', params=[wgid], fetch='all')
        return self.pyDumps(data=dSet)

    waresByGroupLocateSG.exposed = True

    def waresBySelGroupLocate(self, **kwargs):
        if kwargs['wsgid'] == '': kwargs['wsgid'] = None
        params = [kwargs['wgid'], kwargs['wsgid']]
        dSet = self.dbExecC(sql='select * from K_WH_SPWARES_BY_SELGR(?,?)', params=params, fetch='all')
        return self.pyDumps(data=dSet)

    waresBySelGroupLocate.exposed = True

    def waresBySelGroupSet(self, **kwargs):
        params = [kwargs['wgid'], kwargs['wsgids'], kwargs['setwsgid']]
        dSet = self.dbExecC(sql='execute procedure K_WH_SELGROUP_UPD(?,?,?)', params=params, fetch='none')
        return self.pyDumps(data=dSet)
    waresBySelGroupSet.exposed = True
    
    def setWaresSelAccept(self,wid,sacode,objid):
        try:
            return self.pyDumps(self.dbExec('execute procedure K_SELGROUP_SETWARESSA(?,?,?)', [wid, sacode, objid], 'none'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        setWaresSelAccept.exposed = True

    def setGroupSelAccept(self,wgid,sacode,objid):
        try:
            return self.pyDumps(self.dbExec('execute procedure K_SELGROUP_SETGROUPSA(?,?,?)', [wgid, sacode, objid], 'none'))
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
    setGroupSelAccept.exposed = True



    def ajaxWaresNoSelGroupListWG(self):
        d = self.dbExec(sql="select * from WH_SELGROUP_WARESNOSG_LISTWG", params=[], fetch='all')
        return self.pyDumps(data=d)

    ajaxWaresNoSelGroupListWG.exposed = True

    def ajaxWaresNoSelGroupWGWares(self, wgid, whid):
        d = self.dbExec(sql="select * from WH_SELGROUP_WARESNOSG_WGWARES(?,?)", params=[wgid, whid], fetch='all')
        return self.pyDumps(data=d, ext_data={'WGID': wgid, 'WHID': whid})

    ajaxWaresNoSelGroupWGWares.exposed = True

    def ajaxWaresSetSelgroup(self, waresid, selgroupid):
        d = self.dbExec(sql="select * from WH_SELGROUP_WARESSETSG(?,?)", params=[waresid, selgroupid], fetch='all')
        return self.pyDumps(data=d, ext_data={'SGID': selgroupid, 'WARESID': waresid})

    ajaxWaresSetSelgroup.exposed = True


    def useTaraWeightSet(self, sgid, utw):
        try:
            self.dbExecC('execute procedure WH_SELGROUP_USETARAWEIGHT_SET(?,?)', params=[sgid, utw], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data={'SGID': sgid, 'UTW': utw})

    useTaraWeightSet.exposed = True

    def taraList(self, sgid):
        try:
            data = self.dbExecC('select * from WH_WARES_SELGROUP_TARALIST(?)', params=[sgid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'SGID': sgid})

    taraList.exposed = True

    def taraAdd(self, sgid, waresid):
        try:
            self.dbExecC('execute procedure WH_WARES_SELGROUP_TARAADD(?,?)', params=[sgid, waresid], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.taraList(sgid=sgid)

    taraAdd.exposed = True

    def taraUpd(self, sgid, waresid, numorder):
        try:
            self.dbExecC('execute procedure WH_WARES_SELGROUP_TARAUPD(?,?,?)',
                         params=[sgid, waresid, numorder], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.taraList(sgid=sgid)

    taraUpd.exposed = True

    def taraDel(self, sgid, waresid):
        try:
            self.dbExecC('execute procedure WH_WARES_SELGROUP_TARADEL(?,?)', params=[sgid, waresid], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.taraList(sgid=sgid)

    taraDel.exposed = True
