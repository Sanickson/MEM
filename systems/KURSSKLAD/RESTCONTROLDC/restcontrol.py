# -*- coding: utf-8 -*-
from systems.KURSSKLAD.ksprav import KSprav
from systems.KURSSKLAD.RESTCONTROLDC.templates.rest import rest
from systems.KURSSKLAD.RESTCONTROLDC.templates.restWares import restWares
from systems.KURSSKLAD.RESTCONTROLDC.templates.trashSite import trashSite
from systems.KURSSKLAD.RESTCONTROLDC.templates.trashPallet import trashPallet
from systems.KURSSKLAD.RESTCONTROLDC.templates.compareDocWLot import compareDocWLot
from systems.KURSSKLAD.RESTCONTROLDC.templates.trashPalletEgais import trashPalletEgais

from systems.KURSSKLAD.RESTCONTROLDC.templates.reportRestExport import reportRestExport



class TRestControl(KSprav):
    # настройки вкладок
    '''
        tabs = {
            'trashSite':'Корзина',
          'trashPallet':'Недоcтача',
                 'rest':'Остатки',
                 'restWares':'Остатки (МП)',
        }
    '''

    tabs = {
        'trashSite': _('Корзина'),
        'trashPallet': _('Недоcтача'),
        'rest': _('Остатки'),
        'restWares': _('Остатки (МП)'),
        'compareDocWLot': _('Сверка учетов'),
        'trashPalletEgais': _('ЕГАИС')
    }
    tabsSort = ('rest', 'restWares', 'trashSite', 'trashPallet', 'trashPalletEgais', 'compareDocWLot')

    def listZoneObjects(self):
        return self.pyDumps(data=KSprav.listZoneObjects(self, manid=self.GetKEmployeeID()),
                            ext_data={'OBJID': self.employeeObj()})

    listZoneObjects.exposed = True

    # def listZone(self):
    #     manid = self.GetKEmployeeID()
    #     return self.pyDumps(data=WHCommon.listZone(self, manid=manid),
    #                         ext_data={'ZONEID': self.employeeZone(employeeID=manid)})
    #
    # listZone.exposed = True

    def index(self, id_system=None):
        KSprav.index(self, id_system)
        self.setIfaceVar('wmsid', self.GetKSessionID())
        return self.rest()

    index.exposed = True

    def rest(self):
        return self.drawTemplate(templ=rest, data=[])

    rest.exposed = True

    def qRest(self, objid, zoneid):
        if not objid: objid = self.employeeObj()
        try:
            data = self.dbExec(sql='select * from K_RESTCONTROL_REST_DC(?,?)', params=[objid, zoneid], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data, ext_data={'OBJID': objid, 'ZONEID': zoneid})

    qRest.exposed = True

    def qRestWaresList(self, whid, szid=None, sgid=None):
        if szid == "None":
            szid = None
        if not whid: whid = self.employeeObj()
        try:
            data = self.dbExec(sql='select WID from WH_CORE_WARESLOTREST(?, null, ?,?)', params=[whid,sgid, szid], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data, ext_data={'OBJID': whid, 'SZID': szid})

    qRestWaresList.exposed = True

    def qRestWaresCalc(self, whid, szid=None, waresid=None):
        if (szid == "null") or (szid=='None'):
            szid = None
        try:
            data = self.dbExec(sql='select * from WH_RESTCONTROL_REST_ALL_DC(?,?,?)',
                               params=[whid, szid, waresid], fetch='one')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data, ext_data={'OBJID': whid, 'WARESID': waresid, 'SZID': szid})

    qRestWaresCalc.exposed = True

    def qRestPallet(self, objid, zoneid, wid, restcontroltype):
        if (zoneid == "null") or (zoneid=='None'):
            zoneid = None
        try:
            data = self.dbExec(sql='select * from K_RESTCONTROL_REST_DC_PAL(?,?,?,?)',
                               params=[objid, zoneid, wid, restcontroltype], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    qRestPallet.exposed = True

    def restWares(self):
        return self.drawTemplate(templ=restWares, data=[])

    restWares.exposed = True

    def qRestWares(self, objid, zoneid):
        try:
            data = self.dbExec(sql='select * from K_RESTCONTROL_REST_WARESLOT(?,?)', params=[objid, zoneid],
                               fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data, ext_data={'OBJID': objid, 'ZONEID': zoneid})

    qRestWares.exposed = True

    def trashSite(self):
        return self.drawTemplate(templ=trashSite, data=[])

    trashSite.exposed = True

    def qTrashSitePallets(self, objid, zoneid):
        try:
            data = self.dbExec(sql='select * from K_RESTCONTROL_TRASH_PALLETS(?,?)', params=[objid, zoneid],
                               fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data, ext_data={'OBJID': objid, 'ZONEID': zoneid})

    qTrashSitePallets.exposed = True

    def qTrashSitePalletWares(self, palletid, objid):
        try:
            data = self.dbExec(sql='select * from K_PALLET_LISTWARESLOTS(?,?)', params=[palletid, objid], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    qTrashSitePalletWares.exposed = True

    def trashPallet(self):
        return self.drawTemplate(templ=trashPallet, data=[])

    trashPallet.exposed = True

    def qTrashPalletWares(self, objid, zoneid):
        try:
            data = self.dbExec(sql='select * from K_RESTCONTROL_TRASH_PALLETWARES(?,?)', params=[objid, zoneid],
                               fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data, ext_data={'OBJID': objid, 'ZONEID': zoneid})

    qTrashPalletWares.exposed = True

    def qTrashPalletCreateDoc(self, objid):
        try:
            data = self.dbExec(sql='select * from K_RESTCONTROL_DOCINVCREATE(?,?)',
                               params=[objid, self.getIfaceVar('wmsid')], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    qTrashPalletCreateDoc.exposed = True

    def qTrashPalletWaresLots(self, waresid, objid):
        try:
            data = self.dbExec(sql='select * from K_RESTCONTROL_TRASH_PALWARESLOT(?,?)', params=[waresid, objid],
                               fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    qTrashPalletWaresLots.exposed = True

    def qTrashPalletTaskLot(self, wlotid):
        try:
            data = self.dbExec(sql='select * from K_RESTCONTROL_TRASH_TASKLOT(?)', params=[wlotid], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    qTrashPalletTaskLot.exposed = True

    def qRestExport(self, objid, restdate):
        if restdate == 'Null': restdate = None
        try:
            self.dbExec(sql='execute procedure WH_RESTCONTROL_EXPORT(?,?,?)',
                        params=[self.getUserVar('userfio'), objid, restdate], fetch='none')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data={'OBJID': objid})

    qRestExport.exposed = True

    def reportRestExport(self, objid, restdate):
        if restdate == 'Null': restdate = None
        wr = self.dbExec(sql='select * from WH_RESTCONTROLDC_DOCREST(?,?)', params=[objid, restdate], fetch='all')
        o = self.dbExec(sql="select fullname as objname from getobjectname(?,'03')", params=[objid], fetch='one')
        return self.drawTemplate(templ=reportRestExport, data=[wr, o, {'RDATE': restdate, 'OBJID': objid}])

    reportRestExport.exposed = True

    def compareDocWLot(self):
        return self.drawTemplate(templ=compareDocWLot, data=[])

    compareDocWLot.exposed = True

    def docWLWares(self, objid):
        if not objid: objid = self.employeeObj()
        try:
            data = self.dbExec(sql='select * from RBS_RESTCONTROL_COMPARE(?)', params=[objid], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data, ext_data={'OBJID': objid})

    docWLWares.exposed = True

    def getLostDocs(self, objid, waresid, dBeg, dEnd):
        try:
            data = self.dbExec(sql='select * from RBS_RESTCONTROL_LOST_DOCS(?,?,?,?)',
                               params=[waresid, objid, dBeg, dEnd], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data,
                            ext_data=self.getViewParams(waresid),
                            formats={'DOCDATE': '%d.%m.%Y'})

    getLostDocs.exposed = True

    def getFreeSelect(self, objid, waresid, dBeg, dEnd):
        try:
            data = self.dbExec(sql='select * from RBS_RESTCONTROL_TASK_WO_DOC(?,?,?,?)',
                               params=[waresid, objid, dBeg, dEnd], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data,
                            ext_data=self.getViewParams(waresid))

    getFreeSelect.exposed = True

    def getViewParams(self, waresid):
        params = self.dbExec(sql='select * from k_wh_viewq(?)', params=[waresid], fetch='one')
        return {'MAINUCODE': params['MAINUCODE'], 'MAINUFACTOR': params['MAINUFACTOR'],
                'VIEWUCODE': params['VIEWUCODE'], 'VIEWUFACTOR': params['VIEWUFACTOR']}
    

    def fixRestCompare(self, wid, wcode):
        try:
            self.dbExec(sql='execute procedure WH_FIX_RESTCOMPARE(?,?)',
                        params=[wid, wcode], fetch='none')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data={'res': 'OK'})

    fixRestCompare.exposed = True

    def trashPalletEgais(self):
        return self.drawTemplate(templ=trashPalletEgais, data=[])

    trashPalletEgais.exposed = True

    def qTrashPalletEgaisList(self, whid, egaisobj):
        try:
            if egaisobj == 'box':
                data = self.dbExec(sql='select * from WH_RESTCTRL_TRASHP_EGAISBOXLIST(?)', params=[whid], fetch='all')
            elif egaisobj == 'mark':
                data = self.dbExec(sql='select * from WH_RESTCTRL_TRASHP_EGAISMARKSEL(?)', params=[whid], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data, ext_data={'OBJID': whid, 'egaisobj': egaisobj})

    qTrashPalletEgaisList.exposed = True

    def qTrashPalletEgaisBoxData(self, whid, egaisid):
        try:
            data = self.dbExec(sql='select * from WH_RESTCTRL_TRASHP_EGAISBOXINF(?,?)',
                               params=[whid, egaisid], fetch='one')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    qTrashPalletEgaisBoxData.exposed = True

    def qTrashPalletEgaisMarkData(self, whid, egaisid):
        try:
            data = self.dbExec(sql='select * from WH_RESTCTRL_TRASHP_EGAISMARKINF(?,?)',
                               params=[whid, egaisid], fetch='one')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    qTrashPalletEgaisMarkData.exposed = True
