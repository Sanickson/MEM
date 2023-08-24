# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.pallet import TCommonPallet

from systems.KURSSKLAD.KURSTERM.DOCFREESELECT.templates.index import index
from systems.KURSSKLAD.KURSTERM.DOCFREESELECT.templates.task import task
from systems.KURSSKLAD.KURSTERM.DOCFREESELECT.templates.taskWares import taskWares
from systems.KURSSKLAD.KURSTERM.DOCFREESELECT.templates.taskWaresEdit import taskWaresEdit
from systems.KURSSKLAD.KURSTERM.DOCFREESELECT.templates.taskWaresPallet import taskWaresPallet
from systems.KURSSKLAD.KURSTERM.DOCFREESELECT.templates.taskWaresPalletCommon import taskWaresPalletCommon
from systems.KURSSKLAD.KURSTERM.DOCFREESELECT.templates.taskWaresPalletEgais import taskWaresPalletEgais
from systems.KURSSKLAD.KURSTERM.DOCFREESELECT.templates.taskWaresPalletWLot import taskWaresPalletWLot
from systems.KURSSKLAD.KURSTERM.DOCFREESELECT.templates.taskRangeWares import taskRangeWares

from cherrypy import HTTPRedirect

class TDocFreeSelect(TCommonPallet):
    helpSystem = True        
    
    def waresListPallets(self, objid, waresid):
        return self.dbExec(sql="select * from WH_DOCFREESEL_WARESLISTREST(?,?)", params=[objid, waresid], fetch="all")

    def index(self):
        super().index()
        raise HTTPRedirect('dfsMain')
    index.exposed = True
        
    def dfsChgZone(self, id):        
        try:
            self.dbExec(sql="execute procedure WH_SESSION_SETZONE(?,?)",params=[self.whSesId(),id], fetch='none')
        except Exception as exc:
            raise HTTPRedirect('dfsMain?mes=%s' % self.fbExcText(exc))
        else:
            raise HTTPRedirect('dfsMain')
    dfsChgZone.exposed = True
    
    def dfsMain(self, mes=None):
        d = self.dbExec(sql='SELECT * FROM WH_DOCFREESEL_LISTTASKES(?)', params=[self.whSesId()], fetch='all')
        zonedocs = self.dbExec(sql="select * from WH_DOCFREESEL_LISTOBJ(?)",params=[self.whSesId()],fetch='all')
        zonedocs['zd'] = zonedocs['datalist']
        del zonedocs['datalist']        
        return self.drawTemplate(templ=index, data=[d,zonedocs,{'mes':mes, 'reloadurl':'dfsMain'}])
    dfsMain.exposed = True

    def dfsTask(self, id, showList=None, mes=None):
        try:
            self.dbExec(sql="execute procedure K_SESSION_JOIN_TASK(?,?)",params=[id,self.whSesId()], fetch='none')
        except Exception as exc:
            raise HTTPRedirect('dfsMain?mes=%s' % self.fbExcText(exc))
        if showList is None:
            showList = self.getIfaceVar('taskShowList')
            if showList is None: showList='0'
        self.setIfaceVar('taskShowList',showList)
        if showList!='0': lw = self.dbExec(sql='select * from WH_DOCFREESEL_LISTWARES(?)', params=[id], fetch='all')
        else: lw = None
        return self.drawTemplate(templ=task, data=[self.taskInfo(id),lw,{'mes':mes,'showList':showList,'backurl':'dfsMain'}])
    dfsTask.exposed=True
    
    def dfsTaskScan(self, id, barcode):
        bc = self.dbExec(sql="select * from WH_COMERETURN_BARCODE_WARESLIST(?,?)", params=[id, barcode], fetch='all')
        if bc and bc['datalist'] and len(bc['datalist']) > 0:
            if len(bc['datalist']) == 1:
                bc0 = bc['datalist'][0]
                raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s' % (id, bc0['WID']))
            else:
                t = self.taskInfo(id)
                p = {'barcode': barcode, 'backurl': 'dfsTask?tid=%s' % id}
                return self.drawTemplate(templ=taskRangeWares, data=[t, bc, p])
        else:
            mes = _('Товары с этим ШК не найдены в задании на отборку!')
        raise HTTPRedirect('dfsTask?id=%s&mes=%s' % (id, mes))
    dfsTaskScan.exposed = True
    
    def dfsTaskWares(self, tid, wid, mes=None):
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        q = self.dbExec(sql='select qdoc,qfact from WH_DOCFREESEL_LISTWARES(?,?)', params=[tid,wid], fetch='one')        
        r = self.waresListPallets(objid=t['FROMID'], waresid=wid)
        bu = 'dfsTask?id=%s'%(tid)
        return self.drawTemplate(templ=taskWares, data=[t,w,q,r,{'mes':mes,'backurl':bu}])
    dfsTaskWares.exposed = True    
    
    def dfsTaskWaresEdit(self, tid, wid, mes=None):
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        q = self.dbExec(sql='select * from WH_DOCFREESEL_LISTWARES(?,?)', params=[tid,wid], fetch='one')
        tl = self.dbExec(sql='select * from WH_DOCFREESEL_TASKWARES_TLOTS(?,?)', params=[tid,wid], fetch='all')                
        bu = 'dfsTaskWares?tid=%s&wid=%s'%(tid,wid)
        return self.drawTemplate(templ=taskWaresEdit, data=[t,w,q,tl,{'mes':mes,'backurl':bu}])
    dfsTaskWaresEdit.exposed = True    
    
    def dfsTaskWaresPalletCanc(self, tid, wid, pid, wlid):
        try: 
            self.dbExec(sql='execute procedure WH_DOCFREESEL_TASKWARES_PALCANC(?,?,?,?,?)',fetch='none',
                params=[tid,wid,pid,wlid,self.whSesId()])
        except Exception as exc:
            raise HTTPRedirect('dfsTaskWaresEdit?tid=%s&wid=%s&mes=%s' % (tid, wid, self.fbExcText(exc)))
        else: raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s'%(tid,wid))
    dfsTaskWaresPalletCanc.exposed = True    
    
    def dfsTaskWaresCanc(self, tid, wid):
        try:
            self.dbExec(sql='execute procedure WH_DOCFREESEL_TASKWARES_CANC(?,?,?)', fetch='none',
                        params=[tid, wid, self.whSesId()])
        except Exception as exc:
            raise HTTPRedirect('dfsTaskWaresEdit?tid=%s&wid=%s&mes=%s' % (tid, wid, self.fbExcText(exc)))
        else:
            raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s' % (tid, wid))
    dfsTaskWaresCanc.exposed = True

    def dfsTaskWaresScan(self, tid, wid, barcode):
        bcInfo = self.whBarCodeInfo(barcode)
        if bcInfo:
            if bcInfo['USERCODE'] == 'PALLET':
                raise HTTPRedirect('dfsTaskWaresPallet?tid=%s&wid=%s&pid=%s' % (tid, wid, self.kId(bcInfo['RECORDID'])))
            else:
                mes = _('Не верный ШК')
        else:
            bc = self.dbExec(sql="select * from WH_COMERETURN_BARCODE_WARESLIST(?,?)", params=[tid, barcode], fetch='all')
            if bc and bc['datalist'] and len(bc['datalist']) > 0:
                if len(bc['datalist']) == 1:
                    bc0 = bc['datalist'][0]
                    raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s' % (tid, bc0['WID']))
                else:
                    t = self.taskInfo(tid)
                    p = {'barcode': barcode, 'backurl': 'dfsTaskWares?tid=%s&wid=%s' % (tid, wid)}
                    return self.drawTemplate(templ=taskRangeWares, data=[t, bc, p])
            else:
                mes = _('Товары с этим ШК не найдены в задании на приемку!')

        raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, mes))
    dfsTaskWaresScan.exposed = True
    
    def dfsTaskWaresPallet(self, tid, wid, pid, mes=None):
        self.sessionPalletChk(palletid=pid)
        p = self.palletInfo(pid)
        if p['PCANEDIT']!='1':
            raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s&mes=%s'%(tid,wid,_('Работа с паллетом запрещена')))
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        wp = None
        bu = 'dfsTaskWares?tid=%s&wid=%s' % (tid, wid)
        if w['INVENTORYCONTROLTYPECODE'] == 'EGAIS':
            wp = self.palQWaresLots(id=pid, wid=wid)
            tmpl = taskWaresPalletEgais
        elif w['INVENTORYCONTROLTYPECODE'] == 'VET':
            wp = self.palQWaresLots(id=pid, wid=wid)
            if not wp or len(wp['datalist'])==0:
                raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s&mes=%s'%(tid,wid,_('Нет товара на поддоне')+'!<br>('+w['WCODE']+') '+w['WNAME']))
            elif wp and len(wp['datalist'])==1 and not mes:
                dl0 = wp['datalist'][0]
                url = 'dfsTaskWaresPalletWlin?tid=%s&wid=%s&pid=%s&wlotid=%s' % (tid, wid, pid, dl0['WLOTID'])
                if dl0['WLINCOMEID']:
                    url += '&wlincomeid=%s' % dl0['WLINCOMEID']
                raise HTTPRedirect(url)
            tmpl = taskWaresPallet
        else:
            wp = self.palQWaresWLs(pid=pid, wid=wid)
            tmpl = taskWaresPalletCommon
        q = self.dbExec(sql='select * from WH_DOCFREESEL_LISTWARES(?,?)', params=[tid, wid], fetch='one')
        return self.drawTemplate(templ=tmpl, data=[p, t, w, q, wp, {'mes': mes, 'backurl': bu}])
    dfsTaskWaresPallet.exposed = True
    
    def dfsTaskWaresPalletWlin(self, tid, wid, pid, wlotid, wlincomeid, mes=None):
        self.sessionPalletChk(palletid=pid)
        p = self.palletInfo(pid)
        if p['PCANEDIT']!='1':
            raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, _('Работа с паллетом запрещена')))
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        wp = self.palQWaresLot(id=pid, wid=wid, wlotid=wlotid, wlincomeid=wlincomeid)
        q = self.dbExec(sql='select qdoc,qfact from WH_DOCFREESEL_LISTWARES(?,?)', params=[tid,wid], fetch='one')
        bu = 'dfsTaskWaresPallet?tid=%s&wid=%s&pid=%s' % (tid, wid, pid)
        return self.drawTemplate(templ=taskWaresPalletWLot, data=[p, t, w, q, {'wp': wp, 'mes': mes, 'backurl': bu}])
    dfsTaskWaresPalletWlin.exposed = True

    def dfsTaskWaresPalletWLotSave(self, **args):
        barcode = args['barcode']
        mes = None
        if barcode:
            wlots = args['wlotid']
            if 'wlincomeid' in args:
                wlots += '_' + args['wlincomeid']
            else:
                wlots += '_0'
            palletid = None
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'SITE':
                    palletid = self.getSitePallet(siteid=self.kId(bcInfo['RECORDID']))
                elif bcInfo['usercode'] == 'PALLET':
                    palletid = bcInfo['RECORDID']
            if palletid:
                if self.kId(palletid) == self.kId(args['pid']):
                    try:
                        self.dbExec(sql='execute procedure WH_DOCFREESEL_SAVE(?,?,?,?,?,?,?)', fetch='none',
                                    params=[self.whSesId(), args['tid'], args['pid'], args['wuid'], wlots,
                                            args['amount'], self.dbDateTimePrep(args['ctm'])])
                    except Exception as exc:
                        mes = self.fbExcText(exc)
                    else:
                        raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s' % (args['tid'], args['wid']))
                else:
                    mes = _('Не верный паллет')
            else:
                try:
                    self.dbExec(sql='execute procedure WH_DOCFREESEL_SAVE_BARCODE(?,?,?,?,?,?,?)', fetch='none',
                                params=[self.whSesId(), args['tid'], args['pid'], args['wuid'], wlots,
                                        barcode, self.dbDateTimePrep(args['ctm'])])
                except Exception as exc:
                    mes = self.fbExcText(exc)
        if mes:
            url = 'dfsTaskWaresPalletWlin?tid=%s&wid=%s&pid=%s&mes=%s&wlotid=%s' % (
                    args['tid'], args['wid'], args['pid'], mes, args['wlotid'])
            if 'wlincomeid' in args:
                url += '&wlincomeid=%s' % args['wlincomeid']
            raise HTTPRedirect(url)
        else:
            raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s' % (args['tid'], args['wid']))
    dfsTaskWaresPalletWLotSave.exposed = True
    
    def dfsTaskWaresPalletCommonSave(self, **args):
        palletid = mes = None
        wlots = amounts = ''
        for item in args:
            if item.find('WL_') != -1:
                wlots += item[3:] + ';'
                amounts += args[item] + ';'
        bcInfo = self.whBarCodeInfo(args['barcode'])
        if bcInfo:
            if bcInfo['USERCODE'] == 'SITE':
                palletid = self.getSitePallet(siteid=self.kId(bcInfo['RECORDID']))
            elif bcInfo['usercode'] == 'PALLET':
                palletid = bcInfo['RECORDID']
        if palletid:
            if self.kId(palletid) == self.kId(args['pid']):
                try:
                    self.dbExec(sql='execute procedure WH_DOCFREESEL_SAVE_COMMON(?,?,?,?,?,?,?)', fetch='none',
                                params=[self.whSesId(), args['tid'], args['pid'], args['wuid'], wlots,
                                        amounts, self.dbDateTimePrep(args['ctm'])])
                except Exception as exc:
                    mes = self.fbExcText(exc)
                else:
                    raise HTTPRedirect('dfsTaskWares?tid=%s&wid=%s' % (args['tid'], args['wid']))
            else:
                mes = _('Не верный паллет')
        else:
            mes = _('Не верный ШК')
        raise HTTPRedirect('dfsTaskWaresPallet?tid=%s&wid=%s&pid=%s&mes=%s' % (args['tid'], args['wid'], args['pid'], mes))
    dfsTaskWaresPalletCommonSave.exposed = True

    def dfsTaskWaresPalletEgaisSave(self, **args):
        try:
            self.dbExec(sql='execute procedure WH_DOCFREESEL_EGAIS_SAVE(?,?,?,?,?,?)', fetch='none',
                        params=[self.whSesId(), args['tid'], args['wid'], args['pid'], args['barcode'], self.dbDateTimePrep(args['ctm'])])
        except Exception as exc:
            p = (args['tid'], args['wid'], args['pid'], self.fbExcText(exc))
            raise HTTPRedirect('dfsTaskWaresPallet?tid=%s&wid=%s&pid=%s&mes=%s' % p)
        else:
            raise HTTPRedirect('dfsTaskWaresPallet?tid=%s&wid=%s&pid=%s' % (args['tid'], args['wid'], args['pid']))

    dfsTaskWaresPalletEgaisSave.exposed = True

    def dfsTaskEnd(self, id):
        try:
            self.dbExec(sql="execute procedure WH_DOCFREESEL_TASKEND(?,?)",params=[id,self.whSesId()],fetch='none')
        except Exception as exc:
            raise HTTPRedirect('dfsTask?id=%s&mes=%s' % (id, self.fbExcText(exc)))
        else:
            raise HTTPRedirect('dfsMain')
    dfsTaskEnd.exposed = True

