# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.common import TCommonTerm

#Import Templates
from systems.KURSSKLAD.KURSTERM.CHGZONE.templates.index import index

class TChgZone(TCommonTerm):
    helpSystem = True
    
    def index(self):
        super().index()
        raise self.httpRedirect('main')
    index.exposed = True
    
    def main(self, mes=None):
        wmsid = self.whSesId()
        if wmsid: 
            o = self.dbExec(sql="select objid as manid from wm_session wms where wms.sessionid=?",params=[wmsid],fetch="one")
            m = self.dbExec(sql="select fullname as fio from getobjectname(?,'03')",params=[o['manid']],fetch="one")
            cz = self.dbExec(sql="select currentzone as zoneid from employee e where e.employeeid = ?",params=[o['manid']],fetch="one")
            z = self.dbExec("select * from K_CNGZONE_LISTZONE(?)",params=[o['manid']],fetch="all")
        else:
            raise _('Нет рабочей сессии')
        return self.drawTemplate(templ=index,data=[o,m,cz,z,{'mes':mes,'reloadurl':'main'}])
    main.exposed = True
    
    def zone(self, mid, zid):
        try:
            self.dbExec(sql="update employee e set e.currentzone=? where e.employeeid=?",params=[zid,mid], fetch='none')
        except Exception as exc:
            mes=self.fbExcText(exc=exc)
        else:
            self.setUserInfo()
            mes = None
        return self.main(mes=mes)
    zone.exposed = True
        