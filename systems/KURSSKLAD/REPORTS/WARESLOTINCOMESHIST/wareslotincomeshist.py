# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.REPORTS.WARESLOTINCOMESHIST.templates.inBlocking import inBlocking
from systems.KURSSKLAD.REPORTS.WARESLOTINCOMESHIST.templates.byPeriod import byPeriod

class WaresLotIncomeHist(WHCommon):

    tabs = {'inBlocking': _('Заблокированные'), 'byPeriod': _('За период')}
    tabsSort = ('inBlocking', 'byPeriod')

    def index(self, id_system=None):
        WHCommon.index(self, id_system)
        self.setIfaceVar('manid',self.GetKEmployeeID())
        return self.inBlocking()
    index.exposed = True
    
    def getObjects(self):
        return self.pyDumps(data=self.listZoneObjects(self.getIfaceVar('manid')),ext_data={'curzone':self.employeeObj(self.getIfaceVar('manid'))})
    getObjects.exposed = True

    def inBlocking(self):
        return self.drawTemplate(templ=inBlocking, data=[])
    inBlocking.exposed = True

    def qInBlocking(self, whid):
        try:
            data = self.dbExec(sql="select * from WH_RWARESLOTINCOMES_INBLOCK(?)", params=[whid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'whid': whid})

    qInBlocking.exposed = True

    def byPeriod(self):
        return self.drawTemplate(templ=byPeriod, data=[])
    byPeriod.exposed = True

    def qByPeriod(self, whid, bdate, edate):
        try:
            data = self.dbExec(sql="select * from WH_RWARESLOTINCOMES_BYPERIOD(?,?,?)",
                               params=[whid, bdate, edate], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'whid': whid, 'bdate': bdate, 'edate': edate})

    qByPeriod.exposed = True
