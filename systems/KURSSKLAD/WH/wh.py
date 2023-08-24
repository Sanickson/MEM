# -*- coding: utf-8 -*-

from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.WH.templates.main import main as tmplmain
import simplejson as json
import py_utils as pu

class WH(WHCommon):
    ifaceCode = 'WH'

    def index(self, id_system=None):  
        WHCommon.index(self, id_system)
        return self.drawTemplate(templ=tmplmain,data=[])
    index.exposed = True
    
    def getSiteSpecies(self):
        return self.pyDumps(self.dbExec(sql='select * from sitespecies',params=[],fetch='all'))
    getSiteSpecies.exposed = True
    
    def getSSOptions(self,ssid):
        return self.pyDumps(self.dbExec(sql="select * from SITESPECIES ss where ss.SITESPECIESID = ?",params=[ssid],fetch='one'))
    getSSOptions.exposed = True
    
    def saveSS(self,**kwargs):
        if kwargs['childspecies'] == 'null': kwargs['childspecies'] = None
        if kwargs['higher'] == 'null': kwargs['higher'] = None
        if kwargs['classname'] == 'null': kwargs['classname'] = None
        try: data = self.dbExec(sql="select * from RBS_WH_SAVESITESP(?,?,?,?,?,?)",
                params=[kwargs['ssid'],kwargs['classname'],kwargs['calcrest'],kwargs['canselect'],kwargs['higher'],kwargs['childspecies']],fetch='one')
        except Exception as exc: return self.pyDumps({'errMes':exc[1]})
        return self.pyDumps(data,ext_data={'ssid':kwargs['ssid']})
    saveSS.exposed = True
    
    def getParentSS(self):
        return self.pyDumps(self.dbExec(sql="select ss.sitespeciesid, ss.shortname from sitespecies ss where ss.higher is null",fetch='all'))
    getParentSS.exposed = True
    
    def delSS(self,ssid):
        try: data = self.dbExec(sql="delete from sitespecies ss where ss.sitespeciesid = ?",params=[ssid],fetch='none')
        except Exception as exc: return self.pyDumps({'errMes':exc[1]})
        return self.pyDumps(data,ext_data={'ssid':ssid})
    delSS.exposed = True
    
    def getWH(self, objid):
        if objid == 'null': objid = None
        return self.pyDumps(self.dbExec(sql='select * from RBS_WH_GETWAREHOUSE(?)',params=[objid],fetch='all'))
    getWH.exposed = True
    
    def createSklad(self, sklad, objid, editmode):
        if objid == 'null': objid = None
        sklad = json.loads(sklad)
        t = self.trans()
        try:
            for item in sklad:
                id = self.createSite(t, item, objid, editmode)
            if editmode == 'true':
                data = t.dbExec(sql='execute procedure COMPARE_SITE(?)', params=[None],fetch='none')
        except Exception as exc:
            #t.dbExec(sql='delete from site_tmp st where st.sessionid = ?', params=[self.GetKSessionID()],fetch='none')
            t.commit()
            return self.pyDumpsExc(exc=exc)
        #t.dbExec(sql='delete from site_tmp st where st.sessionid = ?', params=[self.GetKSessionID()],fetch='none')
        t.commit()
        return self.pyDumps(data={'siteid':id})
    createSklad.exposed = True
    
    def createSite(self, t, site, objid, editmode, parent=None):
        def coalesce(val, other):
            if val == 'null' or val == 'undefined' or val is None:
                return other
            else: 
                return val 
        if 'z' in site: z = site['z'] 
        else: z = None
        if 'classname' in site: classname = site['classname']
        else: classname = ''
        if 'subtype' in site: subtype = site['subtype']
        else: subtype = ''
        if editmode == 'false':
            id = t.dbExec(sql='select * from RBS_WH_CREATE_SITE(?,?,?,?,?,?,?,?,?,?,?,?)',
                    params=[
                        parent,
                        pu.format(site['name']),
                        pu.format(site['viewname']),
                        site['type'],
                        site['width'],
                        site['height'],
                        coalesce(site['x'],None),
                        coalesce(site['y'],None),
                        coalesce(z,1),
                        objid,
                        classname,
                        subtype
                    ],fetch='one')['SITEID']
        else:
            if 'id' in site: siteid = site['id']
            else: siteid = None
            id = t.dbExec(sql='select * from RBS_WH_SITE_TMP_INS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                    params=[
                        coalesce(siteid,None),
                        parent,
                        objid,
                        site['type'],
                        pu.format(site['name']),
                        site['height'],
                        site['width'],
                        None,
                        coalesce(site['x'],None),
                        coalesce(site['y'],None),
                        coalesce(z,1),
                        pu.format(site['viewname']),
                        None,
                        classname,
                        subtype
                    ],fetch='one')['SITEOUT']
        if 'children' in site:
            for item in site['children']:
                self.createSite(t, item, objid, editmode, id)
        return id
                
    def ajaxGetZones(self):
        return self.pyDumps(self.dbExec(sql='select * from RBS_WH_GETOBJ',params=[],fetch='all'))
    ajaxGetZones.exposed = True
    
    def listObjects(self, catid=None,incname=None):
        return self.pyDumps(WHCommon.listObjects(self,fields="lo.OBJID,lo.NAME",objtypes='C,D',objstatuses=None,catid=catid,namemask=incname,sqladd='order by lo.name'))
    listObjects.exposed = True
    
    def getDefStoreplace(self):
        return self.pyDumps(self.dbExec(sql="select * from sitespecies s where s.sitespeciesid = (select s.childspecies from sitespecies s where s.code = ?)",params=['L'],fetch='one'))
    getDefStoreplace.exposed = True
    
    def getStoreplaces(self):
        return self.pyDumps(self.dbExec(sql="select * from sitespecies s where s.higher = (select s.sitespeciesid from sitespecies s where s.code = ?)",params=['L'],fetch='all'))
    getStoreplaces.exposed = True
    
    def getSiteInfo(self, siteid):
        return self.pyDumps(self.dbExec(sql='select * from K_MONITORINGWH_SITE_S(?)',params=[siteid],fetch='one'))
    getSiteInfo.exposed = True
    
    def getSiteChild(self, siteid):
        return self.pyDumps(self.dbExec(sql='select * from K_MONITORINGWH_CHILD_S(?,?)',params=[siteid,''],fetch='all'))
    getSiteChild.exposed = True
    
    def getLChildren(self, siteid):
        return self.pyDumps(self.dbExec(sql='''select s.NAME, s.SITEID, ss.CODE, s.Z_COORD, coalesce(s.SWIDTH,1) as SWIDTH, coalesce(s.SLENGTH,1) as SHEIGHT  
                                                 from site s 
                                                      left join sitespecies ss on s.sitespeciesid=ss.sitespeciesid 
                                                where s.higher = ?''',params=[siteid],fetch='all'))
    getLChildren.exposed = True
    
    def deleteSklad(self, siteid):
        try:
            data = self.dbExec(sql='delete from site s where s.siteid=?', params=[siteid],fetch='none')
        except Exception as exc:
            return self.pyDumps({'errMes':exc[1]})
        return self.pyDumps(data)
    deleteSklad.exposed = True
    
    def getHiddenSite(self, siteid):
        data = self.dbExec(sql='select * from RBS_WH_HIDDENSITE(?)', params=[siteid],fetch='all')
        return self.pyDumps(data)
    getHiddenSite.exposed = True
    
    def getSite(self, siteid):
        data = self.dbExec(sql='''select s.siteid, sp.code, s.name,s.viewname,s.SWIDTH,s.SLENGTH,s.classname,s.subtype
                                    from site s
                                         left join sitespecies sp on sp.sitespeciesid = s.sitespeciesid
                                   where s.siteid = ?''', params=[siteid],fetch='one')
        return self.pyDumps(data)
    getSite.exposed = True
    
    def getSSsubType(self, type):
        data = self.dbExec(sql='select * from RBS_WH_GETSUBTYPES(?)', params=[type],fetch='all')
        return self.pyDumps(data)
    getSSsubType.exposed = True
