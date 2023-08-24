# -*- coding: utf-8 -*-
from log import logSet, logGet, logWrite
from systems.KURSSKLAD.KURSTERM.common import TCommonTerm

from systems.KURSSKLAD.KURSTERM.LOADAUTO.templates.index import index
from systems.KURSSKLAD.KURSTERM.LOADAUTO.templates.gate import gate
from systems.KURSSKLAD.KURSTERM.LOADAUTO.templates.auto import auto
from systems.KURSSKLAD.KURSTERM.LOADAUTO.templates.task import task
from systems.KURSSKLAD.KURSTERM.LOADAUTO.templates.pallet import pallet
from systems.KURSSKLAD.KURSTERM.LOADAUTO.templates.gateAuto import gateAuto
from systems.KURSSKLAD.KURSTERM.LOADAUTO.templates.gateTaskEnd import gateTaskEnd
from systems.KURSSKLAD.KURSTERM.LOADAUTO.templates.gateTaskEndTara import gateTaskEndTara


class TLoadAutoDC(TCommonTerm):
    helpSystem = True
    
    tmplMain = index
    tmplGate = gate
    tmplAuto = auto
    tmplTask = task
    tmplPallet = pallet
    tmplGateAuto = gateAuto
    tmplGateTaskEnd = gateTaskEnd
    tmplGateTaskEndTara = gateTaskEndTara

    def chkAuto(self, id):
        try: self.dbExec(sql="execute procedure WH_LOADAUTODC_CHKAUTO(?)",params=[id],fetch="none")
        except Exception as exc: raise self.httpRedirect('main?mes=%s' % (self.fbExcText(exc)))
        
    def gateInfo(self, id):
        return self.dbExec(sql="select * from WH_LOADAUTODC_GATEINFO(?)",params=[self.kId(id)],fetch='one')
                
    def autoInfo(self, id):
        return self.dbExec(sql="select * from WH_AUTOINFO(?)",params=[self.kId(id)],fetch='one')

    def index(self, id_system=None):
        TCommonTerm.index(self, id_system)
        self.setIfaceVar('wmsid',self.GetKSessionID())
        return self.main()
    index.exposed = True 

    def main(self, barcode=None, mes=None):
        if barcode:
            bcInfo = self.kBarCodeInfo(barcode)
            if bcInfo and bcInfo['result'] == 0:
                if bcInfo['usercode'] == 'SITE':
                    s = self.qSiteInfo(siteid = bcInfo['recordid'])
                    if s['SPCODE'] == 'GATE':
                        raise self.httpRedirect('gate?id=%s'%(bcInfo['recordid']))
                    else:
                        mes = _('Неверный тип МП')
                elif bcInfo['usercode'] == 'AUTO':
                    raise self.httpRedirect('auto?id=%s'%(bcInfo['recordid']))
                elif bcInfo['usercode'] == 'TASK':
                    raise self.httpRedirect('pallet?id=%s'%(bcInfo['recordid']))
                else:
                    mes = _('Неверный ШК')
            else:
                mes = bcInfo['mes']
        g = self.dbExec(sql="select * from WH_LOADAUTODC_LISTGATES(?) where TID is Not NULL order by gname",params=[self.getIfaceVar('wmsid')],fetch="all")
        return self.drawTemplate(templ=self.tmplMain,data=[g,{'mes':mes, 'reloadurl':'main'}])
    main.exposed = True
    
    def gate(self, id, barcode=None, mes=None):
        id = self.kId(id)
        if barcode:
            mes = _('Неверный ШК')
            bcInfo = self.kBarCodeInfo(barcode)
            if bcInfo and bcInfo['result'] == 0:
                if bcInfo['usercode'] == 'SITE':
                    s = self.qSiteInfo(siteiid=bcInfo['recordid'])
                    if s['SPCODE'] == 'GATE':
                        raise self.httpRedirect('gate?id=%s'%(bcInfo['recordid']))
                elif bcInfo['usercode'] == 'AUTO':
                    raise self.httpRedirect('gateAuto?gid=%s&aid=%s&bu=g'%(id,bcInfo['recordid']))
        g = self.gateInfo(id = id)
        if g['TID']: raise self.httpRedirect('task?id=%s'%(g['TID']))
        else: dl = self.dbExec(sql="select * from WH_LOADAUTODC_GATELISTAUTO(?)",params=[id],fetch="all")        
        return self.drawTemplate(templ=self.tmplGate,data=[g,dl,{'mes':mes,'backurl':'main'}])
    gate.exposed = True
    
    def gateAuto(self, gid, aid, mes=None,bu='g'):
        g = self.gateInfo(id = gid)
        if g['TID']:
            raise self.httpRedirect('task?id=%s&mes=%s'%(g['TID'],_('Ворота заняты!')))
        else: 
            self.chkAuto(aid)
            ga = self.dbExec(sql="select * from WH_LOADAUTODC_GATELISTAUTO(?) where aid=?",params=[gid,aid],fetch="all")
            if not ga or len(ga['datalist'])<1: 
                if bu == 'g':
                    raise self.httpRedirect('gate?id=%s&mes=%s'%(gid,_('Нет задания на постановку автомобиля на эти ворота!')))
                elif bu == 'a':
                    raise self.httpRedirect('auto?id=%s&mes=%s'%(aid,_('Нет задания на постановку автомобиля на эти ворота!')))
                else:
                    raise self.httpRedirect('main?mes=%s'%(_('Нет задания на постановку автомобиля на эти ворота!')))
            else:
                a = self.autoInfo(id = aid)
                if bu == 'g': backurl = 'gate?id=%s'%(gid)
                elif bu == 'a': backurl = 'auto?id=%s'%(aid)
                else: backurl = 'main'
                return self.drawTemplate(templ=self.tmplGateAuto,data=[a,g,ga,{'mes':mes,'backurl':backurl}])
    gateAuto.exposed = True

    def gateTaskStart(self, tid):
        t = self.taskInfo(id = tid)
        try: self.dbExec(sql="execute procedure WH_LOADAUTODC_TASKSTART(?,?)",params=[tid,self.getIfaceVar('wmsid')],fetch="none")
        except Exception as exc: raise self.httpRedirect('gateAuto?gid=%s&aid=%s&mes=%s' % (t['SITEID'], t['INFOID'],
                                                                                       self.fbExcText(exc)))
        else: raise self.httpRedirect('task?id=%s'%(tid))
    gateTaskStart.exposed = True
        
    def gateTaskEnd(self, tid, conf = '0'):
        mes = None
        if conf == '1':
            try: self.dbExec(sql="execute procedure WH_LOADAUTODC_TASKEND(?,?)",params=[tid,self.getIfaceVar('wmsid')],fetch="none")
            except Exception as exc: mes = self.fbExcText(exc)
            else: raise self.httpRedirect('main')
        t = self.taskInfo(id = tid)
        g = self.gateInfo(id = t['SITEID'])
        ei = self.dbExec(sql="select * from WH_LOADAUTODC_ENDSTAT(?)",params=[tid],fetch="all")
        return self.drawTemplate(templ=self.tmplGateTaskEnd,data=[g,ei,{'mes':mes,'backurl':'task?id=%s'%(tid)}])
    gateTaskEnd.exposed = True
    
    def gateTaskEndTara(self, tid, **args):
        wareses = amounts = ''
        mes = args['mes'] if 'mes' in args else None
        for item in args:
            if item.find('tara_') != -1 and args[item]:
                waresid = item[5:]
                wareses += waresid + ';'
                amounts += args[item] + ';'
        if wareses != '' and amounts != '':
            try:
                self.dbExec('execute procedure WH_LOADAUTO_TASKEND_TARASET(?,?,?)', [tid, wareses, amounts], 'none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('gateTaskEnd?tid=%s' % tid)
        tl = self.dbExec(sql="select * from WH_LOADAUTO_TARALIST(?)", params=[tid], fetch="all")
        if len(tl['datalist'])==0:
            raise self.httpRedirect('gateTaskEnd?tid=%s' % tid)
        t = self.taskInfo(id = tid)
        g = self.gateInfo(id = t['SITEID'])
        return self.drawTemplate(templ=self.tmplGateTaskEndTara, data=[g, tl, {'mes':mes, 'backurl': 'task?id=%s' % tid}])
    gateTaskEndTara.exposed = True

    def auto(self, id, barcode=None, mes = None):
        id = self.kId(id)
        if barcode:
            bcInfo = self.kBarCodeInfo(barcode)
            if bcInfo and bcInfo['result'] == 0:
                if bcInfo['usercode'] == 'SITE':
                    s = self.qSiteInfo(siteid=bcInfo['recordid'])
                    if s['SPCODE'] == 'GATE':
                        raise self.httpRedirect('gateAuto?gid=%s&aid=%s&bu=a'%(bcInfo['recordid'],id))
                elif bcInfo['usercode'] == 'AUTO':
                    raise self.httpRedirect('auto?id=%s'%(id,bcInfo['recordid']))
                else:
                    mes = _('Неверный ШК')
            else:
                mes  = bcInfo['mes']
        a = self.autoInfo(id)        
        try: ag = self.dbExec(sql="select * from WH_LOADAUTODC_AUTOLISTGATE(?)",params=[id],fetch="all")
        except Exception as exc: raise self.httpRedirect('main?mes=%s' % (self.fbExcText(exc)))
        return self.drawTemplate(templ=self.tmplAuto,data=[a,ag,{'mes':mes,'backurl':'main'}])    
    auto.exposed = True
           
    def task(self, id, mes=None):
        id = self.kId(id)
        t = self.taskInfo(id)
        dl = self.dbExec(sql="select * from WH_LOADAUTODC_LISTPALLETS(?)",params=[id],fetch="all")        
        return self.drawTemplate(templ=self.tmplTask,data=[t,dl,{'mes':mes,'backurl':'main'}])
    task.exposed = True
    
    def pallet(self, id, mes = None):
        try: t = self.dbExec(sql='SELECT * FROM WH_LOADAUTODC_TASKSELINFO(?)',params=[id],fetch='one')
        except Exception as exc: raise self.httpRedirect('main?mes=%s' % (self.fbExcText(exc)))
        return self.drawTemplate(templ=self.tmplPallet,data=[t,{'mes':mes,'backurl':'main'}])
    pallet.exposed = True
    
    def palletCancel(self, id):
        try: t = self.dbExec(sql='execute procedure WH_LOADAUTODC_PALLETCANC(?)',params=[id],fetch='one')
        except Exception as exc: raise self.httpRedirect('pallet?id=%s&mes=%s' % (id, self.fbExcText(exc)))
        raise self.httpRedirect('pallet?id=%s'%(id))
    palletCancel.exposed = True
    
        