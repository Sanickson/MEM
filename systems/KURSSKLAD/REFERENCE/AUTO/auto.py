# -*- coding: utf-8 -*-
from systems.KURSSKLAD.REFERENCE.common import RCommon
from systems.KURSSKLAD.REFERENCE.AUTO.templates.main import main

class Auto(RCommon):

    def index(self, id_system=None):
        RCommon.index(self, id_system)
        return self.drawTemplate(templ=main, data=[])
    index.exposed = True
    
    def listAuto(self,aid=None):
        try:
            data = self.dbExec(sql="select * from K_AUTO_LISTAUTO(?)",params=[aid],fetch="all")
            #tutypes = self.dbExec(sql="select list('\"'||tutid||'\"'||':'||'\"'||name||'\"') from WH_TRANSPORT_UNIT_TYPE ",params=[],fetch="one")['list']
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listAuto.exposed = True
    
    def cngAuto(self,**kwargs):
        if not kwargs['aid']: kwargs['aid'] = None
        params = [kwargs['aid'],
                  kwargs['aname']  ]
        try:
            data = self.dbExecC(sql="select * from K_AUTO_CNGAUTO(?,?)",params=params,fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listAuto(data['ID'])
    cngAuto.exposed = True
    
    def delAuto(self,**kwargs):
        try:
            data=self.dbExec(sql="execute procedure K_AUTO_DELAUTO(?)",params=[kwargs['aid']],fetch="none")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={"AID":kwargs['aid']})
    delAuto.exposed = True

    def cngBarcode(self, aid=None):
        try:
            data = self.dbExecC(sql="execute procedure K_AUTO_CHGBARCODE(?)", params=[aid], fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listAuto()

    cngBarcode.exposed = True
