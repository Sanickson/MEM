# -*- coding: utf-8 -*-

#from base import BasePage
from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.KURSTERM.templates.whWaresSelGroup import whWaresSelGroup
import datetime
#import db
import fdb
import conf.engine_conf as cfg
import conf.client_conf as cl_cfg
import secure
from cp_utils import isTSD
from systems.KURSSKLAD.cheetahutils import TimeStampToDate

OLDTERM_Link = '/KURSSKLAD/KURSTERM/OLDTERM'
#KURSTERM_Link = '/KURSSKLAD/KURSTERM'

class TCommonTerm(WHCommon):
    helpSystem = True
    iFaceName = False
    dateMask = '__.__.__'
    tmplWaresSelGroup = whWaresSelGroup
    clientConf = cl_cfg

    def index(self, id_system=None):
        super().index(id_system=id_system)
        self.setIfaceVar('wmsid', self.whSesId())

    indexinit = index

    def isTSD(self):
        return isTSD()

    def fbExcText(self, exc):
        if type(exc) == fdb.ProgrammingError:
            spl = str(exc).split('\\n- ')
            if len(spl) > 4:
                return spl[4]
            else:
                return str(exc)
        elif type(exc) == fdb.DatabaseError:
            spl = str(exc).split('\\n- ')
            if len(spl) > 4:
                return spl[4]
            else:
                return str(exc)
        elif type(exc) == fdb.TransactionConflict:
            return _('Конфликт транзакций, попробуйте еще раз!')
        else:
            raise

    def drawTemplate(self,templ,data,**args):
        if self.iFaceName: data.append({'iFaceName':self.iFaceName})
        if self.helpSystem: data.append({'helpSystem':self.helpSystem})

        data.append(WHCommon.getUserInfo(self))
        return WHCommon.drawTemplate(self, templ, data, **args)
        
    def tasklist(self):
        #    system = db.dbExec(sql="select higher from ENGINE_SYSTEMS where id_system=?", params=[self.getIfaceVar('id_system')], fetch='one', id_system=-1)
        #    return self.drawSubsystemList(system['HIGHER'])
        if self.__module__ != __name__:
            # В интерфейсе - переходим в список старых терминальных интерфейсов
            link = OLDTERM_Link
        else:
            # в списке систем - в общий список терминальных интерфейсов
            link = cfg.TERMINAL_link #KURSTERM_Link
        link =  cfg.TERMINAL_link #KURSTERM_Link
        #system = db.dbExec(sql="select id_system from ENGINE_FIND_SYSTEM_BY_FULL_REF(?)", params=[link], fetch='one', id_system=-1)
        #raise cherrypy.HTTPRedirect(link + "/?id_system=" + str(system['id_system']))
        raise self.httpRedirect(link)
    tasklist.exposed = True

    
    def GetCurDate(self, shortYear=None, days=None):
        today = datetime.date.today()
        if days:
            today += datetime.timedelta(days=days)
        format = "%d.%m.%y" if shortYear else "%d.%m.%Y"
        return today.strftime(format=format)
    
    def kBarCodeInfo(self, barcode):
        return self.dbExec(sql='SELECT * FROM K_GET_BARCODE_INFO(?)',params=(str(barcode),),fetch='one')
        
    def whBarUserInfo(self, barcode, codes=None):
        return self.dbExec(sql='SELECT * FROM WH_BARCODE_INFO(?,?)', params=(str(barcode), codes), fetch='one')

    def whBarCodeInfo(self, barcode, codes=None):
        if (codes is None or codes.find('ENGINEUSER')>-1) and secure.term_verify_barcode(barcode):
            usr = self.dbExec(sql='select * from BARCODE_USER_INFO(?)', params=[barcode], fetch='one', id_system=-1)
            if usr and usr['RECORDID']:
                return usr
        return self.dbExec(sql='SELECT * FROM WH_BARCODE_INFO(?,?)', params=(str(barcode), codes), fetch='one')

    def whBarCodeWaresInfo(self, barcode, waresid=None):
        return self.dbExec(sql='SELECT * FROM WH_BARCODE_WARES_INFO(?,?)',
                           params=(str(barcode), waresid), fetch='all')

    def whBarCodeWaresWeightInfo(self, barcode, waresid=None):
        if waresid:
            return self.dbExec(sql='SELECT b.* FROM K_GET_BARCODE_WARESWEIGHT(?,Null) b where b.wid=?',
                               params=[str(barcode), self.Id(waresid)], fetch='all')
        else:
            return self.dbExec(sql='SELECT * FROM K_GET_BARCODE_WARESWEIGHT(?,Null)',
                               params=[str(barcode)], fetch='all')


    def GetPrefixByCode(self, code):
        return self.dbExec(sql='SELECT * FROM WM_GET_BARCODE_PREFIX_BY_CODE(?)', 
            params=(str(code),),fetch='one') 
        
    
    # Ветка под новый КУРС
    def kId(self, id):
        if id: return int(float(id))
        else: return None 
    
    def taskInfo(self, id):     
        return self.dbExec(sql="select * from K_WH_TASKINFO(?)",params=[self.kId(id)],fetch='one')
    
    def palletInfo(self, palletid):
        return self.dbExec(sql="select * from K_TERM_PALLETINFO(?)",params=[self.kId(palletid)],fetch='one')
        
    def autoInfo(self, id):
        return self.dbExec(sql="select * from WH_AUTOINFO(?)",params=[self.kId(id)],fetch='one')

    def transUnitInfo(self, id):
        return self.dbExec(sql="select * from WH_TRANSUNITINFO(?)",params=[self.kId(id)],fetch='one')
    
    def palletWares(self, palletid, dlName=None):
        ds = self.dbExec(sql="select * from K_PALLET_LISTWARES(?)",params=[self.kId(palletid)],fetch='all')
        if dlName:
            ds[dlName] = ds['datalist']
            del ds['datalist']
        return ds

    def siteInfo(self, siteid, proc = False):
        if proc:
            return self.dbExec(sql="select * from K_WH_SITEINFO(?)",params=[self.kId(siteid)],fetch='one')
        else:
            return self.dbExec(sql="select * from SITE s where s.siteid=?",params=[self.kId(siteid)],fetch='one')
    
    def siteTblInfo(self, siteid, proc = False):
        if proc:
            return self.dbExec(sql="select * from K_WH_SITEINFO(?)",params=[self.kId(siteid)],fetch='one')
        else:    
            return self.dbExec(sql="select * from SITE s where s.siteid=?",params=[self.kId(siteid)],fetch='one')
    
    def qSiteInfo(self, siteid):
        return self.dbExec(sql="select * from K_WH_SITEINFO(?)",params=[self.kId(siteid)],fetch='one')

    def getSitePallet(self, siteid):
        return self.dbExec(sql="select * from K_WARESSLOT_GET_SITEPALLET(?)",params=[self.kId(siteid)],fetch='one')['PALLETID']
    
    def waresInfo(self, waresid):
        return self.dbExec(sql="select * from K_WH_WARESINFO(?,?)",params=[self.kId(waresid), self.getIfaceVar('wmsid')],fetch='one')

    def objInfo(self, objid):
        return self.dbExec(sql="select * from WH_OBJINFO(?)",params=[self.kId(objid)],fetch='one')

    def waresType(self, waresid):
        return self.dbExec(sql="select * from K_GET_WARESTYPE(?)",params=[self.kId(waresid)],fetch='one')

    def waresInfoLastSupplier(self, waresid):
        return self.dbExec(sql='select * from K_WMS_WARES_LAST_SUPPLIER(?)',params=[self.kId(waresid)],fetch='one')
        
    def waresSiteInfo(self, waresid):
        return self.dbExec(sql='select * from K_WARESSITE_GET_BYWARES(?,?)',params=[self.kId(waresid), self.getIfaceVar('wmsid')],fetch='one')
    
    def waresUnitInfo(self, waresunitid):
        return self.dbExec(sql="select * from K_WH_WARESUNITINFO(?)",params=[self.kId(waresunitid)],fetch='one')
        
    #def waresInfoUnit(self, wid, uid):
    #    return self.dbExec(sql="select * from RBS_WARESINFOUNIT(?,?)",params=[self.kId(wid),self.kId(uid)],fetch='one')

    def wmSesZoneObj(self, wmsesid):
        return self.dbExec(sql="select * from K_WH_SESSIONZONEOBJ(?)",params=[self.kId(wmsesid)],fetch='one')
    
    def dbCurrentTimestamp(self):
        return self.dbExec(sql='select current_timestamp as ctm from wm_config',params=[],fetch='one')['ctm']
    
    def userGetMan(self, uid=None):
        if not uid:
            uid = self.getUserVar('uid')
        return self.dbExec(sql='select * from WH_USER_GETMAN(?)', params=[uid], fetch='one')

    def userGetManId(self, uid=None):
        man = self.userGetMan(uid=uid)
        return man['MANID'] if man else None


    def GetKSessionID(self, employeeID=None):
        if not employeeID: employeeID = self.userGetManId()
        if not employeeID: return None
        return self.dbExec(sql='select first(1) w.sessionid from wm_session w where w.objid=? order by w.connecttime desc',params=[employeeID],fetch='one')['sessionid']

    # получение настроек (под вопросом необходимость)
    def GetConfig(self,iface_code,variable):
        data = self.dbExec(sql="select * from RBS_GET_CONFIG(?,?)",params=[iface_code,variable],fetch="one")
        if data and data['VAL'] and data['VAL'] != 'false': return data['VAL']
        else: return None

    def mesAdd(self, mes, add):
        if mes: mes += '<br>'+add
        else: mes = add
        return mes
        
    def barcodeIsNewPallet(self,barcode):
        prefixes = self.dbExec(sql="select * from wm_prefix where usercode='PALLET'",params=[],fetch='all')
        for prefix in prefixes['datalist']:
            pos = barcode.find(prefix['prefix'])
            if pos > -1:
                number = barcode[(pos+1):]
                if number.isdigit(): return number
        return False
        
    #For HTTPRequest on TSD
    def DSetToXML(self, DSet):
        XML = '<?xml version="1.0"?> \n'
        XML += "<root> \n"
        for itemDSetName in DSet:
            XML += "    <dset> \n"
            XML += "        <title>"+str(itemDSetName)+"</title> \n"
            itemDSet=DSet[itemDSetName]
            if itemDSet:
                i = 1
                for item in itemDSet:
                    XML += "        <record> \n"
                    for desc in item._description:
                        descName = desc[fdb.DESCRIPTION_NAME]
                        if item[descName]:
                            XML += "            <"+descName+">"+str(item[descName])+"</"+descName+"> \n"
                        else:
                            XML += "            <"+descName+">None</"+descName+"> \n"
                    XML += "        </record> \n"
                    i += 1
            XML += "    </dset> \n"
        XML += "</root>"
        return XML
  
    def DictToXML(self, dict, title):
        XML = '<?xml version="1.0"?> \n'
        XML += "<root> \n"
        XML += "    <dset> \n"
        XML += "        <title>"+str(title)+"</title> \n"
        if dict:
            i = 1
            for item in dict:
                if dict[item]: XML += "<"+item+">"+str(dict[item])+"</"+item+"> \n"
                else: XML += "<"+item+">None</"+item+"> \n"
        XML += "    </dset> \n"
        XML += "</root>"
        return XML        
        
        
    def listWLNumbers(self, waresid, productdate, status=None, nocache=None):
        wln = self.dbExec(sql="select * from K_TERM_ININCOME_WLNUM_DEFAULTS(?,?,?)",params=[waresid,productdate,status],fetch='all')
        wln['listWLNumbers'] = wln['datalist']
        del wln['datalist']
        return self.DSetToXML(wln)
    listWLNumbers.exposed = True
    
    def sessionPalletChk(self, palletid, sessionid=None, url='main', flags='C'):
        if not sessionid: sessionid = self.getIfaceVar('wmsid')
        try: t = self.dbExec(sql="execute procedure WH_SESSION_CHKPALLET(?,?,?)",params=[sessionid,palletid,flags],fetch="none")
        except fdb.ProgrammingError as exc: 
            if url.find('?')>-1: url += '&'
            else: url += '?'            
            raise self.httpRedirect(url + 'mes=%s' % (self.fbExcText(exc)))
        
    def sessionSiteChk(self, siteid, sessionid=None, url='main', flags='C'):
        if not sessionid: sessionid = self.getIfaceVar('wmsid')
        try: t = self.dbExec(sql="execute procedure WH_SESSION_CHKSITE(?,?,?)",params=[sessionid,siteid,flags],fetch="none")
        except fdb.ProgrammingError as exc: 
            if url.find('?')>-1: url += '&'
            else: url += '?'
            raise self.httpRedirect(url + 'mes=%s' % (self.fbExcText(exc)))
            
    def sessionWaresChk(self, waresid, sessionid=None, typecode='INCOME', url='main', flags='C'):
        if not sessionid: sessionid = self.getIfaceVar('wmsid')
        try: t = self.dbExec(sql="execute procedure WH_SESSION_CHKWARES(?,?,?,?)",params=[sessionid,waresid,typecode,flags],fetch="none")
        except fdb.ProgrammingError as exc: 
            if url.find('?')>-1: url += '&'
            else: url += '?'
            raise self.httpRedirect(url + 'mes=%s' % (self.fbExcText(exc)))
            
    def objWaresIncomeZone(self, objid, waresid):
        return self.dbExec(sql="select * from WH_WARESOBJ_GETINCOMEZONE(?,?)",params=[waresid,objid],fetch="one")
        
    def waresListPallets(self, objid, waresid):
        return self.dbExec(sql="select * from WH_CORE_WARESLISTREST(?,?)",params=[objid,waresid],fetch="all")
            
    def objChkPallet(self, objid, palletid):
        try: self.dbExec(sql="execute procedure WH_CORE_OBJCHKPALLET(?,?)",params=[objid,palletid],fetch="none")
        except fdb.ProgrammingError as exc: return self.fbExcText(exc)
        else: return None
            
    def printerInfo(self, printerid):
        return self.dbExec(sql='select * from WH_PRINTER_INFO(?)',params=[self.kId(printerid)],fetch='one')
            
    def reportInfo(self, reportid=None, reportcode=None):
        if reportid is not None:
            reportid = self.kId(reportid)
        return self.dbExec(sql='select * from WH_REPORT_INFO(?,?)',params=[reportid, reportcode],fetch='one')

    def barcodeLike(self, barcode):
        return self.dbExec(sql='select * from WH_BARCODE_LIKE(?)', params=[barcode], fetch='one')['CODE']

    def theBarcodeCntLock(self, taskid, bctype):
        return self.dbExec(sql="select * from WH_THEBARCODE_CNTLOCK(?,?,?)",
                           params=[self.kId(taskid), self.getIfaceVar('wmsid'), bctype], fetch='one')

    def theBarcodeLastLock(self, taskid, bctype=None):
        return self.dbExec(sql="select * from WH_THEBARCODE_LASTLOCK(?,?,?)",
                           params=[self.kId(taskid), self.getIfaceVar('wmsid'), bctype], fetch='one')

    def whBarcodeGS1Info(self, barcode):
        if barcode:
            return self.dbExec(sql="select * from WH_TSD_BARCODE_GS1_INFO(?)", params=[barcode], fetch='one')

    def whBarcodeAlcoBoxInfo(self, barcode):
        if barcode:
            return self.dbExec(sql="select * from WH_TSD_ALCOBOX_BC_INFO(?)", params=[barcode], fetch='one')

    def whBarcodeAlcoMarkInfo(self, barcode):
        if barcode:
            return self.dbExec(sql="select * from WH_TSD_ALCOMARK_BC_INFO(?)", params=[barcode], fetch='one')

    def egaisBoxCntLock(self, taskid):
        return self.dbExec(sql="select * from EGAIS_BOX_CNTLOCK(?,?)",
                           params=[self.kId(taskid), self.getIfaceVar('wmsid')], fetch='one')

    def egaisBoxLastLock(self, taskid):
        return self.dbExec(sql="select * from EGAIS_BOX_LASTLOCK(?,?)",
                           params=[self.kId(taskid), self.getIfaceVar('wmsid')], fetch='one')

    def qWHSelGroupList(self, whid):
        return self.dbExec(sql='SELECT * FROM WH_SELGROUP_LISTFOROBJ(?)', params=[whid], fetch='all')

    def whWaresSelGroup(self, waresid, backurl, **args):
        whid = args['whid'] if 'whid' in args else self.getUserInfo()['WHID']
        href = args['href'] if 'href' in args else backurl + '&wgid='
        mes = args['mes'] if 'mes' in args else None
        l = sgid = None
        if 'sgid' in args:
            sgid = args['sgid']
        else:
            l = self.qWHSelGroupList(whid=whid)
            if l['datalist'] and len(l['datalist']) == 1 and 'autoredirect' in args:
                sgid = l['datalist'][0]['ID']
        if sgid:
            try:
                self.dbExec(sql='execute procedure WH_OBJWARES_SELGROUP_SET(?,?,?)',
                            params=[whid, waresid, sgid], fetch="none")
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect(backurl)
        if not l:
            l = self.qWHSelGroupList(whid=whid)
        w = self.waresInfo(waresid=waresid)
        o = self.objInfo(objid=whid)
        return self.drawTemplate(templ=self.tmplWaresSelGroup,
                                 data=[o, l, w, {'backurl': backurl, 'href': href, 'mes': mes}])

    def qPalletInfo(self, pid, palFlagsSessionChk=''):
        return self.dbExec(sql="select * from WH_PALLET_INFO(?,?,?)",
                           params=[pid, self.getIfaceVar('wmsid'), palFlagsSessionChk], fetch="one")

    def wlIncomeTitle(self, item):
        tlt = ''
        if 'SUPPLIER' in item._fields and item['SUPPLIER']:
            if tlt != '':
                tlt += '; Док: '
            tlt += item['SUPPLIER'] + ' ' + TimeStampToDate(item['DOCDATE']) + ' №' + item['DOCNUM']
        return tlt.replace('"', "'")

    def waresLotIncomeInfo(self, wlincomeid):
        return self.dbExec(sql="select * from WH_WARESLOTINCOME_INFO(?)", params=[self.kId(wlincomeid)], fetch='one')
