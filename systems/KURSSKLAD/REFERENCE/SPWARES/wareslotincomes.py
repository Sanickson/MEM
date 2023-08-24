# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon
class WaresLotIncomes(WHCommon):
    
    def listWaresLotInc(self,wid,objid):
        try:
            data = self.dbExec(sql="select * from K_WH_WARESLOTINC_WLOT(?,?) order by WLPRODUCTDATE",params=[wid,objid],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listWaresLotInc.exposed = True
    
    def listWaresLotIncDocsAll(self,wlid):
        try:
            data = self.dbExec(sql="select * from K_WH_WARESLOTINC_DOCSALL(?)",params=[wlid],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listWaresLotIncDocsAll.exposed = True
    
    def listWaresLotIncDocs(self,wlid):
        try:
            data = self.dbExec(sql="select * from K_WH_WARESLOTINC_DOCS(?)",params=[wlid],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data,ext_data={'modal':'1'})
    listWaresLotIncDocs.exposed = True
    
    def listWaresLotIncItems(self,wlid):
        try:
            data = self.dbExec(sql="select * from K_WH_WARESLOTINC_ITEMS(?)",params=[wlid],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listWaresLotIncItems.exposed = True
    
    def changeWaresLotIncSt(self, wlinid, status, reasonid=None, description=None):
        try:
            data = self.dbExecC(sql="select * from K_WH_WARESLOTINC_CHGSTAT(?,?,?,?,?)", fetch='one',
                                params=[wlinid, status, self.GetKEmployeeID(), reasonid, description])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'wlinid': wlinid})
    changeWaresLotIncSt.exposed = True

    def listWaresLotIncomesBlockReasons(self):
        try:
            data = self.dbExec(sql="select * from wareslotincomes_blockreasons_s(?)", params=['H'], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listWaresLotIncomesBlockReasons.exposed = True