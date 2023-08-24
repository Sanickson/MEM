# -*- coding: utf-8 -*-
#from base import BasePage
from systems.KURSSKLAD.ksprav import KSprav
from systems.KURSSKLAD.REPORTS.NOWARESSITE.templates.main import main as tmplmain

class NoWaresSite(KSprav):

    def index(self):
        super().index()
        return self.drawTemplate(templ=tmplmain, data=[]) 
    index.exposed = True
    
    def getObjects(self):
        data = self.listZoneObjects(self.GetKEmployeeID())
        ext_data = {'curzone': self.employeeObj(self.getIfaceVar('manid'))}
        return self.pyDumps(data=data, ext_data=ext_data)
    getObjects.exposed = True
    
    def report(self,objid):
        try:
            data = self.dbExec(sql="select * from WH_R_NOWARESSITE(?)", params=[objid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    report.exposed = True
    
    def siteWares(self, waresid):
        try:
            data = self.dbExec(sql="select * from K_RESTNOMOV_SITEWARES_S(?)", params=[waresid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    siteWares.exposed = True

    def waresExclusion(self):
        try:
            data = self.dbExec(sql="select * from WH_WARESNOSLOT_EXCLUSION_LIST", params=(), fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    waresExclusion.exposed = True

    def insertExclusion(self, wid):
        try:
            self.dbExec(sql="execute procedure WH_WARESNOSLOT_EXCLUSION_INS(?)", params=[wid], fetch='none')
        except Exception as exc:
            return self.pyDumps(exc=exc)
        return self.pyDumps(data={'res': 'OK'})

    insertExclusion.exposed = True

    def deleteExclusion(self, wid):
        try:
            self.dbExec(sql="execute procedure WH_WARESNOSLOT_EXCLUSION_DEL(?)", params=[wid], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data={'res': 'OK'})

    deleteExclusion.exposed = True