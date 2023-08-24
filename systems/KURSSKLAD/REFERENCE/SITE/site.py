# -*- coding: utf-8 -*-
# Copyright (C), Skychko D.I., 2010

from systems.KURSSKLAD.kSite import kSite
from systems.KURSSKLAD.REFERENCE.SITE.templates.main import main as tmplmain


class Site(kSite):

    def index(self, id_system=None):  
        kSite.index(self, id_system)
        viewunit = self.dbExec(sql='select * from wm_config',params=[],fetch='one')['USEVIEWUNIT']
        if viewunit is None: viewunit = 0
        return self.drawTemplate(templ=tmplmain, data=[{'viewunit':viewunit}]) 
    index.exposed = True
    
    def ajaxGetWarehouses(self):
        try:
            data = self.dbExec(sql="select * from WH_SITE_LISTOBJ",params=[],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    ajaxGetWarehouses.exposed = True
    
    def getSiteZoneItems(self, siteid):
        try:
            data = self.dbExec(sql="select * from RBS_SITEONE_ITEMS_BY_SITE(?)",params=[siteid],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    getSiteZoneItems.exposed = True
    
    def getZones(self):
        try:
            data = self.dbExec(sql="select * from sitezone",params=[],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    getZones.exposed = True
    
    def addSiteZone(self, siteid, zoneid, withchild):
        try:
            data = self.dbExec(sql="select * from RBS_SITEONE_ITEMS_ADD(?,?,?)",params=[siteid, zoneid, withchild],fetch='one')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    addSiteZone.exposed = True
    
    def paramsSiteZone(self, szi, withchild):
        try:
            data = self.dbExec(sql="execute procedure RBS_SITEONE_ITEMS_UPD(?,?)",params=[szi, withchild], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    paramsSiteZone.exposed = True
    
    def delSiteZone(self, szi):
        try:
            data = self.dbExec(sql="execute procedure RBS_SITEONE_ITEMS_DEL(?)",params=[szi],fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    delSiteZone.exposed = True

    def setSiteMO2(self, rowid, parity, beginnum, endnum):
        if parity == 'all': parity = None
        try:
            data = self.dbExec(sql="execute procedure K_WH_SETSITEMO2(?,?,?,?)",
                               params=[rowid, parity, beginnum, endnum], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    setSiteMO2.exposed = True

    def setSiteMO3(self, rowid, parity, beginnum, endnum):
        if parity == 'all': parity = None
        try:
            data = self.dbExec(sql="execute procedure K_WH_SETSITEMO3(?,?,?,?)",
                               params=[rowid, parity, beginnum, endnum], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    setSiteMO3.exposed = True
