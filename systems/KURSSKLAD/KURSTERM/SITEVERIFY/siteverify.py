# -*- coding: utf-8 -*-
# Serov Alexander
# changed 03.04.2011
# ver 2.0.1

from cherrypy import HTTPRedirect

#from systems.KURSSKLAD.KURSTERM.common import TCommonTerm
from systems.KURSSKLAD.KURSTERM.pallet import TCommonPallet

from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.rangeWares import rangeWares
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.index import index
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.wares import wares
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.waresTaraWeight import waresTaraWeight
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.waresTaraWeightChg import waresTaraWeightChg
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.site import site
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palI import palI
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palS import palS
#from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palIWares import palIWares
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palIWares_Incomes import palIWares_Incomes
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palIWaresPrinter import palIWaresPrinter
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palWaresPrinterWLIncome import palWaresPrinterWLIncome
#from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palletWaresAdd import palletWaresAdd
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palWaresAdd import palWaresAdd
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palWaresAddPrDate import palWaresAddPrDate
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.palWaresAddWLIncome import palWaresAddWLIncome
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.infoManyPallets import infoManyPallets
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.gs1 import gs1
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.alcoBox import alcoBox
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.alcoMark import alcoMark
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.user import user
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.userTask import userTask
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.userTaskSelect import userTaskSelect


from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.task import task
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.templates.taskE import taskE

class TSiteVerify(TCommonPallet):

    verifyPalletTaskCreateBefore = False
    verifySiteWaresShow = False
    verifyUseWaresLotNumber = False
    canTaraWeightChg = True

    tmplPalI = palI
    tmplPalS = palS
    tmplPalV = palI
    tmplPalIWares = palIWares_Incomes
    tmplPalSWares = palIWares_Incomes
    tmplPalVWares = palIWares_Incomes
    tmplPalWaresPrinter = palIWaresPrinter
    tmplPalWaresPrinterWLIncome = palWaresPrinterWLIncome

    tmplPalWaresAdd = palWaresAdd
    tmplPalWaresAddPrDate = palWaresAddPrDate
    tmplPalWaresAddWLIncome = palWaresAddWLIncome

    tmplTask = task
    tmplTaskE = taskE
    tmplUser = user
    tmplUserTask = userTask
    tmplUserTaskSelect = userTaskSelect

    def index(self, id_system=None):
        TCommonPallet.index(self, id_system)
        self.setIfaceVar('wmsid', self.GetKSessionID())
        raise HTTPRedirect('main')

    index.exposed = True


    def main(self, mes=None, hide='0'):
        t = self.dbExec(sql='select * from WH_VERIFY_ACTIVETASK(?)', fetch='one',
                        params=[self.whSesId()])
        if t['TASKID']:
            raise HTTPRedirect('verifyTask?tid=%s' % t['TASKID'])

        return self.drawTemplate(templ=index, data=[{'mes': mes, 'reloadurl': 'main', 'hide': hide}])

    main.exposed = True

    def alcoMark(self, barcode, mes=None):
        am = self.whBarcodeAlcoMarkInfo(barcode=barcode)
        return self.drawTemplate(templ=alcoMark, data=[{'mes': mes, 'backurl': 'main', 'AM': am}])
    alcoMark.exposed = True

    def alcoBox(self, barcode, mes=None):
        ab = self.whBarcodeAlcoBoxInfo(barcode=barcode)
        return self.drawTemplate(templ=alcoBox, data=[{'mes': mes, 'backurl': 'main', 'AB': ab}])
    alcoBox.exposed = True

    def gs1(self, gs1barcode, barcode=None, barcodeconf=None):
        data = {
            'THEBC': self.whBarcodeGS1Info(gs1barcode),
            'waresurl': 'wares?waresid=',
            'gs1barcode': gs1barcode,
            'barcodeconf': barcodeconf
        }
        if barcode:
            palletid = None
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'SITE':
                    palletid = self.getSitePallet(siteid=self.kId(bcInfo['RECORDID']))
                elif bcInfo['usercode'] == 'PALLET':
                    palletid = bcInfo['RECORDID']
            if palletid is None:
                data['mes'] = _('Отсканируйте ШК паллета!')
            else:
                palletid = self.kId(palletid)
                if self.kId(data['THEBC']['PALID']) == palletid:
                    raise HTTPRedirect('main')
                elif barcodeconf == barcode:
                    try:
                        self.dbExec('execute procedure WH_TVEFIFY_GS1_DO(?,?,?)',
                                    [gs1barcode, palletid, ], 'none')
                    except Exception as exc:
                        data['mes'] = self.fbExcText(exc)
                    else:
                        raise HTTPRedirect('main')
                elif barcodeconf:
                    data['barcodeconf'] = None
                    data['mes'] = _('Отсканированные ШК различаются!')
                else:
                    data['barcodeconf'] = barcode
        return self.drawTemplate(templ=gs1, data=[data])
    gs1.exposed = True

    def gs1alcomark(self, gs1barcode, mark='', barcode=None, barcodeconf=None):
        data = {
            'THEBC': self.whBarcodeGS1Info(gs1barcode),
            'waresurl': 'wares?waresid=',
            'gs1barcode': gs1barcode,
            'barcodeconf': barcodeconf
        }
        if barcode:
            palletid = None
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'SITE':
                    palletid = self.getSitePallet(siteid=self.kId(bcInfo['RECORDID']))
                elif bcInfo['usercode'] == 'PALLET':
                    palletid = bcInfo['RECORDID']
            if palletid:
                palletid = self.kId(palletid)
                if barcodeconf == barcode:
                    try:
                        self.dbExec(sql='execute procedure WH_TVEFIFY_GS1_ALCOMARK_DO(?,?,?,?)',
                                    params=[gs1barcode, palletid, mark, self.whSesId()], fetch='none')
                    except Exception as exc:
                        data['mes'] = self.fbExcText(exc)
                    else:
                        raise HTTPRedirect('main')
                elif barcodeconf:
                    data['barcodeconf'] = None
                    data['mes'] = _('Отсканированные ШК различаются!')
                else:
                    data['barcodeconf'] = barcode
            else:
                try:
                    chk = self.dbExec('select * from WH_TVERIFY_ALCOMARK_CHK(?,?)', [barcode, gs1barcode], 'one')['IS_ALCOMARK']
                except Exception as exc:
                    data['mes'] = self.fbExcText(exc)
                else:
                    if chk == '1' or self.barcodeLikeAlcoMark(barcode):
                        if mark.count(barcode+';') > 0:
                            data['mes'] = _('Вы уже сканировали эту марку!')
                        else:
                            mark += barcode + ';'
                    else:
                        data['mes'] = _('Не верный ШК')
        data['mark'] = mark
        data['lenmark'] = len(mark.split(';'))-1
        return self.drawTemplate(templ=gs1, data=[data])
    gs1alcomark.exposed = True

    def scanMain(self, barcode):
        bcInfo = self.whBarCodeInfo(barcode)
        if bcInfo:
            if bcInfo['USERCODE'] == 'SITE':
                raise HTTPRedirect('site?siteid=%s' % (bcInfo['RECORDID']))
            elif bcInfo['usercode'] == 'PALLET':
                raise HTTPRedirect('pal?id=%s' % (bcInfo['RECORDID']))
            elif bcInfo['USERCODE'] == 'ENGINEUSER':
                raise HTTPRedirect('verifyUser?uid=%s' % (bcInfo['RECORDID']))
            else:
                mes = _('Не верный ШК')
        else:
            bc = self.whBarCodeWaresInfo(barcode)
            if bc and bc['datalist'] and len(bc['datalist']) > 0:
                if len(bc['datalist']) == 1:
                    bc0 = bc['datalist'][0]
                    if bc0['USERCODE'] == 'ALCOMARK':
                        return self.alcoMark(barcode=barcode)
                    elif bc0['USERCODE'] == 'ALCO:BOX':
                        return self.alcoBox(barcode=barcode)
                    elif bc0['USERCODE'] == 'GS1':
                        return self.gs1(gs1barcode=barcode)
                    else:
                        return self.wares(waresid=bc['datalist'][0]['WID'])
                else:
                    return self.drawTemplate(templ=rangeWares, data=[bc, {'BARCODE': barcode}])
            else:
                mes = _('Не верный ШК')
        return self.main(mes=mes)

    scanMain.exposed = True


    # Выверка товара
    def wares(self, waresid, mes=None):
        waresid = self.kId(waresid)
        w = self.waresInfo(waresid)
        ed = self.dbExec(sql="select * from WH_TVERIFY_WARES_EXTDATA(?,?)",
                         params=[waresid, self.whSesId()], fetch='one')
        wl = self.dbExec(sql="select * from WH_TVERIFY_WARESLOTS(?,?)",
                         params=[waresid, self.whSesId()], fetch='all')
        return self.drawTemplate(templ=wares, data=[wl, ed, w, {'backurl': 'main', 'mes': mes, 'treeName': _('Товар')}])

    wares.exposed = True

    def waresTaraWeight(self, wid, mes=None):
        wid = self.kId(wid)
        w = self.waresInfo(wid)
        incomes = self.dbExec(sql="select * from WH_TVERIFY_WARES_TARAINCOMES(?,?)",
                              params=[wid, self.whSesId()], fetch='all')
        params = {'backurl': 'wares?waresid=%s' % wid, 'mes': mes}
        return self.drawTemplate(templ=waresTaraWeight, data=[incomes, w, params])

    waresTaraWeight.exposed = True

    def waresTaraWeightChg(self, wid, docid, weight=None, mes=None):
        wid = self.kId(wid)
        docid = self.kId(docid)
        if weight:
            try:
                self.dbExec('execute procedure WH_DOCWARES_TARAWEIGHT_SET(?,?,?)',
                                [docid, wid, weight], 'none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise HTTPRedirect('waresTaraWeight?wid=%s' % wid)
        w = self.waresInfo(wid)
        dwtw = self.dbExec(sql="select * from WH_TVERIFY_DOCWARES_TARAWEIGHT(?,?)",
                           params=[docid, wid], fetch='one')
        params = {'backurl': 'waresTaraWeight?wid=%s' % wid, 'mes': mes}
        return self.drawTemplate(templ=waresTaraWeightChg, data=[dwtw, w, params])

    waresTaraWeightChg.exposed = True

    # Выверка местоположения
    def site(self, siteid, mes=None, waresShow=None):
        if waresShow is not None:
            self.setIfaceVar('siteWaresShow', waresShow)
        else:
            waresShow = self.verifySiteWaresShow
        siteid = self.kId(siteid)

        s = self.siteTblInfo(siteid=siteid)
        try:
            d = self.dbExec('select * from K_TERM_SITEVERIFY_LISTSPALLET(?,?)', [siteid, self.whSesId()],
                            'all')
        except Exception as exc:
            return self.main(mes=exc[1])
        data = {}
        sites = []
        for item in d['datalist']:
            if item['SID'] not in data: sites.append(item['SID']) # Для упорядочивания вывода, как вернула процедура
            if item['SID'] not in data:
                data[item['SID']] = {'SNAME': item['SNAME'], 'SPCODE': item['SPCODE'], 'FS': item['FS'],
                                     'PALLETS': {}, 'STATUS': item['STATUS']}
            if item['PID']:
                if item['PID'] not in data[item['SID']]['PALLETS']:
                    data[item['SID']]['PALLETS'][item['PID']] = {'PNUM': item['PNUM'], 'FP': item['FP'], 'WARES': []}
                if item['WCODE']:
                    w = {'WCODE': item['WCODE'], 'WNAME': item['WNAME'], 'WQ': item['WQ'], 'VWUCODE': item['VWUCODE'],
                         'VWUFACTOR': item['VWUFACTOR'], 'MWUCODE': item['MWUCODE'], 'MWUFACTOR': item['MWUFACTOR']}
                    data[item['SID']]['PALLETS'][item['PID']]['WARES'].append(w)
        try:
            bdt = self.dbExec('select current_timestamp as begdtime from wm_config', [], 'one')
        except Exception as exc:
            return self.main(mes=exc[1])
        return self.drawTemplate(templ=site, data=[d, bdt, {'siteid': siteid, 'backurl': 'main', 'mes': mes,
                                                            'waresShow': waresShow, 'sites': sites, 'sdata': data,
                                                            'treeName': _('МП')}])

    site.exposed = True

    def siteSave(self, **args):
        mes = None
        psite = ''
        ppallet = ''
        pOPallet = ''
        pRPallet = ''
        siteid = None
        begdtime = None
        for i in args:
            if i == 'begdtime':
                begdtime = self.dbDateTimePrep(args[i])
            elif i.find('site_') != -1:
                siteid = i[5:]
                psite = psite + siteid + ';'
                ppallet = ppallet + args[i] + ';'
                pOPallet = pOPallet + args['oP_' + siteid] + ';'
                pRPallet = pRPallet + args['rP_' + siteid] + ';'
        params = [self.whSesId(), begdtime, psite, ppallet, pOPallet, pRPallet]
        try:
            self.dbExec('execute procedure WH_TVERIFY_CORRECTSITE(?,?,?,?,?,?)', params, 'none')
        except Exception as exc:
            mes = self.fbExcText(exc)
        if siteid:
            return self.site(siteid=siteid, mes=mes)
        else:
            return self.main(mes=mes)

    siteSave.exposed = True

    # -----------------------------------------------------------------------------------------------------------
    # Выверка паллета
    # -----------------------------------------------------------------------------------------------------------
    def palSlotWares(self, id, wid):
        backurl = 'wares?waresid=%s' % (wid)
        return TCommonPallet.palWares(self, id=id, wid=wid, backurl=backurl)

    palSlotWares.exposed = True

    def palScan(self, id, barcode, wid=None):
        bcInfo = self.whBarCodeInfo(barcode)
        if bcInfo:
            if bcInfo['USERCODE'] == 'SITE':
                raise HTTPRedirect('site?siteid=%s' % (bcInfo['RECORDID']))
            elif bcInfo['usercode'] == 'PALLET':
                raise HTTPRedirect('pal?id=%s' % (bcInfo['RECORDID']))
            elif bcInfo['usercode'] == 'PRINTER' and wid:
                r = self.dbExec(sql='select * from WH_PRINTER_REPORT_CHK(?,?,?)', fetch='one',  params=[self.kId(bcInfo['recordid']), None, 'WLINCOME'])
                if r['res'] == '1':
                    raise HTTPRedirect('palWaresPrinter?id=%s&wid=%s&printerid=%s' % (id, wid, self.kId(bcInfo['recordid'])))
                else:
                    raise HTTPRedirect('palWares?id=%s&wid=%s&mes=%s' % (id, wid, _('Нельзя печатать на этот принтер!')))
            else:
                mes = _('Не верный ШК')
        else:
            bc = self.whBarCodeWaresInfo(barcode)
            if bc and bc['datalist'] and len(bc['datalist']) > 0:
                if len(bc['datalist']) == 1:
                    raise HTTPRedirect('palWares?id=%s&wid=%s' % (id, bc['datalist'][0]['WID']))
                else:
                    p = self.palletInfo(id)
                    params = {'url': 'palWares?id=%s&wid=' % id}
                    if wid:
                        params['backurl'] = 'palWares?id=%s&wid=%s' % (id, wid)
                    else:
                        params['backurl'] = 'pal?id=%s' % id
                    return self.drawTemplate(templ=rangeWares, data=[bc, p, params])
            else:
                mes = _('Не верный ШК')
        if not mes:
            mes = _('Ничего не найдено или ШК не обрабатывается!')
        if wid:
            raise HTTPRedirect('palWares?id=%s&wid=%s&mes=%s' % (id, wid, mes))
        else:
            raise HTTPRedirect('pal?id=%s&mes=%s' % (id, mes))

    palScan.exposed = True

    # Приемки
    def palIQWaresLots(self, id, wid):
        #return self.dbExec(sql="select * from WH_TVERIFY_PALLETWARESLOTS(?,?,?)",
        return self.dbExec(sql="select * from WH_TVERIFY_PALI_WLINCOMES(?,?,?)",
                           params=[id, wid, self.whSesId()], fetch='all')

    palSQWaresLots = palIQWaresLots
    palVQWaresLots = palIQWaresLots

    """def palWaresAdd(self, id, wid, wuid=None, productdate=None, amount=None, wlnumber=None, dbeg=None):
        wid = self.kId(wid)
        id = self.kId(id)
        if productdate and amount and (not self.verifyUseWaresLotNumber or wlnumber):
            url = 'palWares?id=%s&wid=%s' % (id, wid)
            try:
                self.dbExec(sql="execute procedure WH_TVERIFY_PALLETWARESADD(?,?,?,?,?,?,?)", fetch="none",
                            params=[self.whSesId(), id, wuid, productdate, amount, wlnumber, dbeg])
            except FBExc, exc:
                url += '&mes=%s' % (self.fbExcText(exc))
            raise HTTPRedirect(url)
        else:
            #self.sessionPalletChk(palletid=id, flags='') - Теперь внутри процедуры WH_VERIFY_PALLETWARESCHK
            try:
                self.palQWaresChk(id, wid)
            except FBExc, exc:
                url += '&mes=%s' % (self.fbExcText(exc))
        w = self.waresInfo(wid)
        p = self.palletInfo(id)
        if p['SID'] is None:
            raise HTTPRedirect('pal?id=%s&mes=%s' % _('Паллет не привязан к месту!'))
        if not wuid:
            if p['PTYPE'] == '1' and (p['SPCODE'] == 'SITESALE' or p['SPCODE'] == 'BUYRETS'):
                wuid = w['MWUID']
            elif w['VWUID']:
                wuid = w['VWUID']
            else:
                wuid = w['MWUID']
        wu = self.waresUnitInfo(wuid)
        params = {'dbeg': dbeg,  'use_wlnumber': self.verifyUseWaresLotNumber, 'treeName': _('Паллет'),
                  'backurl': 'palWares?id=%s&wid=%s' % (id, wid)}
        if productdate:
            params['productdate'] = productdate
        else:
            params['productdate'] = self.GetCurDate(shortYear=True)
        if amount:
            params['amount'] = amount
        else:
            params['amount'] = ''
        return self.drawTemplate(templ=palletWaresAdd, data=[w, wu, p, params])

    palWaresAdd.exposed = True"""
    
    def palWaresAdd(self, id, wid, wuid=None, productdate=None, amount=None, wlincomeid=None, dbeg=None, mes=None):
        wid = self.kId(wid)
        id = self.kId(id)
        if dbeg:
            dbeg = dbeg.split('.')[0]
        if wlincomeid and amount:
            try:
                self.dbExec(sql="execute procedure WH_TVERIFY_PALWARESADD(?,?,?,?,?,?)", fetch="none",
                            params=[self.whSesId(), id, wuid, wlincomeid, amount, dbeg])
            except Exception as exc:
                url = 'palWaresAdd?id=%s&wid=%s&wuid=%s&productdate=%s&wlincomeid=%s&dbeg=%s&mes=%s' % \
                      (id, wid, wuid, productdate, wlincomeid, dbeg, self.fbExcText(exc))
                raise HTTPRedirect(url)
            else:
                raise HTTPRedirect('palWares?id=%s&wid=%s' % (id, wid))
           
        p = self.palletInfo(id)
        if p['SID'] is None:
            raise HTTPRedirect('pal?id=%s&mes=%s' % _('Паллет не привязан к месту!'))
        w = self.waresInfo(wid)
        backurl = 'palWares?id=%s&wid=%s' % (id, wid)
        
        try:
            self.palQWaresChk(id, wid)
        except Exception as exc:
            backurl += '&mes=%s' % (self.fbExcText(exc))
            raise HTTPRedirect(backurl)
            
        if not productdate:
            wlin = self.dbExec(sql="select * from WH_TVERIFY_WARESLOTINCOMES(?,?,?)", fetch="all",
                               params=[self.whSesId(), wid, None])
            return self.drawTemplate(templ=self.tmplPalWaresAddPrDate, data=[wlin, w, p, {'backurl': backurl, 'dbeg': dbeg}])
        if not wlincomeid or wlincomeid == '0':
            wlin = self.dbExec(sql="select * from WH_TVERIFY_WARESLOTINCOMES(?,?,?)", fetch="all", params=[self.whSesId(), wid, productdate])
            backurl = 'palWaresAdd?id=%s&wid=%s&dbeg=%s' % (id, wid, dbeg)
            return self.drawTemplate(templ=self.tmplPalWaresAddWLIncome, data=[wlin, w, p, {'backurl': backurl, 'dbeg': dbeg, 'productdate': productdate}])
           
        wlin = self.dbExec(sql="select * from WH_TVERIFY_WARESLOTINCOME(?)", fetch="one", params=[wlincomeid])
        if not wuid:
            if p['PTYPE'] == '1' and (p['SPCODE'] == 'SITESALE' or p['SPCODE'] == 'BUYRETS'):
                wuid = w['MWUID']
            elif w['VWUID']:
                wuid = w['VWUID']
            else:
                wuid = w['MWUID']
        wu = self.waresUnitInfo(wuid)
        
        backurl = 'palWaresAdd?id=%s&wid=%s&wuid=%s&productdate=%s&dbeg=%s' % (id, wid, wuid, productdate, dbeg)
        params = {'dbeg': dbeg, 'backurl': backurl, 'productdate': productdate, 'mes': mes}
        return self.drawTemplate(templ=self.tmplPalWaresAdd, data=[w, wu, p, wlin, params])

    palWaresAdd.exposed = True
    

    def palletWaresSave(self, **args):
        self.sessionPalletChk(palletid=args['palletid'], flags='C')
        wlots = ''
        amounts = ''
        for item in args:
            if item.find('WL_') != -1:
                wlots += item[3:] + ';'
                amounts += args[item] + ';'
        try:
            #print [self.whSesId(), args['palletid'], args['wuid'], wlots, amounts, args['dbeg']]
            #self.dbExec(sql='execute procedure WH_TVERIFY_CORRECTPALLETWARES(?,?,?,?,?,?)', fetch='none',
            dbeg = args['dbeg'].split('.')[0] if 'dbeg' in args else None
            self.dbExec(sql='execute procedure WH_TVERIFY_CORRECTPALWARINCOMES(?,?,?,?,?,?)', fetch='none', 
                params=[self.whSesId(), args['palletid'], args['wuid'], wlots, amounts, dbeg])
        except Exception as exc:
            url = 'palWares?id=%s&wid=%s&mes=%s' % (args['palletid'], args['waresid'], self.fbExcText(exc))
            if 'backurl' in args:
                url += '&backurl=%s' % (args['backurl'])
            raise HTTPRedirect(url)
        else:
            if 'backurl' in args:
                raise HTTPRedirect(args['backurl'])
            else:
                raise HTTPRedirect('pal?id=%s' % (args['palletid']))

    palletWaresSave.exposed = True

    def palWaresPrinter(self, id, wid, printerid, wlincomeid=None, cnt=None, mes=None):
        if cnt:
            try:
                self.dbExec(sql="execute procedure WH_PRINT_WLINCOME_TASKCREATE(?,?,?,?)",
                            params=[self.whSesId(), wlincomeid, printerid, cnt], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise HTTPRedirect('palWares?id=%s&wid=%s' % (id, wid))
    
        p = self.printerInfo(printerid=printerid)
        r = self.reportInfo(reportcode='WLINCOME')
        w = self.waresInfo(waresid=wid)
        if not wlincomeid:
            wlin = self.palIQWaresLots(id=id, wid=wid)            
            backurl = 'palWares?id=%s&wid=%s' % (id, wid)
            return self.drawTemplate(templ=self.tmplPalWaresPrinterWLIncome, data=[w, p, r, wlin, {'palid': id, 'backurl': backurl, 'mes': mes}])
        else:
            wlin = self.dbExec(sql="select * from WH_TVERIFY_WARESLOTINCOME(?)", fetch="one", params=[wlincomeid])
            backurl = 'palWaresPrinter?id=%s&wid=%s&printerid=%s' % (id, wid, printerid)
            return self.drawTemplate(templ=self.tmplPalWaresPrinter, data=[w, p, r, wlin, {'palid': id, 'backurl': backurl, 'mes': mes}])
    palWaresPrinter.exposed = True
    
    # Дополнительные возможности
    def infoManyPallets(self):
        d = self.dbExec(sql="select * from WH_TVERIFY_MANYPALLETS(?)", params=[self.whSesId()], fetch='all')
        return self.drawTemplate(templ=infoManyPallets, data=[d, {'backurl': 'main'}])

    infoManyPallets.exposed = True


    def verifyPalWaresEgaisStart(self, pid, wid, ctm=None):
        """
            Начало выверки товара-ЕГАИС на паллете
        """
        try:
            t = self.dbExec(sql='select * from WH_VERIFY_EGAIS_START(?,?,?)', fetch='one',
                            params=[self.whSesId(), pid, wid])
        except Exception as exc:
            mes = self.fbExcText(exc)
            raise HTTPRedirect('palWares?id=%s&wid=%s&mes=%s' % (pid, wid, mes))
        else:
            raise HTTPRedirect('verifyTask?tid=%s' % t['TASKID'])

    verifyPalWaresEgaisStart.exposed = True

    def verifyTask(self, tid, **args):
        t = self.taskInfo(id=tid)
        if t['ALGORITHM'] == 'E':
            args['t'] = t
            return self.verifyTaskEgais(tid=tid, **args)
        else:
            mes = _('Задания такого метода не обрабатываются')
            return self.drawTemplate(templ=self.tmplTask, data=[t, {'reloadurl': 'verifyTask?tid=%s' % tid, 'mes': mes}])

    verifyTask.exposed = True

    def verifyTaskEgais(self, tid, **args):
        mes = args['mes'] if 'mes' in args else None
        r = None
        if 'barcode' in args:
            try:
                r = self.dbExec(sql='select * from WH_VERIFY_EGAIS_SCAN(?,?)',
                                params=[tid, args['barcode']], fetch='one')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                if r['RES'] == 'R':
                    mes = _('Вы уже сканировали этот ШК!')
        t = self.dbExec(sql='select * from WH_VERIFY_EGAIS_INFO(?)', params=[tid], fetch='one')
        l = self.dbExec(sql='select * from WH_VERIFY_EGAIS_LOTS(?)', params=[tid], fetch='all')
        return self.drawTemplate(templ=self.tmplTaskE, data=[t, l, {'mes': mes}])

    def verifyTaskEnd(self, tid):
        try:
            self.dbExec(sql='execute procedure WH_VERIFY_TASKEND(?)', params=[tid], fetch='none')
        except Exception as exc:
            mes = self.fbExcText(exc)
            raise HTTPRedirect('verifyTask?tid=%s&mes=%s' % (tid, mes))
        else:
            raise HTTPRedirect('main')

    verifyTaskEnd.exposed = True

    def verifyUser(self, uid, mes=None):
        m = self.userGetMan(uid=uid)
        tl = self.dbExec(sql='select * from WH_VERIFY_MAN_TASKLIST(?)', params=[m['MANID']], fetch='all')
        return self.drawTemplate(templ=self.tmplUser, data=[tl, m, {'mes': mes, 'backurl': 'main', 'uid': uid}])

    verifyUser.exposed = True

    def verifyUserTask(self, tid, **args):
        t = self.taskInfo(id=tid)
        if t['TTCODE'] == 'SELECT':
            args['t'] = t
            return self.verifyUserTaskSelect(tid=tid, **args)
        tw = self.dbExec(sql="select * from WH_VERIFY_TASK_WARESLIST(?)", params=[tid], fetch='all')
        mes = args['mes'] if 'mes' in args else None
        return self.drawTemplate(templ=self.tmplUserTask, data=[t, tw, {'mes': mes, 'backurl': 'main'}])

    verifyUserTask.exposed = True

    def verifyUserTaskSelect(self, tid, **args):
        t = args['t'] if 't' in args else self.taskInfo(id=tid)
        tw = self.dbExec(sql="select * from WH_VERIFY_TASK_WARESLIST(?)", params=[tid], fetch='all')
        mes = args['mes'] if 'mes' in args else None
        rlu = 'verifyUserTask?tid=%s' % tid
        return self.drawTemplate(templ=self.tmplUserTaskSelect,
                                 data=[t, tw, {'mes': mes, 'backurl': 'main', 'reloadurl': rlu}])

    def qVerifyUserTaskSelectTWCancel(self, twid, tid):
        try:
            self.dbExec(sql='execute procedure WH_SELECT_TW_CANCEL(?)', params=[twid], fetch='none')
        except Exception as exc:
            mes = self.fbExcText(exc)
            raise self.httpRedirect('verifyUserTask?tid=%s&mes=%s' % (tid, mes))
        else:
            raise self.httpRedirect('main')

    qVerifyUserTaskSelectTWCancel.exposed = True


    def clearUserTask(self, tid,uid):
        try:
            data = self.dbExec(sql="select * from RBS_TASKVIEW_UNSETWORKER(?)", params=[tid], fetch='one')
        except Exception as exc:
            mes = self.fbExcText(exc)
            raise self.httpRedirect('verifyUser?uid=%s&mes=%s' % (uid, mes))
        else:
            raise self.httpRedirect('verifyUser?uid=%s' % (uid))

    clearUserTask.exposed = True