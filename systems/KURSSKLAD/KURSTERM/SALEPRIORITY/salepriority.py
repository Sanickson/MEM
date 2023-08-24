# -*- coding: utf-8 -*-
from cp_utils import HTTPRedirect

from systems.KURSSKLAD.KURSTERM.common import TCommonTerm

from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.index import index
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.rangeWares import rangeWares
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.wares import wares
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.waresLotIncome import waresLotIncome
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.pallet import pallet
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.palletWares import palletWares
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.palletWaresPriority import palletWaresPriority
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.waresPalletPriority import waresPalletPriority
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.waresLotIncomePriority import waresLotIncomePriority
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.document import document
from systems.KURSSKLAD.KURSTERM.SALEPRIORITY.templates.waresDocIncomePriority import waresDocIncomePriority


#from kinterbasdb import ProgrammingError as FBExc
from cherrypy import HTTPRedirect

class TSalePriority(TCommonTerm):
    tmplRangeWares = rangeWares
    tmplMain = index
    tmplWares = wares
    tmplPallet = pallet
    tmplPalletWares = palletWares
    tmplPalletWaresPriority = palletWaresPriority
    tmplWaresPalletPriority = waresPalletPriority
    tmplWaresLotIncome = waresLotIncome
    tmplWaresLotIncomePriority = waresLotIncomePriority
    tmplDocument = document
    tmplWaresDocIncomePriority = waresDocIncomePriority

    salePriorityCodes = [0, 1, 2, -1]

    docid = None

    def salePriorityClass(self, code):
        if code == 0:
            return 'green'
        elif code == 1:
            return 'yellow'
        elif code == 2:
            return 'red'
        elif code == -1:
            return 'gray'
        else:
            return ''

    def salePriorityName(self, code):
        if code == 0:
            return _('Обычный')
        elif code == 1:
            return _('Высокий')
        elif code == 2:
            return _('Срочный')
        elif code == -1:
            return _('Запрет')
        else:
            return 'UnKnown'



    def index(self):
        TCommonTerm.index(self)
        return self.main()
    index.exposed = True

    def main(self, barcode=None):
        mes = None
        if barcode:
            mes = _('ШК не обрабатывается')
            bcInfo = self.kBarCodeInfo(barcode)
            if bcInfo and bcInfo['result']==0:
                mes=_('Не верный ШК')
                if bcInfo['usercode'] == 'WARES':
                    if bcInfo['CNTRES'] > 1: 
                        w = self.dbExec(sql=bcInfo['SELECTSQL'], params=[], fetch='all')
                        return self.drawTemplate(templ=self.tmplRangeWares, data=[w])
                    elif bcInfo['CNTRES'] == 1:
                        raise HTTPRedirect('wares?wid=%s' % bcInfo['recordid'])
                elif bcInfo['usercode'] == 'PALLET':
                    raise HTTPRedirect('pallet?pid=%s' % bcInfo['recordid'])
                elif bcInfo['usercode']=='WARESWEIGHT':
                    ww = self.dbExec(sql=bcInfo['SELECTSQL'], params=[], fetch='one')
                    if ww: raise HTTPRedirect('wares?wid=%s' % ww['WID'])
                elif bcInfo['usercode'] == 'DOCUMENT':
                    self.docid = bcInfo['recordid']
                    raise HTTPRedirect('document?docid=%s' % bcInfo['recordid'])
        return self.drawTemplate(templ=self.tmplMain, data=[{'mes': mes}])
    main.exposed = True
    
    def pallet(self, pid, barcode=None, mes=None):
        pid = self.kId(pid)
        if barcode:
            mes = _('ШК не обрабатывается')
            bcInfo = self.kBarCodeInfo(barcode)
            if bcInfo and bcInfo['result'] == 0:
                mes = _('Не верный ШК')
                if bcInfo['usercode'] == 'WARES':
                    if bcInfo['CNTRES'] > 1:
                        w = self.dbExec(sql=bcInfo['SELECTSQL'], params=[], fetch='all')
                        url = 'palletWaresPriority?pid=%s&wid=' % pid
                        return self.drawTemplate(templ=self.tmplRangeWares, data=[w, {'url': url}])
                    elif bcInfo['CNTRES'] == 1:
                        raise HTTPRedirect('palletWaresPriority?pid=%s&wid=%s' % (pid, bcInfo['recordid']))
                elif bcInfo['usercode'] == 'PALLET':
                    raise HTTPRedirect('pallet?pid=%s' % bcInfo['recordid'])
                elif bcInfo['usercode'] == 'WARESWEIGHT':
                    ww = self.dbExec(sql=bcInfo['SELECTSQL'], params=[], fetch='one')
                    if ww:
                        raise HTTPRedirect('palletWaresPriority?pid=%s&wid=%s' % (pid, ww['WID']))
        p = self.palletInfo(palletid=pid)
        wp = self.dbExec(sql='select * from WH_SALEPRIORITY_PAL_LISTWAR(?)', params=[pid], fetch='all')
        return self.drawTemplate(templ=self.tmplPallet, data=[p, wp, {'mes': mes, 'backurl': 'main'}])

    pallet.exposed = True

    def docInfo(self, docid):
        return self.dbExec(sql='select * from DOCUMENT d where d.docid = (?)', params=[docid], fetch='one')

    def document(self, docid, mes=None):
        wd = self.dbExec(sql='select * from WH_SALEPRIORITY_DOCWARES_LIST(?)', params=[docid], fetch='all')
        d = self.docInfo(docid)
        return self.drawTemplate(templ=self.tmplDocument, data=[d, wd, {'mes': mes, 'backurl': 'main'}])
    document.exposed = True

    def waresDocIncomePriority(self, docid, priority=None):
        backurl = 'document?docid=%s' % (docid)
        mes = None
        if priority is not None:
            try:
                self.dbExec(sql='execute procedure WH_SALEPRIORITY_WARESDOC_PRSET(?,?)',
                            params=[docid, priority], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc[1])
            else:
                raise HTTPRedirect(backurl)
        else:
            d = self.docInfo(docid)
            cw = self.dbExec(sql='select * from WH_SALEPRIORITY_COUNT_WARESLOT(?)', params=[docid], fetch='one')
            if (cw['COUNT_WARESINCOMES'] > 0):
                w = 1
            else:
                mes = 'Нет товара на остатках'
                raise HTTPRedirect('document?docid=%s&mes=%s' % (docid, mes))
        return self.drawTemplate(templ=self.tmplWaresDocIncomePriority,
                                 data=[d, {'mes': mes, 'backurl': backurl}])

    waresDocIncomePriority.exposed = True

    def palletWares(self, pid, wid, mes=None):
        pid = self.kId(pid)
        wid = self.kId(wid)
        p = self.palletInfo(palletid=pid)
        w = self.waresInfo(waresid=wid)
        wlin = self.dbExec(sql='select * from WH_SALEPRIORITY_PALWAR_LISTWLIN(?,?)', params=[pid, wid], fetch='all')
        return self.drawTemplate(templ=self.tmplPalletWares,
                                 data=[p, w, wlin, {'mes': mes, 'backurl': 'pallet?pid=%s' % pid}])

    palletWares.exposed = True

    def palletWaresPriority(self, pid, wid, priority=None):
        pid = self.kId(pid)
        wid = self.kId(wid)
        mes = None
        if priority is not None:
            try:
                self.dbExec(sql='execute procedure WH_SALEPRIORITY_PALWAR_PRSET(?,?,?)', params=[pid, wid, priority],
                            fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc[1])
            else:
                raise HTTPRedirect('pallet?pid=%s' % pid)
        p = self.palletInfo(palletid=pid)
        w = self.waresInfo(waresid=wid)
        wpr = self.dbExec(sql='select * from WH_SALEPRIORITY_PALLETWARESREST(?,?)', params=[pid, wid], fetch='one')
        return self.drawTemplate(templ=self.tmplPalletWaresPriority,
                                 data=[p, w, wpr, {'mes': mes, 'backurl': 'pallet?pid=%s' % pid}])

    palletWaresPriority.exposed = True

    def palletWaresLotIncomePriority(self, pid, wid, wlotid, wlincomeid, priority=None):
        backurl = 'palletWares?pid=%s&wid=%s' % (pid, wid)
        url = 'palletWaresLotIncomePriority?pid=%s&wid=%s&wlotid=%s&wlincomeid=%s&priority={PRIORITY}' % (pid, wid, wlotid, wlincomeid)
        return self.waresLotPalletPriority(pid=pid, wid=wid, priority=priority, wlincomeid=wlincomeid, backurl=backurl, url=url)

    palletWaresLotIncomePriority.exposed = True

    def wares(self, wid, mes=None):
        url = 'main'
        wid = self.kId(wid)
        w = self.waresInfo(waresid=wid)
        wlin = self.dbExec(sql='select * from WH_SALEPRIORITY_WARESINCOMES(?)', params=[wid], fetch='all')
        if self.docid:
            url = 'document?docid=%s' % self.docid
        return self.drawTemplate(templ=self.tmplWares, data=[w, wlin, {'mes': mes, 'backurl': url}])

    wares.exposed = True

    def waresLotIncome(self, wid, wlincomeid, mes=None):
        wid = self.kId(wid)
        w = self.waresInfo(waresid=wid)
        wlincomeid = self.kId(wlincomeid)
        wlin = self.waresLotIncomeInfo(wlincomeid=wlincomeid)
        p = self.dbExec(sql='select * from WH_SALEPRIORITY_WLINPALLETS(?,?)', params=[wid, wlincomeid], fetch='all')
        bu = 'wares?wid=%s' % wid
        if self.docid:
            bu = 'wares?wid=%s' % (wid)
        return self.drawTemplate(templ=self.tmplWaresLotIncome, data=[w, wlin, p, {'mes': mes, 'backurl': bu}])

    waresLotIncome.exposed = True

    def waresLotPalletPriority(self, pid, wid, priority=None, wlincomeid=0, backurl=None, url=None, docid=None):
        pid = self.kId(pid)
        wid = self.kId(wid)
        wlincomeid = self.kId(wlincomeid)
        mes = None
        if backurl is None:
            backurl = 'waresLotIncome?wid=%s&wlincomeid=%s' % (wid, wlincomeid)
        if priority is not None:
            try:
                self.dbExec(sql='execute procedure WH_SALEPRIORITY_PALWAR_PRSET(?,?,?,?)',
                            params=[pid, wid, priority, wlincomeid],
                            fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect(backurl)
        p = self.palletInfo(palletid=pid)
        w = self.waresInfo(waresid=wid)
        wlin = self.waresLotIncomeInfo(wlincomeid=wlincomeid)
        wpr = self.dbExec(sql='select * from WH_SALEPRIORITY_PALLETWARESREST(?,?,?)',
                          params=[pid, wid, wlincomeid], fetch='one')
        if url is None:
            url = 'waresLotPalletPriority?pid=%s&wid=%s&wlincomeid=%s&priority={PRIORITY}' % (pid, wid, wlincomeid)
        return self.drawTemplate(templ=self.tmplWaresPalletPriority,
                                 data=[p, w, wpr, wlin, {'mes': mes, 'backurl': backurl, 'url': url}])

    waresLotPalletPriority.exposed = True

    def waresLotIncomePriority(self, wid, priority=None, wlincomeid=0, docid=None):
        wid = self.kId(wid)
        wlincomeid = self.kId(wlincomeid)
        backurl = 'waresLotIncome?wid=%s&wlincomeid=%s' % (wid, wlincomeid)
        mes = None
        if priority is not None:
            try:
                self.dbExec(sql='execute procedure WH_SALEPRIORITY_WLINCOME_PRSET(?,?,?)',
                            params=[wlincomeid, wid, priority], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc[1])
            else:
                raise HTTPRedirect(backurl)
        w = self.waresInfo(waresid=wid)
        wlin = self.waresLotIncomeInfo(wlincomeid=wlincomeid)
        data = [w, wlin]
        d = 0
        if docid:
            d = self.docInfo(docid)
            backurl = 'waresLotIncome?wid=%s&wlincomeid=%s&docid=%s' % (wid, wlincomeid, docid)
        data.extend([d,{'mes': mes, 'backurl': backurl}])
        return self.drawTemplate(templ=self.tmplWaresLotIncomePriority,
                                 data=data)

    waresLotIncomePriority.exposed = True

