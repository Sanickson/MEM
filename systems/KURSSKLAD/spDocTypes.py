# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon

class TDocTypes(WHCommon):
    
    def DocTypes(self, id=None):
        try: dt = self.dbExec(sql='select * from K_SP_DOCTYPES(?) order by NAME',params=(id,),fetch='all')
        except Exception as exc: return self.pyDumps( {'errMes':exc[1]} )
        return self.pyDumps(dt)
    DocTypes.exposed = True

    def DocTypeStatuses(self, doctid=None):
        try: data = self.dbExec(sql='select * from K_GETDOCTYPESTATUSES(?,NULL)',params=(doctid,),fetch='all')
        except Exception as exc: return self.pyDumps( {'errMes':exc[1]} )
        return self.pyDumps(data=data,ext_data={'doctid':doctid})
    DocTypeStatuses.exposed = True
    
    def docTypeOptions(self, doctid, **args):
        ext_data={'doctid':doctid}
        try: 
            objid = self.dbExec(sql='select sz.objid \
                                       from wm_session s \
                                            left join employee e on s.objid=e.employeeid \
                                            left join sitezone sz on sz.zoneid=e.currentzone \
                                      where s.sessionid=?',params=[self.GetKSessionID()],fetch='one')['OBJID']
            data = self.dbExec(sql="select dto.numobj, case \
                                                         when dto.ISOBJZONE is NULL then dto.objid \
                                                         else ? end as OBJID, dto.canchoice, \
                                           gon.fullname as objname, dto.REQUIRED, dto.ISOBJZONE, dto.CAPTION\
                                      from doctypeobj dto \
                                           left join GETOBJECTNAME(case when dto.ISOBJZONE is NULL then dto.objid else ? end,?) gon on 1=1 \
                                     where dto.doctid = ? and dto.numobj in ('0','1','2')",params=(objid,objid,None,doctid),fetch='all')
            if 'viewdays' in args or 'chkamountsign' in args:
                dt = self.dbExec(sql="select * from doctype dt where dt.doctid=?",params=[doctid],fetch='one')
                if dt: 
                    if 'viewdays' in args: ext_data['viewdays'] = dt['viewdays']
                    if 'chkamountsign' in args: ext_data['chkamountsign'] = dt['checkamountsign']
        except Exception as exc: return self.pyDumps({'errMes':exc[1]})
        return self.pyDumps(data=data,ext_data=ext_data)
    docTypeOptions.exposed = True    
    
    def docTypeSubTypes(self, doctid):
        try: data = self.dbExec(sql="select dst.code,dst.name from docsubtype dst where dst.doctid = ?",params=(doctid,),fetch='all')
        except Exception as exc: return self.pyDumps({'errMes':exc[1]})
        return self.pyDumps(data=data,ext_data={'doctid':doctid})
    docTypeSubTypes.exposed = True
    
    def ajaxGetObjects(self,**args):
        incname = None
        if 'incname' in args: incname = args['incname']
        return self.pyDumps(self.dbExec(sql="select * from K_DOCMANAGER_GETOBJSITEZONE(?,?)",params=[incname, self.GetKEmployeeID()],fetch='all'))
    ajaxGetObjects.exposed = True