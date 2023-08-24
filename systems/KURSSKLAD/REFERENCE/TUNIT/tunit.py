# -*- coding: utf-8 -*-
from systems.KURSSKLAD.REFERENCE.common import RCommon
from systems.KURSSKLAD.REFERENCE.TUNIT.templates.main import main

class TUnit(RCommon):

    def index(self, id_system=None):
        RCommon.index(self, id_system)
        return self.drawTemplate(templ=main, data=[])
    index.exposed = True
    
    def listTUnit(self,tuid=None):
        try:
            data = self.dbExec(sql="select * from K_TUNIT_LISTTUNIT(?)",params=[tuid],fetch="all")
            tutypes = self.dbExec(sql="select list('\"'||tutid||'\"'||':'||'\"'||name||'\"') from WH_TRANSPORT_UNIT_TYPE ",params=[],fetch="one")['list']
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data,ext_data={'tutypes':tutypes})
    listTUnit.exposed = True
    
    def cngTUnit(self,**kwargs):
        if not kwargs['tuid']: kwargs['tuid'] = None
        params = [kwargs['tuid'],
                  kwargs['tuname'],
                  kwargs['tustatus'],
                  kwargs['tutype'],
                  kwargs['turegnum'],
                  kwargs['tusernum']]
        try:
            data = self.dbExecC(sql="select * from K_TUNIT_CNGTUNIT(?,?,?,?,?,?)",params=params,fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listTUnit(data['ID'])
    cngTUnit.exposed = True
    
    def delTUnit(self,**kwargs):
        try:
            data=self.dbExec(sql="execute procedure K_TUNIT_DELTUNIT(?)",params=[kwargs['tuid']],fetch="none")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={"TUID":kwargs['tuid']})
    delTUnit.exposed = True
    
    def tUnitHist(self,tuid,dbeg,dend):
        try:
            data=self.dbExec(sql="select * from K_TUNIT_HISTORY(?,?,?)",params=[tuid,dbeg,dend],fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data = data)
    tUnitHist.exposed = True
    
    '''
    def setDepartZone(self,objid,zname=None,szoneid=None):
        try:
            data=self.dbExecC(sql="select * from K_DEPART_CNGZONE(?,?,?)",params=[szoneid,objid,zname],fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    setDepartZone.exposed = True
    
    def listHigherDepart(self,incname=None):
        try:
            data = self.dbExec(sql="select depid as objid,name from DEPART where higher is null and name containing(?)",params=[incname],fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listHigherDepart.exposed = True
    '''