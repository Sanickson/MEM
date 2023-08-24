# -*- coding: utf-8 -*-

from systems.KURSSKLAD.ksprav import KSprav
from systems.KURSSKLAD.REPORTS.TURNWH.templates.main import main as maintmpl



class TurnWH(KSprav):
    def index(self, id_system=None, objid=None, name=None):
        KSprav.index(self, id_system)
        self.setIfaceVar('manid', self.GetKEmployeeID())
        return self.drawTemplate(templ=maintmpl, data=[])

    index.exposed = True

    def getObjects(self):
        self.dtid_income = self.dbExec(sql='select * from k_doctype_by_code(?,?)', params=['INCOME', '1'], fetch="one")['DTID']
        self.dtid_sale = self.dbExec(sql='select * from k_doctype_by_code(?,?)', params=['SALE', '1'], fetch="one")['DTID']
        return self.pyDumps(data=self.listZoneObjects(self.getIfaceVar('manid')),
                            ext_data={'curzone': self.employeeObj(self.getIfaceVar('manid'))})

    getObjects.exposed = True

    def getWares(self, objid, dbeg, dend):
        try:
            data = self.dbExec(sql='select * from K_WH_TURNWH_GETWARES(?)', params=[objid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'objid': objid, 'dbeg': dbeg, 'dend': dend})

    getWares.exposed = True

    def getWaresDetail(self, wid, objid, dbeg, dend):
        try:
            data = self.dbExec(sql='select * from CB_WH_TURNWH_GETWARESDET(?,?,?,?,?,?)',
                               params=[wid, objid, dbeg, dend, self.dtid_income, self.dtid_sale], fetch='one')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    getWaresDetail.exposed = True


    ################
    def getTurnWH(self, **args):
        if args['sdppm_min'] == 'null': args['sdppm_min'] = None
        if args['sdppm_max'] == 'null': args['sdppm_max'] = None
        if args['ovdd_max'] == 'null': args['ovdd_max'] = None
        if args['ovdd_min'] == 'null': args['ovdd_min'] = None
        params = [args['dbeg'], args['dend'], args['sdppm_min'], args['sdppm_max'], args['ovdd_min'], args['ovdd_max'],
                  args['objid']]
        try:
            data = self.dbExec(sql='select * from K_WH_TURNWH_GETDATA(?,?,?,?,?,?,?)', params=params, fetch='all')
            #pr = self.dbExec(sql='select TURNSKLAD_PR from config', fetch='one')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    getTurnWH.exposed = True
