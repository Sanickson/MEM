# -*- coding: utf-8 -*-

from systems.KURSSKLAD.ksprav import KSprav
from systems.KURSSKLAD.REPORTS.WARESNOBARCODE.templates.waresbarcode import waresbarcode
from systems.KURSSKLAD.REPORTS.WARESNOBARCODE.templates.waresnobarcode import waresnobarcode

class WaresNoBarcode(KSprav):

    tabs = {
        'waresbarcode': 'Есть ШК',
        'waresnobarcode': 'Без ШК'
    }

    tabsSort = ('waresbarcode', 'waresnobarcode')

    def index(self, id_system=None):
        KSprav.index(self, id_system)
        return self.waresbarcode()

    index.exposed = True

    def waresbarcode(self):
        return self.drawTemplate(templ=waresbarcode, data=[])

    waresbarcode.exposed = True

    def waresnobarcode(self):
        return self.drawTemplate(templ=waresnobarcode, data=[])

    waresnobarcode.exposed = True

    def listZoneObjects(self):
        return self.pyDumps(data=KSprav.listZoneObjects(self, manid = self.GetKEmployeeID()),ext_data={'OBJID':self.employeeObj()})
    listZoneObjects.exposed = True

    def waresNoBarcodeList(self, barcode=None):
        d = self.dbExec(sql="select * from WH_WARESNOBARCODE_NOBARCODE(?)", params=[barcode], fetch='all')
        return self.pyDumps(data=d)

    waresNoBarcodeList.exposed = True

    def waresNoBarcodeWares(self, wgid, whid, barcode=None):
        d = self.dbExec(sql="select * from WH_WARESNOBARCODE_WARESINFO(?,?,?)", params=[wgid, whid, barcode], fetch='all')
        return self.pyDumps(data=d, ext_data={'WGID': wgid, 'WHID': whid})

    waresNoBarcodeWares.exposed = True

    def waresNoBarcodeAllWares(self, barcode=None):
        d = self.dbExec(sql="select * from WH_WARESNOBARCODE_ALLWARES(?)", params=[barcode], fetch='all')
        return self.pyDumps(data=d)

    waresNoBarcodeAllWares.exposed = True

