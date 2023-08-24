# -*- coding: utf-8 -*-
import py_utils
from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.REPORTS.SALEPRIORITY.templates.index import index

class SalePriority(WHCommon):

    def index(self, id_system=None):
        WHCommon.index(self, id_system)
        self.setIfaceVar('manid',self.GetKEmployeeID())
        return self.drawTemplate(templ=index, data=[])
    index.exposed = True
    
    def getZone(self):
        return self.qSelGroup(self.employeeObj(self.getIfaceVar('manid')))
    getZone.exposed = True

    def getSalepriorityList(self, pr=None, zone=None):
        try:
            data = self.dbExec(sql="select * from K_WH_SALEPRIORITY_LIST(?,?)", params=[pr, zone], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data, ext_data={'pr':pr, zone:'zone'})
    getSalepriorityList.exposed = True

