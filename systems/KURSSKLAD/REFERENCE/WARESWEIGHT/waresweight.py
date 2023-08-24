# -*- coding: utf-8 -*-
from systems.KURSSKLAD.ksprav import KSprav
from systems.KURSSKLAD.REFERENCE.WARESWEIGHT.templates.main import main as tmplmain

class WaresWeight(KSprav):

    def index(self):
        super().index()
        return self.drawTemplate(templ=tmplmain, data=[])
    index.exposed = True

    def listBarcodes(self, objid=None, barcode=None):
        try:
            data = self.dbExec('select * from WH_WARESWEIGHTBARCODES_LIST(?,?)', params=[objid, barcode], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    listBarcodes.exposed = True

    def listObjects(self, incname=None):
        return self.pyDumps(super().listObjectsC(namemask=incname, sqladd='order by lo.name'))
    listObjects.exposed = True

    def addWBW(self, objid, waresid, mask, kg1, kg2, mg1, mg2):
        try:
            self.dbExec('execute procedure WH_WARESWEIGHTBARCODES_ADD(?,?,?,?,?,?,?)', fetch='none',
                        params=[objid, waresid, mask, kg1, kg2, mg1, mg2])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps({'isOk': '1'})

    addWBW.exposed = True

    def delWBW(self, wbwid):
        try:
            self.dbExec('execute procedure WH_WARESWEIGHTBARCODES_DEL(?)', fetch='none', params=[wbwid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps({'isOk': '1'})

    delWBW.exposed = True
