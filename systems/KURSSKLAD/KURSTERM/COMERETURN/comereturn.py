# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.common import TCommonTerm

#Import Templates
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.index import index
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.task import task
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.taskSite import taskSite
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.taskWares import taskWares
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.taskWaresAdd import taskWaresAdd
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.taskWaresAddGS1Box import taskWaresAddGS1Box
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.taskWaresLot import taskWaresLot
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.taskWaresPrDates import taskWaresPrDates
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.printer import printer
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.rangeWares import rangeWares

from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.taskWaresAddEgaisMark import taskWaresAddEgaisMark
from systems.KURSSKLAD.KURSTERM.COMERETURN.templates.taskWaresAddEgaisPrDate import taskWaresAddEgaisPrDate


from cherrypy import HTTPRedirect
from systems.KURSSKLAD.cheetahutils import TimeStampToDate



class TComeReturn(TCommonTerm):

    helpSystem = True
    tmplIndex = index
    tmplTask = task
    tmplRangeWares = rangeWares
    tmplTaskSite = taskSite
    tmplTaskWares = taskWares
    tmplTaskWaresAdd = taskWaresAdd
    tmplTaskWaresLot = taskWaresLot
    tmplTaskWaresPrDates = taskWaresPrDates
    tmplPrinter = printer

    tmplTaskWaresAddGS1Box = taskWaresAddGS1Box

    tmplTaskWaresAddEgaisPrDate = taskWaresAddEgaisPrDate
    tmplTaskWaresAddEgaisMark = taskWaresAddEgaisMark
    
    def qTaskJoin(self, tid):
        try:
            self.dbExec(sql="execute procedure K_SESSION_JOIN_TASK(?,?)",params=[tid,self.getIfaceVar('wmsid')], fetch='none')
        except Exception as exc:
            raise HTTPRedirect('main?mes=%s' % self.fbExcText(exc))
    
    def qTaskBarcodeInfo(self, tid, barcode, wid=None):
        return self.dbExec(sql="select * from WH_COMERETURN_BARCODE_WARESLIST(?,?)", params=[tid, barcode], fetch='all')

    def qTaskPalBarcodeInfo(self, tid, barcode):
        return self.dbExec(sql="select * from WH_INCOME_PALBARCODE_INFO(?,?)", params=[tid, barcode], fetch='one')

    def qTaskEgaisPalBarcodeInfo(self, tid, barcode):
        return self.dbExec(sql="select * from WH_INCOME_EGAISPAL_BC_INFO(?,?,?)",
                           params=[tid, barcode, self.getIfaceVar('wmsid')], fetch='one')

    def qTaskEgaisBoxBarcodeInfo(self, tid, barcode):
        return self.dbExec(sql="select * from WH_INCOME_EGAISBOX_BC_INFO(?,?,?)",
                           params=[tid, barcode, self.getIfaceVar('wmsid')], fetch='one')

    def qTaskWaresPrDateInfo(self, tid, wid, prdate):
        return self.dbExec(sql="select * from wh_income_tw_prdate_info(?,?,?)", params=[tid, wid, prdate], fetch='one')
    
    
    def index(self, id_system=None):
        TCommonTerm.index(self, id_system)    
        self.setIfaceVar('wmsid',self.GetKSessionID())
        return self.main()
    index.exposed = True
    
    def chgZone(self, id):        
        try:
            self.dbExec(sql="execute procedure WH_SESSION_SETZONE(?,?)",params=[self.getIfaceVar('wmsid'),id], fetch='none')
        except Exception as exc:
            raise HTTPRedirect('main?mes=%s' % self.fbExcText(exc))
        else: raise HTTPRedirect('main')
    chgZone.exposed = True
        
    def main(self, barcode=None, mes=None):
        self.dbExec(sql="execute procedure WH_COMERETURN_NOTDONE(?)", params=[self.getIfaceVar('wmsid')], fetch='none')
        if barcode:
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo and bcInfo['USERCODE'] == 'PRINTER':
                raise HTTPRedirect('printer?id=%s' % (self.kId(bcInfo['RECORDID'])))
            else:
                mes = _('ШК не обрабатывается')
        docs = self.dbExec(sql="select * from WH_COMERETURN_LIST(?)",params=[self.getIfaceVar('wmsid')],fetch='all')
        zonedocs = self.dbExec(sql="select * from WH_COMERETURN_LISTOBJ(?)",params=[self.getIfaceVar('wmsid')],fetch='all')
        zonedocs['zd'] = zonedocs['datalist']
        del zonedocs['datalist']
        return self.drawTemplate(templ=self.tmplIndex,data=[docs,zonedocs,{'mes':mes,'reloadurl':'main'}])
    main.exposed = True
            
    def task(self, tid, showList=None, mes=None):
        t = self.taskInfo(tid)
        if t['ALGORITHM'] and t['ALGORITHM']=='F': showList = '0'
        else: self.qTaskJoin(tid)
        if not t['SITEID']: raise HTTPRedirect('taskSite?tid=%s'%(tid))
        if showList is None:
            showList = self.getIfaceVar('taskShowList')
            if showList is None: showList='0'
        self.setIfaceVar('taskShowList',showList)
        if showList!='0': tw=self.dbExec(sql="select * from WH_COMERETURN_LISTWARES(?)", params=[tid], fetch='all')
        else: tw=None
        return self.drawTemplate(templ=self.tmplTask, data=[t, tw, {'mes':mes,'showList':showList,'backurl':'main','treeName':'№%s'%(tid)}])
    task.exposed = True
        
    def taskSite(self, tid, barcode=None):
        if barcode:
            mes = _('Invalid barcode')
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo and bcInfo['USERCODE'] == 'SITE':
                try:
                    self.dbExec(sql="execute procedure WH_COMERETURN_SITESET(?,?)", params=[tid,self.kId(bcInfo['RECORDID'])], fetch='none')
                except Exception as exc:
                    mes = self.fbExcText(exc)
                else:
                    raise HTTPRedirect('task?tid=%s' % tid)
        else:
            mes = None
        return self.drawTemplate(templ=self.tmplTaskSite, data=[self.taskInfo(tid),{'mes':mes,'backurl':'main','treeName':'№%s'%(tid)}])
    taskSite.exposed = True
    
    def rangeWares(self, tid, barcode):
        t = self.taskInfo(tid)
        w = self.dbExec(sql='select * from WH_COMERETURN_WARESBYBARCODE(?,?)', params=[tid, barcode], fetch='all')
        data = [t, w, {'barcode': barcode, 'backurl': 'task?tid=%s' % (tid), 'treeName': '№%s' % (tid)}]
        return self.drawTemplate(templ=self.tmplRangeWares, data=data)
    rangeWares.exposed = True
    
    def taskWares(self, tid, wid, mes=None):
        wid = self.kId(wid)
        params = {'mes':mes,'backurl':'task?tid=%s'%(tid),'treeName':'№%s'%(tid)}
        tl = self.dbExec(sql="select * from WH_COMERETURN_LISTWARESLOT(?,?)", params=[tid,wid], fetch='all')
        w = self.waresInfo(wid)
        ed = self.dbExec(sql='select * from WH_INCOME_TW_EXTDATA(?,?)', params=[tid, wid], fetch='one')
        if not mes and len(tl['datalist'])==0 and w['IS_VET'] != '1' and w['IS_ALCO'] != '1' and not ed['ALCOALGO']:
            raise HTTPRedirect('taskWaresAdd?tid=%s&wid=%s' % (tid, wid))
        t = self.taskInfo(tid)
        wz = self.objWaresIncomeZone(objid=t['TOID'],waresid=wid)
        return self.drawTemplate(templ=self.tmplTaskWares,data=[t, w, tl, wz, ed, params])
    taskWares.exposed = True
    
    def taskWaresScan(self, tid, barcode, wid=None):
        mes = _('ШК не обрабатывается')
        bcInfo = self.whBarCodeInfo(barcode)
        if bcInfo:
            if bcInfo['USERCODE'] == 'PALLET':
                url = 'pallet?id=%s&tid=%s' % (bcInfo['RECORDID'], tid)
                if wid:
                    url += '&wid=%s' % (wid)
                raise HTTPRedirect(url)
            else:
                mes = _('Не верный ШК')
        else:
            try:
                bc = self.qTaskBarcodeInfo(tid=tid, barcode=barcode)
            except Exception as exc:
                if wid:
                    raise HTTPRedirect('taskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, self.fbExcText(exc)))
                else:
                    raise HTTPRedirect('task?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
            else:
                if bc and bc['datalist'] and len(bc['datalist']) > 0:
                    if len(bc['datalist']) == 1:
                        bc0 = bc['datalist'][0]
                        if bc0['USERCODE'] == 'WARESUNIT':
                            raise HTTPRedirect('taskWares?tid=%s&wid=%s' % (tid, bc0['WID']))
                        elif bc0['USERCODE'] == 'WARES':
                            raise HTTPRedirect('taskWares?tid=%s&wid=%s' % (tid, bc0['WID']))
                        elif bc0['USERCODE'] == 'GS1':
                            barcode = bc0['REBUILTBARCODE']
                            if bc0['PRDATE']:
                                raise HTTPRedirect('taskWaresAddGS1Box?tid=%s&wid=%s&barcode=%s' %
                                                   (tid, bc0['WID'], barcode))
                            else:
                                mes = _('ШК в формате GS1, но не обрабатываемого вида!')
                        elif bc0['USERCODE'] == 'WARESWEIGHT' or bc0['USERCODE'] == 'SUPWEIGHT':
                            raise HTTPRedirect(
                                'taskWaresAdd?tid=%s&wid=%s&amount=%s' % (tid, bc0['WID'], bc0['AMOUNT']))
                    else:
                        t = self.taskInfo(tid)
                        p = {'barcode': barcode, 'backurl': 'task?tid=%s' % tid, 'treeName': '№%s' % tid}
                        return self.drawTemplate(templ=self.tmplRangeWares, data=[t, bc, p])
                else:
                    mes = _('Не верный ШК')
        if wid:
            raise HTTPRedirect('taskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, mes) )
        else:
            raise HTTPRedirect('task?tid=%s&mes=%s' % (tid, mes))
    taskWaresScan.exposed = True
        
    def taskWaresAddAfter(self, tid, wid):
        t = self.taskInfo(id=tid)
        if int(t['TSESID']) == int(self.getIfaceVar('wmsid')):
            raise HTTPRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
        else:
            raise HTTPRedirect('main')

    def taskWaresAddBack(self, tid, wid):
        self.dbExec(sql='execute procedure WH_INCOME_THEBARCODE_UNLOCK(?,?)', fetch='none',
                    params=[tid, self.getIfaceVar('wmsid')])
        self.taskWaresAddAfter(tid=tid, wid=wid)
    taskWaresAddBack.exposed = True


    def taskWaresAddEgaisPrDate(self, tid, wid, prdate=None):
        params = {'backurl': 'taskWares?tid=%s&wid=%s' % (tid, wid)}
        if prdate:
            try:
                prDateData = self.qTaskWaresPrDateInfo(tid=tid, wid=wid, prdate=prdate)
            except Exception as exc:
                params['mes'] = self.fbExcText(exc)
            else:
                if not prDateData['AMOUNT']:
                    params['mes'] = _('Нет информации о товаре указанной даты')
                else:
                    raise HTTPRedirect('taskWaresAddEgaisMark?tid=%s&wid=%s&prdate=%s' % (tid, wid, prdate))
        t = self.taskInfo(id=tid)
        w = self.waresInfo(waresid=wid)
        return self.drawTemplate(templ=self.tmplTaskWaresAddEgaisPrDate, data=[t, w, params])
    taskWaresAddEgaisPrDate.exposed = True

    def taskWaresAddEgaisMark(self, tid, wid, prdate, barcode=None):
        params = {'PRDATE': prdate}
        if barcode:
            if self.barcodeLike(barcode=barcode) == 'ALCOMARK':
                try:
                    l = self.dbExec(sql='select * from WH_COMERETURN_ALCOMARK_LOCK(?,?,?,?,?)', fetch='one',
                                    params=[tid, wid, prdate, barcode, self.getIfaceVar('wmsid')])
                except Exception as exc:
                    params['mes'] = self.fbExcText(exc)
                else:
                    if l['RES'] == 'R':
                        params['mes'] = _('Вы уже сканировали эту алкомарку')
            elif self.barcodeLike(barcode) == 'PALLET':
                try:
                    self.dbExec(sql="execute procedure WH_COMERETURN_DO_EGAISMARK(?,?,?)", fetch='none',
                                params=[tid, barcode, self.getIfaceVar('wmsid')])
                except Exception as exc:
                    params['mes'] = self.fbExcText(exc)
                else:
                    raise HTTPRedirect('taskWaresAddEgaisPrDate?tid=%s&wid=%s' % (tid, wid))
            else:
                params['mes'] = _('ШК не обрабатывается в этом интерфейсе')
        t = self.taskInfo(id=tid)
        w = self.waresInfo(waresid=wid)
        bcl = self.egaisBoxCntLock(taskid=tid)
        return self.drawTemplate(templ=self.tmplTaskWaresAddEgaisMark, data=[t, w, bcl, params])
    taskWaresAddEgaisMark.exposed = True

    def taskWaresAddEgaisBack(self, tid, wid):
        self.dbExec(sql='execute procedure WH_INCOME_EGAIS_UNLOCK(?,?)', fetch='none',
                    params=[tid, self.getIfaceVar('wmsid')])
        self.taskWaresAddAfter(tid=tid, wid=wid)
    taskWaresAddEgaisBack.exposed = True

    def taskWaresAddGS1Box(self, tid, wid, barcode=None, **args):
        params = {}
        if barcode:
            try:
                bc = self.qTaskBarcodeInfo(tid=tid, barcode=barcode)
            except Exception as exc:
                params['mes'] = self.fbExcText(exc)
            else:
                if bc['datalist'] and len(bc['datalist'])>0:
                    if len(bc['datalist']) == 1 and bc['datalist'][0]['USERCODE'] == 'GS1':
                        if self.kId(bc['datalist'][0]['WID']) == self.kId(wid):
                            gs1 = self.whBarcodeGS1Info(barcode=barcode)
                            productdate = TimeStampToDate(gs1['PRODUCTDATE'])
                            if 'pd_'+productdate in args:
                                args['pd_'+productdate] = float(args['pd_'+productdate]) + float(gs1['BCCALCAMOUNT'])
                            else:
                                args['pd_'+productdate] = float(gs1['BCCALCAMOUNT'])
                            if 'cntscan' in args:
                                args['cntscan'] = int(args['cntscan']) + 1
                            else:
                                args['cntscan'] = 1
                            params['THEBC'] = gs1
                        else:
                            params['mes'] = _('Отсканирован ШК другого товара')
                    else:
                        params['mes'] = _('Отсканирован не верный тип ШК товара')
                else:
                    pd = amounts = ''
                    for item in args:
                        if item[:3] == 'pd_':
                            pd += item[3:] + ';'
                            amounts += args[item] + ';'
                    try:
                        self.dbExec(sql='execute procedure WH_INCOMEDC_DO_GS1BOX(?,?,?,?,?,?)', fetch='one',
                                            params=[tid, wid, barcode, pd, amounts, self.getIfaceVar('wmsid')])
                    except Exception as exc:
                        params['mes'] = self.fbExcText(exc)
                    else:
                        raise HTTPRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
        t = self.taskInfo(id=tid)
        w = self.waresInfo(waresid=wid)
        params['args'] = args
        return self.drawTemplate(templ=self.tmplTaskWaresAddGS1Box, data=[t, w, params])
    taskWaresAddGS1Box.exposed = True

    def taskWaresAdd(self, tid, wid, wuid=None, prdate=None, amount=None, barcode=None):
        wid = self.kId(wid)
        params = {'backurl':'task?tid=%s'%(tid),'treeName':'№%s'%(tid)}
        if barcode:
            bc = self.dbExec(sql="select * from WH_COMERETURN_BARCODE_WARESLIST(?,?)",
                             params=[tid, barcode], fetch='all')
            if bc and bc['datalist'] and len(bc['datalist']) > 0:
                if len(bc['datalist']) == 1:
                    bc0 = bc['datalist'][0]
                    if bc0['USERCODE'] == 'WARESUNIT':
                        raise HTTPRedirect('taskWaresAdd?tid=%s&wid=%s&wuid=%s' % (tid, bc0['WID'], bc0['WUID']))
                    elif bc0['USERCODE'] == 'WARES':
                        raise HTTPRedirect('taskWares?tid=%s&wid=%s' % (tid, bc0['WID']))
                    elif bc0['USERCODE'] == 'WARESWEIGHT' or bc0['USERCODE'] == 'SUPWEIGHT':
                        if amount:
                            amount = float(amount) + float(bc0['AMOUNT'])
                        else:
                            amount = bc0['AMOUNT']
                else:
                    t = self.taskInfo(tid)
                    p = {
                        'barcode': barcode,
                        'backurl': 'task?tid=%s' % tid,
                        'treeName': '№%s' % tid,
                        'wuid': wuid,
                        'amount': amount
                    }
                    return self.drawTemplate(templ=self.tmplRangeWares, data=[t, bc, p])
            elif amount and prdate and prdate != self.dateMask:
                try: self.dbExec(sql="execute procedure WH_COMERETURN_ADD(?,?,?,?,?,?)",fetch='none',
                        params=[tid,wuid,prdate,amount,barcode,self.getIfaceVar('wmsid')])
                except Exception as exc:
                    params['mes'] = self.fbExcText(exc)
                else:
                    raise HTTPRedirect('taskWares?tid=%s&wid=%s'%(tid,wid))
        
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        if w['IS_ALCO'] == '1':
            raise HTTPRedirect('taskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, _('Для приемки товара нужно отсканировать ШК в формате GS1-128')))
        wz = self.objWaresIncomeZone(objid=t['TOID'],waresid=wid)
        if not wz or not wz['ZID']:
            raise HTTPRedirect('taskWares?tid=%s&wid=%s&mes=%s'%(tid,wid,_('Не установлена зона хранения товара!')))
        
        #проставим время
        self.dbExec(sql='update wm_task_wares tw set tw.begintime = current_timestamp where tw.taskid = ? and tw.waresid = ? and tw.begintime is NULL',params=[tid,wid],fetch='none')
        if prdate: params['prdate']=prdate        
        else:
            ld = self.dbExec(sql='select * from K_WH_INCOME_WARESLASTDATA(?,?)',params=[tid,wid],fetch='one')
            if ld and ld['PRODUCTDATE']: params['prdate']=TimeStampToDate(ld['PRODUCTDATE'])
            else: params['prdate']=self.dateMask

        wt = self.waresType(wid)
        if amount: params['amount'] = amount
        else: params['amount'] = ''
        params['wuid'] = wuid        
        return self.drawTemplate(templ=self.tmplTaskWaresAdd,data=[t,w,wt,params])
    taskWaresAdd.exposed = True
                
    def taskWaresLot(self, tid, wid, wlotid, palletid, wuid=None, amount=None, barcode=None):
        wid = self.kId(wid)
        params = {'backurl':'taskWares?tid=%s&wid=%s' % (tid, wid), 'treeName': '№%s' % (tid) }
        if barcode:
            bc = self.dbExec(sql="select * from WH_COMERETURN_BARCODE_WARESQ(?,?,?)",
                             params=[tid, barcode, wid], fetch='all')
            if bc and bc['datalist']:
                if len(bc['datalist']) == 1:
                    bc0 = bc['datalist'][0]
                    if bc0['USERCODE'] == 'WARESWEIGHT' or bc0['USERCODE'] == 'SUPWEIGHT' or bc0['USERCODE'] == 'WARESUNIT':
                        if amount:
                            amount = float(amount) + float(bc0['AMOUNT'])
                        else:
                            amount = bc0['AMOUNT']
                    else:
                        params['mes'] = _('Не верный товар!')
                else:
                    params['mes'] = _('Не верный ШК!')
            else:
                try:
                    self.dbExec(sql="execute procedure WH_COMERETURN_UPD(?,?,?,?,?,?,?)",fetch='none',
                                params=[tid,wlotid,palletid,wuid,amount,barcode,self.getIfaceVar('wmsid')])
                except Exception as exc:
                    params['mes'] = self.fbExcText(exc)
                else:
                    raise HTTPRedirect('taskWares?tid=%s&wid=%s'%(tid,wid))
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        wu = self.waresUnitInfo(wuid)
        p = self.palletInfo(palletid)
        wl = self.dbExec(sql="select wlotid,productdate from wareslot wl where wlotid=?",fetch='one',params=[wlotid])
        wli = self.dbExec(sql="select * from WH_COMERETURN_WARESLOTITEM(?,?,?)",fetch='one',params=[t['DOCID'],wlotid,palletid])
        if amount: params['amount'] = amount
        else: params['amount'] = '0'
        if wuid: params['wuid'] = wuid     
        wt = self.waresType(wid)
        return self.drawTemplate(templ=self.tmplTaskWaresLot,data=[p,t,w,wu,wl,wli,wt,params])
    taskWaresLot.exposed = True    
    
    def printer(self, id, cnt=None):
        params = {'printerid':id,'cnt':cnt,'backurl':'main','mes':None}
        if cnt:
            try:
                self.dbExec(sql="execute procedure WH_INCOME_PRINTPALLET('COMERETURN',?,NULL,?,?)",params=[self.getIfaceVar('wmsid'),id,cnt],fetch='none')
            except Exception as exc:
                params['mes']= self.fbExcText(exc)
            else:
                raise HTTPRedirect('main')
        p = self.dbExec(sql="select * from WM_PRINTERS where PRINTERID = ?",params=[id],fetch='one')
        return self.drawTemplate(templ=self.tmplPrinter,data=[p,params])
    printer.exposed = True
    
    def taskEnd(self, tid):
        try:
            self.dbExec(sql="execute procedure WH_COMERETURN_END(?,?)",params=[tid,self.getIfaceVar('wmsid')],fetch='none')
        except Exception as exc:
            raise HTTPRedirect('task?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
        else:
            raise HTTPRedirect('main')
    taskEnd.exposed = True

    def taskWaresPrDates(self, tid, wid=None):
        wid = self.kId(wid)
        params = {'backurl': 'taskWares?tid=%s&wid=%s' % (tid, wid), 'treeName': '№%s' % (tid)}
        tl = self.dbExec(sql="select * from WH_INCOME_TWPRDATES(?,?)", params=[tid, wid], fetch='all')
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        return self.drawTemplate(templ=self.tmplTaskWaresPrDates, data=[t, w, tl, params])
    taskWaresPrDates.exposed = True