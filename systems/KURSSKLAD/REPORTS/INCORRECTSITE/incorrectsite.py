# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.REPORTS.INCORRECTSITE.templates.index import index
from fdb import DatabaseError as FBExc

class IncorrectSite(WHCommon):

    def index(self, id_system=None):
        WHCommon.index(self, id_system)
        return self.drawTemplate(templ=index, data=[])
    index.exposed = True

    def errMesText(self, mes):
        return self.pyDumps({"errMes":mes[1]})

    errMesText.exposed = True

    def getObjects(self):
        return self.pyDumps(data=self.listZoneObjects(self.GetKEmployeeID()),ext_data={'curzone':self.employeeObj(self.getIfaceVar('manid'))})
    getObjects.exposed = True

    def IncorrectSiteList(self, whid):

        try:
            data_lst = self.dbExec(sql='select * from WH_INCORRECT_SITE_LIST(?)', params=[whid], fetch='all')
        except FBExc as exc:
            return self.errMesText(exc)

        return self.pyDumps(data=data_lst, ext_data={'whid': whid})

    IncorrectSiteList.exposed = True

