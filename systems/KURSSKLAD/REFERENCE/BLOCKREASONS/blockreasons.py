# -*- coding: utf-8 -*-
from systems.KURSSKLAD.REFERENCE.common import RCommon
from systems.KURSSKLAD.REFERENCE.BLOCKREASONS.templates.main import main

class Blockreasons(RCommon):

    def index(self, id_system=None):
        RCommon.index(self, id_system)
        return self.drawTemplate(templ=main, data=[])
    index.exposed = True
    
    def listBlockreasons(self, brid=None):
        try:
            data = self.dbExec(sql="select * from WH_BLOCKREASONS_LIST(?)", params=[brid], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listBlockreasons.exposed = True

    def delBlockreasons(self, **kwargs):
        try:
            self.dbExec(sql="execute procedure WH_BLOCKREASONS_DELETE(?)",params=[kwargs['brid']],fetch="none")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={"ID": kwargs['brid']})
    delBlockreasons.exposed = True
    
    def cngBlockreasons(self,**kwargs):
        params = [kwargs['brid'] if 'brid' in kwargs and kwargs['brid'] != '' else None, kwargs['name']]
        try:
            data=self.dbExecC(sql="select * from WH_BLOCKREASONS_CNG(?,?)", params=params, fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listBlockreasons(data['ID'])
    cngBlockreasons.exposed = True
