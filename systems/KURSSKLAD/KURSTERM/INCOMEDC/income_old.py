# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.pallet import TCommonPallet

#Import Templates
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.index import index
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.task import task
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskBL import taskBL
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskSite import taskSite
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWares import taskWares
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresTaraWeight import taskWaresTaraWeight
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresPrDates import taskWaresPrDates
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAdd import taskWaresAdd
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAddGS1Box import taskWaresAddGS1Box
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresLot import taskWaresLot
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresLotReadOnly import taskWaresLotReadOnly
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.printer import printer
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.pallet import pallet
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.rangeWares import rangeWares
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresPrinterWLIncome import taskWaresPrinterWLIncome
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresPrinter import taskWaresPrinter
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.rangeBarcodeTask import rangeBarcodeTask
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.menu import menu

from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAddAlcoPal import taskWaresAddAlcoPal
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAddAlcoBox import taskWaresAddAlcoBox
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAddAlcoBoxMark import taskWaresAddAlcoBoxMark
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAddAlcoBoxPrint import taskWaresAddAlcoBoxPrint

from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAddEgaisBox import taskWaresAddEgaisBox
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAddEgaisMark import taskWaresAddEgaisMark
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAddEgaisPrDate import taskWaresAddEgaisPrDate

from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresAddEditGGP import taskWaresAddEditGGP
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskWaresNoSelGroup import taskWaresNoSelGroup
from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskSGPrinter import taskSGPrinter

from systems.KURSSKLAD.cheetahutils import TimeStampToDate


class TIncome(TCommonPallet):

    def defaultProductDate(self):
        """ Дата производтсва, которая проставится по умолчанию в форме приемки """
        return self.dateMask

    def qTaskWaresStartChk(self, tid, wid):
        """ Процедура проверки начала приемки позиции """
        return self.dbExec(sql='select * from WH_INCOME_TW_STARTCHK(?,?)', params=[tid, wid], fetch='one')

    chkIncomeTerm = True # проверять ли дату производства на период приемки в ТСД форме приемки позиции
    helpSystem = False # показывать ли ссылку мануал по интерфейсу
    titleTaskWaresPrDates = _('Даты производства') #Заголовок ссылки просмотра дат производства, False - не показывать

    urlTaskPrinter = False # ссылка перехода к принтеру при сканировании в задании
    urlTaskWaresPrinter = 'taskWaresPrinter' # ссылка перехода к принтеру при сканировании в позиции задания

    type = None
    
    tmplIndex = index
    tmplTask = task
    tmplRangeWares = rangeWares
    tmplTaskBL = taskBL
    tmplTaskSite = taskSite
    tmplTaskWares = taskWares
    tmplTaskWaresTaraWeight = taskWaresTaraWeight
    tmplTaskWaresPrDates = taskWaresPrDates
    tmplTaskWaresAdd = taskWaresAdd
    tmplTaskWaresAddGS1Box = taskWaresAddGS1Box
    tmplTaskWaresLot = taskWaresLot
    tmplTaskWaresLotReadOnly = taskWaresLotReadOnly
    tmplPrinter = printer
    tmplPallet = pallet
    tmplTaskWaresPrinter = taskWaresPrinter
    tmplTaskWaresPrinterWLIncome = taskWaresPrinterWLIncome
    tmplRangeBarcodeTask = rangeBarcodeTask
    tmplMenu = menu

    tmplTaskWaresAddAlcoPal = taskWaresAddAlcoPal
    tmplTaskWaresAddAlcoBox = taskWaresAddAlcoBox
    tmplTaskWaresAddAlcoBoxPrint = taskWaresAddAlcoBoxPrint
    tmplTaskWaresAddAlcoBoxMark = taskWaresAddAlcoBoxMark

    tmplTaskWaresAddEgaisBox = taskWaresAddEgaisBox
    tmplTaskWaresAddEgaisPrDate = taskWaresAddEgaisPrDate
    tmplTaskWaresAddEgaisMark = taskWaresAddEgaisMark

    tmplTaskWaresAddEditGGP = taskWaresAddEditGGP
    tmplTaskWaresNoSelGroup = taskWaresNoSelGroup
    tmplTaskSGPrinter = taskSGPrinter

    def taskWaresStartChk(func):
        def wrapped(self, **kwargs):
            tid = kwargs['tid']
            wid = kwargs['wid']
            twchk = self.qTaskWaresStartChk(tid=tid, wid=wid)
            if twchk['ERR_TYPE']:
                if twchk['ERR_TYPE'] == 'UMAIN':
                    raise self.httpRedirect('taskWaresAddEditGGP?tid=%s&wid=%s&ewuid=%s&action_caption=%s' %
                                       (tid, wid, twchk['err_wuid'], _('Необходимо ввести ГГР основной ЕИ')))
                elif twchk['ERR_TYPE'] == 'UVIEW':
                    raise self.httpRedirect('taskWaresAddEditGGP?tid=%s&wid=%s&ewuid=%s&action_caption=%s' %
                                       (tid, wid, twchk['err_wuid'], _('Необходимо ввести ГГР единицы отображения')))
                elif twchk['ERR_TYPE'] == 'TARAWEIGHT':
                    raise self.httpRedirect('taskWaresTaraWeight?tid=%s&wid=%s' % (tid, wid))
            return func(self, **kwargs)
        return wrapped

    def qTaskJoin(self, tid):
        try:
            self.dbExec(sql="execute procedure K_SESSION_JOIN_TASK(?,?)", params=[tid, self.getIfaceVar('wmsid')],
                        fetch='none')
        except Exception as exc:
            raise self.httpRedirect('main?mes=%s' % (self.fbExcText(exc)))

    def qTaskWaresNoSelGroup(self, tid):
        return self.dbExec(sql="select * from WH_INCOME_T_WARESNOSG(?)", params=[tid], fetch='all')

    def taskWaresNoSelGroup(self, tid, **args):
        t = args['t'] if 't' in args else self.taskInfo(id=tid)
        w = args['w'] if 'w' in args else self.qTaskWaresNoSelGroup(tid=tid)
        backurl = args['backurl'] if 'backurl' in args else 'main'
        return self.drawTemplate(templ=self.tmplTaskWaresNoSelGroup, data=[t, w, {'backurl': backurl}])

    taskWaresNoSelGroup.exposed = True

    def qTaskWaresAddExtDatalist(self, tid, wid):
        pass

    def index(self):
        self.type = None
        super().index()
        return self.main()

    index.exposed = True

    def qTaskBarcodeInfo(self, tid, barcode, wid=None):
        return self.dbExec(sql="select * from WH_INCOME_BARCODE_WARESLIST(?,?)", params=[tid, barcode], fetch='all')

    def qTaskPalBarcodeInfo(self, tid, barcode):
        if barcode:
            return self.dbExec(sql="select * from WH_INCOME_PALBARCODE_INFO(?,?)", params=[tid, barcode], fetch='one')
            
    def qTaskEgaisPalBarcodeInfo(self, tid, barcode):
        return self.dbExec(sql="select * from WH_INCOME_EGAISPAL_BC_INFO(?,?,?)",
                           params=[tid, barcode, self.whSesId()], fetch='one')

    def qTaskEgaisBoxBarcodeInfo(self, tid, barcode):
        return self.dbExec(sql="select * from WH_INCOME_EGAISBOX_BC_INFO(?,?,?)",
                           params=[tid, barcode, self.whSesId()], fetch='one')

    def qTaskWaresPrDateInfo(self, tid, wid, prdate):
        return self.dbExec(sql="select * from wh_income_tw_prdate_info(?,?,?)", params=[tid, wid, prdate], fetch='one')

    def qTaskWaresTaraInfo(self, tid, wid):
        return self.dbExec(sql='select * from WH_INCOME_TW_NEEDTARAWEIGHT(?,?)', params=[tid, wid], fetch='one')

    def qTaskWaresExtData(self, tid, wid):
        return self.dbExec(sql='select * from WH_INCOME_TW_EXTDATA(?,?)', params=[tid, wid], fetch='one')

    def qWaresLotInfo(self, wlotid):
        return self.dbExec(sql="select wlotid,productdate from wareslot wl where wlotid=?", fetch='one', params=[wlotid])

    def chgZone(self, id):
        try:
            self.dbExec(sql="execute procedure WH_SESSION_SETZONE(?,?)", params=[self.whSesId(), id],
                        fetch='none')
        except Exception as exc:
            raise self.httpRedirect('main?mes=%s' % (self.fbExcText(exc)))
        else:
            raise self.httpRedirect('main')

    chgZone.exposed = True

    def menu(self, type=None):
        self.type = type
        raise self.httpRedirect('main')

    menu.exposed = True

    """def main(self, barcode=None, mes=None):
        tnd = self.dbExec(sql="select * from WH_INCOME_NOTDONE(?)", params=[self.whSesId()], fetch='one')
        if tnd and tnd['TID']:
            if tnd['BOXBC']:
                if tnd['BOXBCSUBTYPE'] == 'ALCO:BOX':
                    if tnd['EXTFL'] == 'M':
                        url = 'taskWaresAddAlcoBoxMark?tid=%s&wid=%s&boxbarcode=%s' % (tnd['TID'], tnd['WID'], tnd['BOXBC'])
                    else:
                        url = 'taskWaresAddAlcoBox?tid=%s&wid=%s' % (tnd['TID'], tnd['WID'])
                    if tnd['PALBC']:
                        url += '&palbarcode=%s' % tnd['PALBC']
                    raise self.httpRedirect(url)
        if barcode:
            mes = _('Не верный ШК')
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'DOCUMENT':
                    t = self.dbExec(sql="select * from K_WH_INCOME_LISTDOCS(?) where docid=?",
                                    params=[self.whSesId(), self.kId(bcInfo['RECORDID'])], fetch='one')
                    if t and t['taskid']:
                        raise self.httpRedirect('task?tid=%s' % (t['taskid']))
                elif bcInfo['USERCODE'] == 'PRINTER':
                    raise self.httpRedirect('printer?id=%s' % (self.kId(bcInfo['RECORDID'])))
            bcInfo = self.dbExec(sql="select * from WH_INCOME_WARESBC_USERTASKLIST(?,?)",
                                 params=[barcode, self.whSesId()], fetch='all')
            if bcInfo['datalist']:
                if len(bcInfo['datalist']) == 1:
                    raise self.httpRedirect('taskWaresScan?tid=%s&barcode=%s' % (bcInfo['datalist'][0]['TASKID'], barcode))
                return self.drawTemplate(templ=self.tmplRangeBarcodeTask, data=[bcInfo, {'barcode': barcode}])
        docs = self.dbExec(sql="select * from K_WH_INCOME_LISTDOCS(?)", params=[self.whSesId()], fetch='all')
        zonedocs = self.dbExec(sql="select * from K_WH_INCOME_LISTOBJDOCS(?)", params=[self.whSesId()],
                               fetch='all')
        zonedocs['zd'] = zonedocs['datalist']
        del zonedocs['datalist']
        return self.drawTemplate(templ=self.tmplIndex, data=[docs, zonedocs, {'mes': mes, 'reloadurl': 'main'}])

    main.exposed = True"""

    def main(self, barcode=None, mes=None):
        if not self.type:
            return self.drawTemplate(templ=self.tmplMenu, data=[{'mes': mes}])
        tnd = self.dbExec(sql="select * from WH_INCOME_NOTDONE(?)", params=[self.whSesId()], fetch='one')
        if tnd and tnd['TID']:
            if tnd['BOXBC']:
                if tnd['BOXBCSUBTYPE'] == 'ALCO:BOX':
                    if tnd['EXTFL'] == 'M':
                        url = 'taskWaresAddAlcoBoxMark?tid=%s&wid=%s&boxbarcode=%s' % (
                        tnd['TID'], tnd['WID'], tnd['BOXBC'])
                    else:
                        url = 'taskWaresAddAlcoBox?tid=%s&wid=%s' % (tnd['TID'], tnd['WID'])
                    if tnd['PALBC']:
                        url += '&palbarcode=%s' % tnd['PALBC']
                    raise self.httpRedirect(url)
        if barcode:
            mes = _('Не верный ШК')
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'DOCUMENT':
                    t = self.dbExec(sql="select * from K_WH_INCOME_LISTDOCS(?) where docid=?",
                                    params=[self.whSesId(), self.kId(bcInfo['RECORDID'])], fetch='one')
                    if t and t['taskid']:
                        raise self.httpRedirect('task?tid=%s' % (t['taskid']))
                elif bcInfo['USERCODE'] == 'PRINTER':
                    raise self.httpRedirect('printer?id=%s' % (self.kId(bcInfo['RECORDID'])))
            bcInfo = self.dbExec(sql="select * from WH_INCOME_WARESBC_USERTASKLIST(?,?)",
                                 params=[barcode, self.whSesId()], fetch='all')
            if bcInfo['datalist']:
                if len(bcInfo['datalist']) == 1:
                    raise self.httpRedirect(
                        'taskWaresScan?tid=%s&barcode=%s' % (bcInfo['datalist'][0]['TASKID'], barcode))
                return self.drawTemplate(templ=self.tmplRangeBarcodeTask, data=[bcInfo, {'barcode': barcode}])
        docs = self.dbExec(sql="select * from K_WH_INCOME_LISTDOCS_BYCODE(?, ?)", params=[self.whSesId(), self.type], fetch='all')
        zonedocs = self.dbExec(sql="select * from K_WH_INCOME_LISTOBJDOCS(?)", params=[self.whSesId()],
                               fetch='all')
        zonedocs['zd'] = zonedocs['datalist']
        del zonedocs['datalist']
        return self.drawTemplate(templ=self.tmplIndex, data=[docs, zonedocs, {'mes': mes, 'reloadurl': 'main', 'backurl':'index'}])

    main.exposed = True

    def taskWaresSelGroup(self, tid, wid, **args):
        backurl = 'taskWaresNoSelGroup?tid=%s' % tid
        args['href'] = 'taskWaresSelGroup?tid=%s&wid=%s&sgid=' % (tid, wid)
        return self.whWaresSelGroup(waresid=wid, backurl=backurl, **args)

    taskWaresSelGroup.exposed = True

    def task(self, tid, **args):
        if self.clientConf.incomeTaskWaresChkSelGroup:
            w=self.qTaskWaresNoSelGroup(tid=tid)
            if len(w['datalist']) > 0:
                return self.taskWaresNoSelGroup(tid=tid, w=w)
        self.qTaskJoin(tid)
        t = self.taskInfo(tid)
        if not t['SITEID']:
            raise self.httpRedirect('taskSite?tid=%s' % tid)
        if not 'showList' in args:
            showList = self.getIfaceVar('taskShowList')
            if showList is None:
                showList = '0'
        else:
            showList = args['showList']
        self.setIfaceVar('taskShowList', showList)
        if showList != '0':
            tw = self.dbExec(sql="select * from K_WH_INCOME_LISTWARES(?)", params=[tid], fetch='all')
        else:
            tw = None
        mes = args['mes'] if 'mes' in args else None
        params = {
            'mes': mes, 'showList':
                showList, 'backurl': 'main',
            'twMode': self.clientConf.incomeTaskWaresMode
        }
        return self.drawTemplate(templ=self.tmplTask, data=[t, tw, params])

    task.exposed = True

    def taskBL(self, **args):
        tid = args['tid']
        pw = ''
        pq = ''
        mes = None
        for i in args:
            if i[0] == 'w':
                wid = i[1:]
                if args[i]:
                    pw = pw + wid + ';'
                    pq = pq + args[i] + ';'
        if pw != '' and pq != '':
            try:
                self.dbExec(sql="execute procedure K_WH_INCOME_BL_SET(?,?,?)", fetch="none", params=[tid, pw, pq])
            except Exception as exc:
                mes = exc[1]
            else:
                raise self.httpRedirect('task?tid=%s' % tid)

        t = self.taskInfo(tid)
        tw = self.dbExec(sql="select * from K_WH_INCOME_BL_LISTWARES(?)", params=[tid], fetch='all')
        return self.drawTemplate(templ=self.tmplTaskBL, data=[t, tw, {'mes': mes, 'backurl': 'task?tid=%s' % (tid),
                                                                      'treeName': '№%s' % (tid)}])

    taskBL.exposed = True

    def taskSite(self, tid, barcode=None):
        if barcode:
            mes = _('Не верный ШК')
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo and bcInfo['USERCODE'] == 'SITE':
                try:
                    self.dbExec(sql="execute procedure K_WH_INCOMEDC_SET_SITE(?,?)",
                                params=[tid, self.kId(bcInfo['RECORDID'])], fetch='none')
                except Exception as exc:
                    mes = self.fbExcText(exc)
                else:
                    raise self.httpRedirect('task?tid=%s' % tid)
        else:
            mes = None
        return self.drawTemplate(templ=self.tmplTaskSite,
                                 data=[self.taskInfo(tid), {'mes': mes, 'backurl': 'main', 'treeName': '№%s' % tid}])

    taskSite.exposed = True

    def taskWares(self, tid, wid=None, wuid=None, mes=None):
        if wid is None and wuid:
            wu = self.waresUnitInfo(waresunitid=wuid)
            wid = wu['waresid']
        wid = self.kId(wid)
        w = self.waresInfo(wid)
        ed = self.qTaskWaresExtData(tid=tid, wid=wid)
        params = {'mes': mes, 'backurl': 'task?tid=%s' % tid, 'treeName': '№%s' % tid}
        tl = self.dbExec(sql="select * from K_WH_INCOME_LISTWARESLOT(?,?)", params=[tid, wid], fetch='all')
        if not mes and len(tl['datalist']) == 0 and w['IS_VET'] != '1' and w['IS_ALCO'] != '1' and not ed['ALCOALGO']:
            if wuid:
                raise self.httpRedirect('taskWaresAdd?tid=%s&wid=%s&wuid=%s' % (tid, wid, wuid))
            else:
                raise self.httpRedirect('taskWaresAdd?tid=%s&wid=%s' % (tid, wid))
        t = self.taskInfo(tid)
        wz = self.objWaresIncomeZone(objid=t['TOID'], waresid=wid)
        return self.drawTemplate(templ=self.tmplTaskWares, data=[t, w, tl, wz, ed, params])

    taskWares.exposed = True

    def taskWaresReadOnly(self, tid, wid, mes=None):
        wid = self.kId(wid)
        w = self.waresInfo(wid)
        ed = self.qTaskWaresExtData(tid=tid, wid=wid)
        params = {'mes': mes, 'backurl': 'task?tid=%s' % tid, 'treeName': '№%s' % tid, 'twMode': 'ReadOnly'}
        tl = self.dbExec(sql="select * from K_WH_INCOME_LISTWARESLOT(?,?)", params=[tid, wid], fetch='all')
        t = self.taskInfo(tid)
        wz = self.objWaresIncomeZone(objid=t['TOID'], waresid=wid)
        return self.drawTemplate(templ=self.tmplTaskWares, data=[t, w, tl, wz, ed, params])

    taskWaresReadOnly.exposed = True

    def taskWaresTaraWeight(self, tid, wid, mes=None, weight=None):
        wid = self.kId(wid)
        if weight:
            try:
                self.dbExec(sql='execute procedure WH_INCOME_TW_SETTARAWEIGHT(?,?,?)',
                            params=[tid, wid, weight], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
        tara = self.qTaskWaresTaraInfo(tid=tid, wid=wid)
        w = self.waresInfo(wid)
        params = {'mes': mes, 'backurl': 'taskWares?tid=%s&wid=%s' % (tid, wid)}
        t = self.taskInfo(tid)
        return self.drawTemplate(templ=self.tmplTaskWaresTaraWeight, data=[t, w, tara, params])

    taskWaresTaraWeight.exposed = True

    def taskWaresPrDates(self, tid, wid=None):
        wid = self.kId(wid)
        params = {'backurl': 'taskWares?tid=%s&wid=%s' % (tid, wid), 'treeName': '№%s' % tid}
        tl = self.dbExec(sql="select * from WH_INCOME_TWPRDATES(?,?)", params=[tid, wid], fetch='all')
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        aa = self.dbExec(sql='select * from WH_TINCOME_TW_ALCO_ALGO(?,?)', params=[tid, wid], fetch='one')
        return self.drawTemplate(templ=self.tmplTaskWaresPrDates, data=[t, w, tl, aa, params])

    taskWaresPrDates.exposed = True

    def taskWaresScan(self, tid, barcode, wid=None):
        mes = _('ШК не обрабатывается')
        bcInfo = self.whBarCodeInfo(barcode)
        if bcInfo:
            if bcInfo['USERCODE'] == 'PALLET':
                url = 'pallet?id=%s&tid=%s' % (bcInfo['RECORDID'], tid)
                if wid: url += '&wid=%s' % (wid)
                raise self.httpRedirect(url)
            elif bcInfo['USERCODE'] == 'PRINTER':
                if wid:
                    if self.urlTaskWaresPrinter:
                        r = self.dbExec(sql='select * from WH_PRINTER_REPORT_CHK(?,?,?)', fetch='one',  params=[self.kId(bcInfo['RECORDID']), None, 'WLINCOME'])
                        if r['res'] == '1':
                            raise self.httpRedirect(self.urlTaskWaresPrinter + '?tid=%s&wid=%s&printerid=%s' % (tid, wid, bcInfo['RECORDID']))
                        else:
                            raise self.httpRedirect('taskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, _('Нельзя печатать на этот принтер!')))
                else:
                    if self.urlTaskPrinter:
                        raise self.httpRedirect(self.urlTaskPrinter + '?tid=%s&prid=%s' % (tid, bcInfo['RECORDID']))
            else:
                mes = _('Не верный ШК')
        else:
            try:
                bc = self.qTaskBarcodeInfo(tid=tid, barcode=barcode)
            except Exception as exc:
                if wid:
                    raise self.httpRedirect('taskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, self.fbExcText(exc)))
                else:
                    raise self.httpRedirect('task?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
            else:
                if bc and bc['datalist'] and len(bc['datalist']) > 0:
                    if len(bc['datalist']) == 1:
                        bc0 = bc['datalist'][0]
                        if bc0['USERCODE'] == 'WARESUNIT':
                            raise self.httpRedirect('taskWares?tid=%s&wid=%s&wuid=%s' % (tid, bc0['WID'], bc0['WUID']))
                        elif bc0['USERCODE'] == 'WARES':
                            raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, bc0['WID']))
                        elif bc0['USERCODE'] == 'GS1':
                            barcode = bc0['REBUILTBARCODE']
                            if bc0['BCSUBTYPE'] == 'ALCO:PAL':
                                raise self.httpRedirect('taskWaresAddAlcoBox?tid=%s&wid=%s&palbarcode=%s' %
                                                   (tid, bc0['WID'], barcode))
                            elif bc0['BCSUBTYPE'] == 'ALCO:BOX':
                                raise self.httpRedirect('taskWaresAddAlcoBox?tid=%s&wid=%s&barcode=%s' % (tid, bc0['WID'], barcode))
                            elif bc0['PRDATE']:
                                raise self.httpRedirect('taskWaresAddGS1Box?tid=%s&wid=%s&barcode=%s' %
                                                   (tid, bc0['WID'], barcode))
                            else:
                                mes = _('ШК в формате GS1, но не обрабатываемого вида!')
                        elif bc0['USERCODE'] == 'WARESWEIGHT' or bc0['USERCODE'] == 'SUPWEIGHT':
                            raise self.httpRedirect('taskWaresAdd?tid=%s&wid=%s&amount=%s' % (tid, bc0['WID'], bc0['AMOUNT']))
                    else:
                        t = self.taskInfo(tid)
                        p = {'barcode': barcode, 'backurl': 'task?tid=%s' % tid, 'treeName': '№%s' % tid}
                        return self.drawTemplate(templ=self.tmplRangeWares, data=[t, bc, p])
                else:
                    mes = _('Не верный ШК')
        if wid:
            raise self.httpRedirect('taskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, mes))
        else:
            raise self.httpRedirect('task?tid=%s&mes=%s' % (tid, mes))

    taskWaresScan.exposed = True

    def taskWaresPrinter(self, tid, wid, printerid, wlincomeid=None, cnt=None, mes=None):
        if cnt:
            try:
                self.dbExec(sql="execute procedure WH_PRINT_WLINCOME_TASKCREATE(?,?,?,?)",
                            params=[self.whSesId(), wlincomeid, printerid, cnt], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
    
        p = self.printerInfo(printerid=printerid)
        r = self.reportInfo(reportcode='WLINCOME')
        w = self.waresInfo(waresid=wid)
        if not wlincomeid:
            wlin = self.dbExec(sql="select * from WH_INCOME_TASKWARES_WLINCOMES(?,?)", fetch="all", params=[tid, wid])
            backurl = 'taskWares?tid=%s&wid=%s' % (tid, wid)
            return self.drawTemplate(templ=self.tmplTaskWaresPrinterWLIncome, data=[w, p, r, wlin, {'tid': tid, 'backurl': backurl, 'mes': mes}])
        else:
            wlin = self.dbExec(sql="select * from WH_TVERIFY_WARESLOTINCOME(?)", fetch="one", params=[wlincomeid])
            backurl = 'taskWaresPrinter?tid=%s&wid=%s&printerid=%s' % (tid, wid, printerid)
            return self.drawTemplate(templ=self.tmplTaskWaresPrinter, data=[w, p, r, wlin, {'tid': tid, 'backurl': backurl, 'mes': mes}])
    taskWaresPrinter.exposed = True

    def taskWaresAddAfter(self, tid, wid):
        t = self.taskInfo(id=tid)
        if int(t['TSESID']) == int(self.whSesId()):
            raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
        else:
            raise self.httpRedirect('main')

    def taskWaresAddBack(self, tid, wid):
        self.dbExec(sql='execute procedure WH_INCOME_THEBARCODE_UNLOCK(?,?)', fetch='none',
                    params=[tid, self.whSesId()])
        self.taskWaresAddAfter(tid=tid, wid=wid)
    taskWaresAddBack.exposed = True

    @taskWaresStartChk
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
                    if prDateData['PALFACTOR']:
                        raise self.httpRedirect('taskWaresAddEgaisBox?tid=%s&wid=%s&prdate=%s' % (tid, wid, prdate))
                    else:
                        raise self.httpRedirect('taskWaresAddEgaisBox?tid=%s&wid=%s&prdate=%s' % (tid, wid, prdate))
        t = self.taskInfo(id=tid)
        w = self.waresInfo(waresid=wid)
        return self.drawTemplate(templ=self.tmplTaskWaresAddEgaisPrDate, data=[t, w, params])
    taskWaresAddEgaisPrDate.exposed = True

    def taskWaresAddEgaisBox(self, tid, wid, prdate, barcode=None):
        params = {}
        if barcode:
            try:
                bL = self.barcodeLike(barcode=barcode)
            except Exception as exc:
                params['mes'] = self.fbExcText(exc)
            else:
                if bL == 'ALCO:BOX':
                    try:
                        rlock = self.dbExec(sql='select * from WH_INCOME_EGAISBOX_LOCK(?,?,?,?,?)', fetch='one',
                                            params=[barcode, tid, wid, prdate, self.whSesId()])
                    except Exception as exc:
                        params['mes'] = self.fbExcText(exc)
                    else:
                        if rlock['RES'] == 'L':
                            t = self.taskInfo(id=tid)
                            if t['DOCSBCODE'] == 'M':
                                url = 'taskWaresAddEgaisMark?tid=%s&wid=%s&boxbarcode=%s' % (tid, wid, barcode)
                                raise self.httpRedirect(url)
                        else:
                            params['mes'] = _('Вы уже сканировали этот ШК')
                else:
                    try:
                        r = self.dbExec(sql='select * from WH_INCOMEDC_DO_EGAIS(?,?,?)', fetch='one',
                                            params=[tid, barcode, self.whSesId()])
                    except Exception as exc:
                        params['mes'] = self.fbExcText(exc)
                    else:
                        if r['R'] == 'E':
                            raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
        t = self.taskInfo(id=tid)
        ebll = self.egaisBoxLastLock(taskid=tid)
        if t['DOCSBCODE'] == 'M' and ebll['EBLLBC']:
            raise self.httpRedirect('taskWaresAddEgaisMark?tid=%s&wid=%s&boxbarcode=%s' % (tid, wid, ebll['EBLLBC']))
        bcl = self.egaisBoxCntLock(taskid=tid)
        w = self.waresInfo(waresid=wid)
        twPrDateInfo = self.qTaskWaresPrDateInfo(tid=tid, wid=wid, prdate=prdate)
        params['PRDATE'] = prdate
        return self.drawTemplate(templ=self.tmplTaskWaresAddEgaisBox, data=[t, w, twPrDateInfo, bcl, ebll, params])
    taskWaresAddEgaisBox.exposed = True

    def taskWaresAddEgaisMark(self, tid, wid, boxbarcode=None, barcode=None, barcodeconf=None):
        theBC = self.qTaskEgaisBoxBarcodeInfo(tid=tid, barcode=boxbarcode)
        params = {'THEBC': theBC}
        bcl = None
        if barcode:
            if self.barcodeLike(barcode=barcode) == 'ALCOMARK':
                try:
                    l = self.dbExec(sql='select * from wh_income_alcomark_lock(?,?,?,?)', fetch='one',
                                    params=[boxbarcode, barcode, tid,  self.whSesId()])
                except Exception as exc:
                    params['mes'] = self.fbExcText(exc)
                else:
                    if l['RES'] == 'R':
                        params['mes'] = _('Вы уже сканировали эту алкомарку')
            elif self.barcodeLike(barcode) == 'PALLET':
                flDo = False
                if barcodeconf == barcode:
                    flDo = True
                else:
                    bcl = self.egaisBoxCntLock(taskid=tid)
                    if float(theBC['BOXFACTOR']) == float(bcl['CNTMARKLOCK']):
                        flDo = True
                    else:
                        #params['BARCODECONF'] = barcode
                        params['BARCODECONFMES'] = _('Количество марок и кратность короба не совпадают')
                if flDo:
                    try:
                        self.dbExec(sql="execute procedure WH_INCOMEDC_DO_EGAISMARK(?,?,?,?)", fetch='none',
                                    params=[tid, barcode, boxbarcode, self.whSesId()])
                    except Exception as exc:
                        params['mes'] = self.fbExcText(exc)
                    else:
                        prdate = TimeStampToDate(theBC['PRODUCTDATE'])
                        raise self.httpRedirect('taskWaresAddEgaisBox?tid=%s&wid=%s&prdate=%s' % (tid, wid, prdate))
            else:
                params['mes'] = _('ШК не обрабатывается в этом интерфейсе')
        t = self.taskInfo(id=tid)
        w = self.waresInfo(waresid=wid)
        if not bcl:
            bcl = self.egaisBoxCntLock(taskid=tid)
        params['BOXBARCODE'] = boxbarcode
        return self.drawTemplate(templ=self.tmplTaskWaresAddEgaisMark, data=[t, w, bcl, params])
    taskWaresAddEgaisMark.exposed = True

    def taskWaresAddEgaisBack(self, tid, wid):
        self.dbExec(sql='execute procedure WH_INCOME_EGAIS_UNLOCK(?,?)', fetch='none',
                    params=[tid, self.whSesId()])
        self.taskWaresAddAfter(tid=tid, wid=wid)
    taskWaresAddEgaisBack.exposed = True


    @taskWaresStartChk
    def taskWaresAddAlcoPal(self, tid, wid, barcode=None):
        params = {'backurl': 'taskWares?tid=%s&wid=%s' % (tid, wid)}
        if barcode:
            try:
                bc = self.qTaskBarcodeInfo(tid=tid, barcode=barcode)
            except Exception as exc:
                params['mes'] = self.fbExcText(exc)
            else:
                if bc['datalist'] and len(bc['datalist']) == 1 and bc['datalist'][0]['BCSUBTYPE'] == 'ALCO:PAL':
                    if self. kId(bc['datalist'][0]['WID']) == self.kId(wid):
                        palbarcode = bc['datalist'][0]['REBUILTBARCODE']
                        raise self.httpRedirect('taskWaresAddAlcoBox?tid=%s&wid=%s&palbarcode=%s' % (tid, wid, palbarcode))
                    else:
                        params['mes'] = _('Шк относится к другому товару')
                else:
                    params['mes'] = _('Отсканируйте ШК паллета постащика в формате GS1_128')
        t = self.taskInfo(id=tid)
        w = self.waresInfo(waresid=wid)
        return self.drawTemplate(templ=self.tmplTaskWaresAddAlcoPal, data=[t, w, params])
    taskWaresAddAlcoPal.exposed = True

    @taskWaresStartChk
    def taskWaresAddAlcoBox(self, tid, wid, palbarcode='', barcode=None):
        params = {}
        if barcode:
            try:
                bc = self.qTaskBarcodeInfo(tid=tid, barcode=barcode)
            except Exception as exc:
                params['mes'] = self.fbExcText(exc)
            else:
                if bc['datalist'] and len(bc['datalist'])>0:
                    if len(bc['datalist']) == 1 and bc['datalist'][0]['BCSUBTYPE'] == 'ALCO:BOX':
                        bc0 = bc['datalist'][0]
                        try:
                            rlock = self.dbExec(sql='select * from wh_income_thebarcode_lock(?,?,?,?)', fetch='one',
                                                params=[bc0['REBUILTBARCODE'], tid, self.whSesId(), palbarcode])
                        except Exception as exc:
                            params['mes'] = self.fbExcText(exc)
                        else:
                            if rlock['RES'] == 'L':
                                boxbarcode = bc0['REBUILTBARCODE']
                                if boxbarcode != barcode:
                                    url = 'taskWaresAddAlcoBoxPrint?tid=%s&wid=%s&boxbarcode=%s&palbarcode=%s' % (tid, wid, boxbarcode, palbarcode)
                                    raise self.httpRedirect(url)
                                t = self.taskInfo(id=tid)
                                if t['DOCSBCODE'] == 'M':
                                    url = 'taskWaresAddAlcoBoxMark?tid=%s&wid=%s&boxbarcode=%s&palbarcode=%s' % (tid, wid, boxbarcode, palbarcode)
                                    raise self.httpRedirect(url)
                            else:
                                params['mes'] = _('Вы уже сканировали этот ШК')
                    else:
                        params['mes'] = _('Отсканирован не верный тип ШК товара')
                else:
                    try:
                        r = self.dbExec(sql='select * from WH_INCOMEDC_DO_GS1(?,?,?,?)', fetch='one',
                                            params=[tid, barcode, palbarcode, self.whSesId()])
                    except Exception as exc:
                        params['mes'] = self.fbExcText(exc)
                    else:
                        if r['R'] == 'E':
                            raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
        t = self.taskInfo(id=tid)
        bcll = self.theBarcodeLastLock(taskid=tid, bctype='BOX')
        if t['DOCSBCODE'] == 'M' and bcll['THEBCLASTLOCK']:
            url = 'taskWaresAddAlcoBoxMark?tid=%s&wid=%s&boxbarcode=%s&palbarcode=%s' % (
            tid, wid, bcll['THEBCLASTLOCK'], palbarcode)
            raise self.httpRedirect(url)

        w = self.waresInfo(waresid=wid)
        pbcInfo = self.qTaskPalBarcodeInfo(tid=tid, barcode=palbarcode)
        bcl = self.theBarcodeCntLock(taskid=tid, bctype='BOX')
        params['THEBC'] = self.whBarcodeGS1Info(barcode=bcll['THEBCLASTLOCK'])
        return self.drawTemplate(templ=self.tmplTaskWaresAddAlcoBox, data=[t, w, pbcInfo, bcl, params])
    taskWaresAddAlcoBox.exposed = True

    def taskWaresAddAlcoBoxPrint(self, tid, wid, boxbarcode=None, palbarcode='', barcode=None):
        params = {}
        if barcode:
            try:
                bc = self.whBarCodeInfo(barcode=barcode, codes='PRINTER')
            except Exception as exc:
                params['mes'] = self.fbExcText(exc)
            else:
                if bc and bc['RECORDID']:
                    try:
                        self.dbExec(sql='execute procedure wh_thebarcode_print(?,?,?)', fetch='none',
                                 params=[self.getUserVar('userfio'), boxbarcode, self.kId(bc['RECORDID'])])
                    except Exception as exc:
                        params['mes'] = self.fbExcText(exc)
                    else:
                        t = self.taskInfo(id=tid)
                        if t['DOCSBCODE'] == 'M':
                            url = 'taskWaresAddAlcoBoxMark?tid=%s&wid=%s&boxbarcode=%s&palbarcode=%s' % (tid, wid, boxbarcode, palbarcode)
                            raise self.httpRedirect(url)
                        raise self.httpRedirect('taskWaresAddAlcoBox?tid=%s&wid=%s&palbarcode=%s' % (tid, wid, palbarcode))
                else:
                    params['mes'] = _('Отсканируйте ШК Принтера')
        t = self.taskInfo(id=tid)
        w = self.waresInfo(waresid=wid)
        pbcInfo = self.qTaskPalBarcodeInfo(tid=tid, barcode=palbarcode)
        params['THEBC'] = self.whBarcodeGS1Info(barcode=boxbarcode)
        params['BOXBARCODE'] = boxbarcode
        return self.drawTemplate(templ=self.tmplTaskWaresAddAlcoBoxPrint, data=[t, w, pbcInfo, params])
    taskWaresAddAlcoBoxPrint.exposed = True

    def taskWaresAddAlcoBoxMark(self, tid, wid, boxbarcode=None, palbarcode='', barcode=None, barcodeconf=None):
        theBC = self.whBarcodeGS1Info(barcode=boxbarcode)
        params = {'THEBC': theBC}
        bcl = None
        if barcode:
            bL = self.barcodeLike(barcode=barcode) 
            if bL == 'ALCOMARK':
                try:
                    l = self.dbExec(sql='select * from wh_income_alcomark_lock(?,?,?,?)', fetch='one',
                                    params=[boxbarcode, barcode, tid,  self.whSesId()])
                except Exception as exc:
                    params['mes'] = self.fbExcText(exc)
                else:
                    if l['RES'] == 'R':
                        params['mes'] = _('Вы уже сканировали эту алкомарку')
                    elif l['RES'] == 'E':
                        params['mes'] = _('В этом коробе нет такой алкомарки. Короб помечен как некорректный!')
            elif bL == 'PALLET':
                flDo = False
                if barcodeconf == barcode:
                    flDo = True
                else:
                    bcl = self.theBarcodeCntLock(taskid=tid, bctype='AM')
                    if float(theBC['BCCALCAMOUNT']) <= float(bcl['TBCCNTLOCK']):
                        flDo = True
                    else:
                        params['BARCODECONF'] = barcode
                        params['BARCODECONFMES'] = _('Количество марок и кратность короба не совпадают, отсканируйте еще раз этикетку для подтверждения приемки')
                if flDo:
                    try:
                        self.dbExec(sql="execute procedure WH_INCOMEDC_DO_ALCOMARK(?,?,?,?,?)", fetch='none',
                                    params=[tid, barcode, palbarcode, boxbarcode, self.whSesId()])
                    except Exception as exc:
                        params['mes'] = self.fbExcText(exc)
                    else:
                        raise self.httpRedirect('taskWaresAddAlcoBox?tid=%s&wid=%s&palbarcode=%s' % (tid, wid, palbarcode))
            else:
                params['mes'] = _('ШК не обрабатывается в этом интерфейсе')
        t = self.taskInfo(id=tid)
        w = self.waresInfo(waresid=wid)
        if bcl:
            params['AMCNT'] = bcl['TBCCNTLOCK']
        else:
            params['AMCNT'] = self.theBarcodeCntLock(taskid=tid, bctype='AM')['TBCCNTLOCK']
        params['BOXBARCODE'] = boxbarcode
        pbcInfo = self.qTaskPalBarcodeInfo(tid=tid, barcode=palbarcode)
        return self.drawTemplate(templ=self.tmplTaskWaresAddAlcoBoxMark, data=[t, w, params, pbcInfo])
    taskWaresAddAlcoBoxMark.exposed = True

    @taskWaresStartChk
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
                                            params=[tid, wid, barcode, pd, amounts, self.whSesId()])
                    except Exception as exc:
                        params['mes'] = self.fbExcText(exc)
                    else:
                        raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
        t = self.taskInfo(id=tid)
        w = self.waresInfo(waresid=wid)
        params['args'] = args
        return self.drawTemplate(templ=self.tmplTaskWaresAddGS1Box, data=[t, w, params])
    taskWaresAddGS1Box.exposed = True

    def taskWaresAddEditGGP(self, tid, wid=None, ewuid=None, mes=None, action_caption=None):
        wid = self.kId(wid)
        params = {'backurl': 'task?tid=%s' % tid, 'treeName': '№%s' % tid, 'tid': tid, 'wid': wid,
                  'ewuid': ewuid, 'mes': mes, 'ActionCaption': action_caption}
        w = self.waresInfo(wid)
        return self.drawTemplate(templ=self.tmplTaskWaresAddEditGGP, data=[w, params])

    taskWaresAddEditGGP.exposed = True

    def setWU(self, **args):
        params = [
            args['wid'],
            args['uid'],
            args['factor'] if 'factor' in args else None,
            args['w'] if 'w' in args else None,
            args['l'] if 'l' in args else None,
            args['h'] if 'h' in args else None,
            args['c'] if 'c' in args else None,
            args['b'] if 'b' in args else None,
            args['n'] if 'n' in args else None,
            args['mc'] if 'mc' in args else None
        ]
        try:
            self.dbExec(sql='execute procedure K_WH_SPWARES_SETWARESUNIT(?,?,?,?,?,?,?,?,?,?)',
                        params=params, fetch='none')
        except Exception as exc:
            raise self.httpRedirect('taskWaresAddEditGGP?tid=' + args['tid'] +'&wid=' + args['wid'] +'&ewuid=' + args['ewuid'] +
                               '&mes=' + self.fbExcText(exc))
        else:
            raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (args['tid'], args['wid']))

    setWU.exposed = True

    @taskWaresStartChk
    #def taskWaresAdd(self, tid, wid, wuid=None, prdate=None, amount=None, taraweight=None, barcode=None):
    def taskWaresAdd(self, **args):
        tid=self.kId(args['tid'])
        wid = self.kId(args['wid'])
        wuid = args['wuid'] if 'wuid' in args else None
        prdate = args['prdate'] if 'prdate' in args else None
        amount = args['amount'] if 'amount' in args else None
        barcode = args['barcode'] if 'barcode' in args else None
        taraweight = args['taraweight'] if 'taraweight' in args else None

        w = self.waresInfo(wid)
        params = {'backurl': 'task?tid=%s' % tid, 'treeName': '№%s' % tid}
        if barcode:
            try:
                bc = self.qTaskBarcodeInfo(tid=tid, barcode=barcode)
            except Exception as exc:
                params['mes'] = self.fbExcText(exc)
            else:
                if bc and bc['datalist'] and len(bc['datalist']) > 0:
                    if len(bc['datalist']) == 1:
                        bc0 = bc['datalist'][0]
                        if bc0['USERCODE'] == 'WARESUNIT':
                            raise self.httpRedirect('taskWaresAdd?tid=%s&wid=%s&wuid=%s' % (tid, bc0['WID'], bc0['WUID']))
                        elif bc0['USERCODE'] == 'WARES':
                            raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, bc0['WID']))
                        elif bc0['USERCODE'] == 'WARESWEIGHT' or bc0['USERCODE'] == 'SUPWEIGHT':
                            if self.kId(bc0['WID']) == wid:
                                if amount:
                                    amount = float(amount) + float(bc0['AMOUNT'])
                                else:
                                    amount = bc0['AMOUNT']
                            else:
                                params['mes'] = _('Не верный товар')
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
                    try:
                        self.dbExec(sql="execute procedure WH_INCOME_TW_ADD_DO(?,?,?,?,?,?,?)", fetch='none',
                                    params=[tid, wuid, prdate, amount, taraweight, barcode, self.whSesId()])
                    except Exception as exc:
                        params['mes'] = self.fbExcText(exc)
                    else:
                        self.taskWaresAddAfter(tid=tid, wid=wid)
                else:
                    params['mes'] = _('Не верный ШК')

        #if w['IS_VET'] == '1' or w['IS_ALCO'] == '1':
        # if w['IS_VET'] == '1':
        #     raise self.httpRedirect('taskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, _('Для приемки товара нужно отсканировать ШК в формате GS1-128')))
        t = self.taskInfo(tid)
        wz = self.objWaresIncomeZone(objid=t['TOID'], waresid=wid)
        if not wz or not wz['ZID']:
            raise self.httpRedirect('taskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, _('Не установлена зона хранения товара!')))

        #проставим время
        self.dbExec(
            sql='update wm_task_wares tw set tw.begintime = current_timestamp where tw.taskid = ? and tw.waresid = ? and tw.begintime is NULL',
            params=[tid, wid], fetch='none')
        if prdate:
            params['prdate'] = prdate
        else:
            ld = self.dbExec(sql='select * from K_WH_INCOME_WARESLASTDATA(?,?)', params=[tid, wid], fetch='one')
            if ld and ld['PRODUCTDATE']:
                params['prdate'] = TimeStampToDate(ld['PRODUCTDATE'])
            else:
                params['prdate'] = self.defaultProductDate()
        wt = self.waresType(wid)
        if amount:
            params['amount'] = amount
        else:
            params['amount'] = ''
        if wuid:
            wu = self.waresUnitInfo(waresunitid=wuid)
        else:
            wu = None
            params['wuid'] = wuid
        extDL = self.qTaskWaresAddExtDatalist(tid, wid)
        if extDL:
            params['extDL'] = extDL['datalist']
        twExtData = self.qTaskWaresExtData(tid=tid, wid=wid)
        return self.drawTemplate(templ=self.tmplTaskWaresAdd, data=[t, w, wt, wu, params, twExtData])

    taskWaresAdd.exposed = True

    def taskWaresLot(self, tid, wid, wlotid, palletid, wuid=None, amount=None, barcode=None):
        wid = self.kId(wid)
        params = {'backurl': 'taskWares?tid=%s&wid=%s' % (tid, wid), 'treeName': '№%s' % (tid)}
        if barcode:
            bc = self.dbExec(sql="select * from WH_INCOME_BARCODE_WARESAMOUNT(?,?,?)",
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
                    self.dbExec(sql="execute procedure K_WH_INCOMEDC_DO_UPD(?,?,?,?,?,?,?)", fetch='none',
                                params=[tid, wlotid, palletid, wuid, amount, barcode, self.whSesId()])
                except Exception as exc:
                    params['mes'] = self.fbExcText(exc)
                else:
                    raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        wu = self.waresUnitInfo(wuid)
        p = self.palletInfo(palletid)
        wl = self.qWaresLotInfo(wlotid=wlotid)
        wli = self.dbExec(sql="select * from WH_INCOMEDC_WARESLOTITEM(?,?,?)", fetch='one',
                          params=[t['DOCID'], wlotid, palletid])
        if amount:
            params['amount'] = amount
        else:
            params['amount'] = '0'
        if wuid: params['wuid'] = wuid
        wt = self.waresType(wid)
        return self.drawTemplate(templ=self.tmplTaskWaresLot, data=[t, p, w, wu, wl, wli, wt, params])

    taskWaresLot.exposed = True

    def taskWaresLotReadOnly(self, tid, wid, wlotid, palletid):
        wid = self.kId(wid)
        params = {'backurl': 'taskWaresReadOnly?tid=%s&wid=%s' % (tid, wid), 'treeName': '№%s' % (tid)}
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        p = self.palletInfo(palletid)
        wl = self.qWaresLotInfo(wlotid=wlotid)
        wli = self.dbExec(sql="select * from WH_INCOMEDC_WARESLOTITEM(?,?,?)", fetch='one',
                          params=[t['DOCID'], wlotid, palletid])
        wt = self.waresType(wid)
        return self.drawTemplate(templ=self.tmplTaskWaresLotReadOnly, data=[t, p, w, wl, wli, wt, params])

    taskWaresLotReadOnly.exposed = True

    def taskWaresLotPalletTara(self, tid, wid, pid, wlotid):
        backurl = 'taskWaresLot?tid=%s&wid=%s&wlotid=%s&palletid=%s' % (tid, wid, wlotid, pid)
        saveurl = 'taskWares?tid=%s&wid=%s' % (tid, wid)
        return self.palWaresTara(pid=pid, wid=wid, saveurl=saveurl, backurl=backurl)
    taskWaresLotPalletTara.exposed = True

    def printer(self, id, cnt=None, sgid=None, url=None):
        if url is None:
            url='main'
        params = {'printerid': id, 'cnt': cnt, 'sgid':sgid, 'backurl': url, 'mes': None}
        if cnt and sgid:
            try:
                self.dbExec(sql="execute procedure WH_INCOME_PRINTPALLET('INCOME',?,NULL,?,?,?)",
                            params=[self.whSesId(), id, cnt,sgid], fetch='none')
            except Exception as exc:
                raise self.httpRedirect('main?mes=%s' % self.fbExcText(exc))
            else:
                raise self.httpRedirect(url)
        p = self.dbExec(sql="select * from WM_PRINTERS where PRINTERID = ?", params=[id], fetch='one')
        sg = self.qWHSelGroupList(whid=self.getUserInfo()['WHID'])
        return self.drawTemplate(templ=self.tmplPrinter, data=[p,sg, params])

    printer.exposed = True

    def pallet(self, id, tid, wid=None):
        id = self.kId(id)
        p = self.palletInfo(id)
        if p['OBJID'] != self.wmSesZoneObj(wmsesid=self.whSesId())['OBJID']:
            return self.wpMain(mes=_('Поддон принадлежит другому объекту!'))
        w = self.dbExec(sql="select * from K_WORKPALLET_LISTWARES(?)", params=[id], fetch='all')
        if wid:
            backurl = 'taskWares?tid=%s&wid=%s' % (tid, wid)
        else:
            backurl = 'task?tid=%s' % (tid)
        return self.drawTemplate(templ=self.tmplPallet, data=[p, w, {'backurl': backurl}])

    pallet.exposed = True

    def taskEnd(self, tid):
        try:
            self.dbExec(sql="execute procedure K_WH_INCOMEDC_TASKEND(?,?)", params=[tid, self.whSesId()],
                        fetch='none')
        except Exception as exc:
            raise self.httpRedirect('task?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('main')

    taskEnd.exposed = True


    def taskSGPrinter(self, tid, prid, **args):
        url = 'task?tid=%s' % tid
        params = {'taskid': tid, 'printerid': prid, 'backurl': url, 'mes': None}
        selgroups = counts = ''
        for item in args:
            if item.find('SG_') != -1:
                selgroups += item[3:] + ';'
                counts += args[item] + ';'

        if selgroups != '' and counts != '':
            try:
                self.dbExec(sql="execute procedure WH_INCOME_PRINTSGPALLETS('INCOME',?,NULL,?,?,?)",
                            params=[self.whSesId(), prid, counts, selgroups], fetch='none')
            except Exception as exc:
                raise self.httpRedirect('main?mes=%s' % self.fbExcText(exc))
            else:
                raise self.httpRedirect(url)
        p = self.dbExec(sql="select * from WM_PRINTERS where PRINTERID = ?", params=[prid], fetch='one')
        sg = self.dbExec(sql='select * from WH_INCOME_LISTSELGROUP(?)', fetch='all', params=[tid])
        return self.drawTemplate(templ=self.tmplTaskSGPrinter, data=[p, sg, params])


    taskSGPrinter.exposed = True

####################################################################################################################
# Отклонения от схемы
####################################################################################################################

from systems.KURSSKLAD.KURSTERM.INCOMEDC.templates.taskPrinter import taskPrinter

class TIncomeTransit(TIncome):
    urlTaskPrinter = 'taskPrinter'

    tmplTaskPrinter = taskPrinter

    def qTaskWaresAddExtDatalist(self, tid, wid):
        return self.dbExec(sql="select * from WH_INCOMEDC_TRN_WARESCLIENTS(?,?)", params=[tid, wid], fetch='all')

    def taskPrinter(self, **args):
        tid = self.kId(args['tid'])
        prid = self.kId(args['prid'])
        mes = None
        clients = ''
        amounts = ''
        dates = ''
        for key in args:
            if key == 'tid':
                tid = self.kId(args[key])
            elif key == 'prid':
                prid = self.kId(args[key])
            elif key == 'mes':
                mes = args[key]
            elif key[:2] == 'q_' and args[key]:
                if clients == '':
                    clients = key.split('_')[1]
                    dates = key.split('_')[2]
                    amounts = args[key]
                else:
                    clients += ',' + key.split('_')[1]
                    dates += ',' + key.split('_')[2]
                    amounts += ',' + args[key]
        if clients:
            try:
                self.dbExec(sql="execute procedure WH_INCOMEDC_PRINTPALLETCLIENTS('INCOME',?,?,?,?,?)",
                            params=[self.whSesId(), prid, clients, dates, amounts], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('task?tid=%s' % (tid))
        lc = self.dbExec(sql="select * from WH_INCOMEDC_TRN_LISTCLIENTS(?)", params=[tid], fetch='all')
        p = self.dbExec(sql="select * from WM_PRINTERS where PRINTERID = ?", params=[prid], fetch='one')
        t = self.taskInfo(tid)
        return self.drawTemplate(templ=self.tmplTaskPrinter,
                                 data=[lc, p, t, {'mes': mes, 'backurl': 'task?tid=%s' % (tid)}])

    taskPrinter.exposed = True
