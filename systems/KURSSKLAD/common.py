# -*- coding: utf-8 -*-
# Copyright (C) , 2009 Serov Alexander. 

from base import BasePage
import time

import conf.client_conf as cl_cfg

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText

def TimeStampToDateTime(timestamp):
    if timestamp is None: return '&nbsp;'
    sdate=str(timestamp).split('.')[0]
    sformatFrom='%Y-%m-%d %H:%M:%S'
    sdateTuple=time.strptime(sdate,sformatFrom)
    sformatTo='%d.%m.%Y %H:%M:%S'
    sdateStr=time.strftime(sformatTo,sdateTuple)
    return  sdateStr

from cherrypy import HTTPRedirect

class WHCommon(BasePage):

    httpRedirect = HTTPRedirect

    def dbDateTimePrep(self, dt):
        return dt.split('.')[0] if dt else None

    def listObjects(self,fields=None,objfiltid=None,objtypes=None,objstatuses=None,isowner=None,catid=None,objid=None,presentobjid=None,namemask=None,dt=None,flags=None,sqladd=None):
        """aobjfiltid integer, aobjtypes varchar(80), aobjstatuses varchar(80), aisowner char(1), acatid varchar(11), 
            aobjid integer, apresentobjid integer, anamemask varchar(120), adt date, flags varchar(10);
        returns: name varchar(255),code varchar(10),objid integer,objtype char(1),objtype_name varchar(80),objstatus char(1),
            status_name varchar(80),status_image varchar(10),date1 date,date2 date,descript blob sub_type 1 segment size 80,
            sessionid integer,username varchar(100),lastdate date,code_sort varchar(20))"""
        if fields is None: fields = 'lo.OBJID,lo.NAME'
        if sqladd is None: sqladd = '' 
        sql = 'select '+fields+' from LISTOBJECTS(?,?,?,?,?,?,?,?,?,?) lo '+sqladd
        return self.dbExecC(sql=sql,params=(objfiltid,objtypes,objstatuses,isowner,catid,objid,presentobjid,namemask,dt,flags),fetch="all")
    
    def listObjectsC(self,fields=None,objfiltid=None,objtypes=None,objstatuses=None,isowner=None,catid=None,objid=None,presentobjid=None,namemask=None,dt=None,flags=None,sqladd=None):
        if fields is None: fields = 'lo.OBJID,lo.NAME'
        if sqladd is None: sqladd = ''
        sql = 'select '+fields+' from LISTOBJECTS(?,?,?,?,?,?,?,?,?,?) lo '+sqladd
        return self.dbExecC(sql=sql,params=(objfiltid,objtypes,objstatuses,isowner,catid,objid,presentobjid,namemask,dt,flags),fetch="all")
    
    
    def selfObjects(self):
        cat = self.dbExec(sql="SELECT * FROM CATEGORY where CODE='SELF'",params=[],fetch='one')
        return self.listObjects(catid=str(cat['catid']))

        
    def getCatByCode(self, code):
        return self.dbExec(sql="SELECT * FROM CATEGORY WHERE CODE=?", params=[code], fetch='one')
        
    
    def getDocTypeStatuses(self, doctid=None, doctcode=None):
        return self.dbExec(sql='select * from K_GETDOCTYPESTATUSES(?,?)',params=(doctid,doctcode),fetch='all')
    
    
    def GetXMLParamValue(self, tasktype=None, taskmethod=None, zid=None, paramname=None, objid=None):
        if objid: return self.dbExec(sql='execute procedure WM_GETOBJPARAMVALUE(?,?,?,?,?)',params=(tasktype,taskmethod,zid,objid,paramname), fetch="one")['PARAMVALUE']
        else: return self.dbExec(sql='execute procedure WM_GETPARAMVALUE(?,?,?,?)',params=(tasktype,taskmethod, zid, paramname), fetch="one")['PARAMVALUE']

    
    def GetTTIDByCode(self, ttCode):
        return self.dbExec(sql='select tasktypeid from wm_tasktype where code=?',params=(ttCode,),fetch='one')['tasktypeid']
    
    
    def GetBarCodeInfo(self, barcode):
        return self.dbExec(sql='SELECT * FROM WM_GET_BARCODE_INFO(?)',params=(str(barcode),),fetch='one')
        
    def kBarCodeInfo(self, barcode):
        return self.dbExec(sql='SELECT * FROM K_GET_BARCODE_INFO(?)',params=(str(barcode),),fetch='one')
        
    def GetKEmployeeID(self, createraise = False):
        man = self.dbExec(sql='select id_man from k_users k where k.id_user = ?',params=[self.getUserVar('uid')],fetch='one')
        if createraise:
            if not man: raise "Не найдено физическое лицо!"
            else: return man['id_man']
        else:
            if man: return man['id_man']
            else: return None
        #return self.dbExec(sql='select id_man from k_users k where k.id_user = ?',params=[self.getUserVar('uid')],fetch='one')['id_man']
        
    def GetKSessionID(self, employeeID=None):
        if not employeeID: employeeID = self.GetKEmployeeID()
        if not employeeID: return None
        return self.dbExec(sql='select first(1) w.sessionid from wm_session w where w.objid=? order by w.connecttime desc',params=[employeeID],fetch='one')['sessionid']
        
    #Для многообъектных складов
    def isAdmin(self):
        sys_path = '/KURSSKLAD/REFERENCE/MAN'
        admin = 0
        if sys_path in self.getUserVar('granted_system_refs'): return 1
        else: return 0
        
    def employeeZone(self, employeeID=None):
        if not employeeID: employeeID = self.GetKEmployeeID()
        if not employeeID: return None
        zone = self.dbExec(sql='select currentzone from employee where employeeid = ?',params=[employeeID],fetch='one')
        if zone: return zone['currentzone']
        else: return None
    
    def employeeObj(self, employeeID=None):
        if not employeeID: employeeID = self.GetKEmployeeID()
        if not employeeID: return None
        zoneid = self.employeeZone(employeeID=employeeID)
        if not zoneid: return None
        obj = self.dbExec(sql='select objid from sitezone where zoneid = ?',params=[zoneid],fetch='one')
        if obj: return obj['objid']
        else: return None
    
    def listZoneObjects(self, manid=None):
        if manid:
            return self.dbExec(sql='select * from K_MAN_LISTZONEOBJECTS(?)',params=[manid],fetch='all')
        else: 
            return self.dbExec(sql='select distinct sz.objid,(select fullname from getobjectname(sz.objid,NULL)) as objname from sitezone sz',params=[],fetch='all')

    def qlistZone(self, manid=None):
        return self.dbExec(sql='select * from WH_LISTZONE(?)',params=[manid],fetch='all')
        
    def listZone(self, whid=None):
        manid = self.GetKEmployeeID()
        return self.pyDumps(data=self.qlistZone(manid=manid), ext_data={'ZONEID':self.employeeZone(employeeID=manid), 'WHID':whid})
    listZone.exposed = True

    def qSelGroup(self, whid):
        try:
            sg = self.dbExec(sql="select * from WH_SELGROUP_LISTFOROBJ(?)", params=[whid], fetch='all')
        except Exception as exc:
            return self.pyDumps(ext_data={'errMes': exc[1]})
        else:
            return self.pyDumps(data=sg, ext_data={'WHID': whid})

    qSelGroup.exposed = True

    def waresByGroupLocate(self, wgid=None):
        dSet = self.dbExec(sql='select WID,WCODE,WNAME,list(b.barcode) as WBARCODE \
                                  from K_WH_SPWARES_BY_GROUP(?) g \
                                  left join waresbarcode b on b.WARESUNITID=g.WUID \
                                 group by WID,WCODE,WNAME\
                                 order by WCODE',params=[wgid],fetch='all')
        return self.pyDumps(data=dSet)
    waresByGroupLocate.exposed = True
    
    def ajaxValidate(self, data):
        if (data =='' or data =='null' or data =='undefined'): data = None
        return data
        
    def drawTemplate(self, templ, data, **args):
        if hasattr(self,'ifaceCode'):
            conf = self.dbExec(sql='select * from RBS_CONFIG_IFACE where iface_code = ?',params=[self.ifaceCode],fetch='all')['datalist']
            data.append({'ifaceVariables':conf})
        return BasePage.drawTemplate(self, templ, data, **args)


    def coreQDocWares(self, docid):
        d = self.dbExecC(sql="select * from document d where d.docid=?", fetch='one', params=[docid])
        w = self.dbExec(sql='select * from WH_CORE_DOCWARES(?)', params=[docid], fetch='all')
        return self.pyDumps(data=w, ext_data={'docid': docid, 'docnum': d['NUMBER'],
                                              'docdate': chu.TimeStampToDate(d['REALDOCDATE'])})

    coreQDocWares.exposed = True

    def userWareHouses(self):
        return self.dbExec(sql='select * from WH_USER_LISTWH(?)', params=[self.getUserVar('uid')], fetch='all')

    def coreQUserWareHouses(self):
        try:
            wh = self.userWareHouses()
        except Exception as exc:
            return self.pyDumps(ext_data={'errMes': exc[1]})
        else:
            return self.pyDumps(wh)

    coreQUserWareHouses.exposed = True

    def palletWares(self, palletid, dlName=None):
        ds = self.dbExec(sql="select * from K_PALLET_LISTWARES(?)", params=[palletid], fetch='all')
        if dlName:
            ds[dlName] = ds['datalist']
            del ds['datalist']
        return ds

    def palletInfo(self, palletid):
        return self.dbExec(sql="select * from K_TERM_PALLETINFO(?)", params=[palletid], fetch='one')

    def coreQPalletWares(self, palletid):
        try:
            pw = self.palletWares(palletid)
            pi = self.palletInfo(palletid)
        except Exception as exc:
            return self.pyDumps(ext_data={'errMes': exc[1]})
        else:
            return self.pyDumps(data=pw, ext_data={'PID': palletid, 'PNUM': pi['PNUM'], 'SNAME': pi['SNAME']})

    coreQPalletWares.exposed = True

    def coreQTaskTypeList(self):
        try:
            data = self.dbExecC('select TASKTYPEID AS ID, NAME from WM_TASKTYPE order by NAME', fetch='all', params=[])
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    coreQTaskTypeList.exposed = True

    whusers = {}
    def getUserInfo(self, uid=None):
        uid = str(uid) if uid else str(self.getUserVar('uid'))
        if not uid in self.whusers:
            self.setUserInfo(uid)
        return self.whusers[uid]

    def setUserInfo(self, uid=None, ifonline=False):
        uid = str(uid) if uid else str(self.getUserVar('uid'))
        if not ifonline or uid in self.whusers:
            w = self.dbExec(sql='select * from WH_USER_INFO(?)', params=[uid], fetch='one')
            self.whusers[uid] = {
                'ZONEID': w['ZID'],
                'ZONENAME': w['ZNAME'],
                'WHID': w['WHID'],
                'MANID': w['MANID'],
                'SESID': w['SESID']
            }

    def whSesId(self):
        # sesId = self.getSesVar('wmsid')
        # if not sesId:
        #     sesId = self.GetKSessionID()
        #     if not sesId:
        #         raise _('Не настроена wmSessionId пользователя')
        #     else:
        #         self.setSesVar('wmsid', sesId)
        # return sesId
        return self.getUserInfo()['SESID']


    def send_email(self, mailto=None, subj=None, msg=None, htmlreport=None, filename=None, subtype=None):

        try:
            if cl_cfg.smtp_ssl:
                serverSMTP = smtplib.SMTP_SSL(host=cl_cfg.smtp_server, port=cl_cfg.smtp_port, timeout=2)
            else:
                serverSMTP = smtplib.SMTP(host=cl_cfg.smtp_server, port=cl_cfg.smtp_port, timeout=2)
                serverSMTP.starttls()
            serverSMTP.login(cl_cfg.smtp_username, cl_cfg.smtp_password)
        except Exception as exc:
            return 'Ошибка подключения к smtp серверу: %s' % cl_cfg.smtp_server
        else:
            message = MIMEMultipart('alternative')
            # message['Subject'] = unicode(subj, "windows-1251").encode("utf-8")
            message['Subject'] = subj
            message['From'] = cl_cfg.smtp_from

            if type(mailto) is list:
                message['To'] = '; '.join(mailto)
            else:
                message['To'] = mailto
                mailto = mailto.split(';')

            html = MIMEText(msg, 'html', 'windows-1251')
            message.attach(html)

            if htmlreport and subtype:
                # fo = open(pathfile, 'rb')
                attach = MIMEApplication(htmlreport, _subtype=subtype)
                # fo.close()
                attach.add_header('Content-Disposition', 'attachment', filename=filename+'.'+subtype)
                message.attach(attach)

            ''' отправка '''

            try:
                serverSMTP.sendmail(cl_cfg.smtp_from, mailto, message.as_string())
            except Exception as exc:
                serverSMTP.quit()
                return "Ошибка отправки e-mail"

            serverSMTP.quit()
            return False

    send_email.exposed = True


    def pallettypelist(self, flag):
        try:
            ptl = self.dbExec(sql="select * from WH_PALTYPELIST(?)", params=[flag],
                             fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=ptl, ext_data={})

    pallettypelist.exposed = True

    def waresGroup(self, wgid=None):
        data = self.dbExec(sql='select * from K_SP_WARESGROUPS_LISTGROUPS(?) order by NAME',params=[wgid],fetch='all')
        return self.pyDumps(data)
    waresGroup.exposed = True

    def qRestListWares(self, whid, **args):
        paramitems = ['sgid', 'wgid', 'szid']
        params = [whid]
        for item in paramitems:
            if not item in args or args[item] == 'None':
                args[item] = None
            params.append(args[item])

        try:
            sg = self.dbExec(sql="select * from WH_REST_LISTWARES(?,?,?,?)", fetch='all', params=params)
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            ext_data = {'WHID': whid}
            for item in args:
                if args[item]:
                    ext_data[item.upper()] = args[item]
            return self.pyDumps(data=sg, ext_data=ext_data)

    qRestListWares.exposed = True
