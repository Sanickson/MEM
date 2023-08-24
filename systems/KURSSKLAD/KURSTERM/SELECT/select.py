# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.SITEVERIFY.siteverify import TSiteVerify

from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskList import taskList
from systems.KURSSKLAD.KURSTERM.SELECT.templates.task import task
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskM import taskM
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresPallet import taskWaresPallet
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresPreScan import taskWaresPreScan
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresSlotZonePalList import taskWaresSlotZonePalList
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWares import taskWares
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresEnd import taskWaresEnd
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresAmount import taskWaresAmount
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresLot import taskWaresLot
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresU import taskWaresU
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresW import taskWaresW
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresWTaraQuant import taskWaresWTaraQuant
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresBBox import taskWaresBBox
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresBCnt import taskWaresBCnt
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskWaresACnt import taskWaresACnt

from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskP import taskP
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskPSite import taskPSite
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskPPallet import taskPPallet

from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskU import taskU

from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskEnd import taskEnd
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskEndTara import taskEndTara
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskEndPrint import taskEndPrint
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskEndStick import taskEndStick
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskEndSite import taskEndSite
from systems.KURSSKLAD.KURSTERM.SELECT.templates.taskEndMail import taskEndMail

from conf.client_conf import pickInHands
from systems.KURSSKLAD.cheetahutils import TimeStampToDate

class TSelect(TSiteVerify):
        
    helpSystem = True
    canPalScan = False
    tmplPalTWares = TSiteVerify.tmplPalIWares
    pickInHands = pickInHands

    def qTaskList(self):
        """ Список заданий, доступных для выполнения этим сотрудником """
        return self.dbExec(sql='SELECT * FROM WH_DC_SELECT_LISTTASKES(?)', params=[self.whSesId()], fetch='all')

    def qTaskJoin(self, tid):
        try:
            self.dbExec(sql='execute procedure WH_DC_SELECT_JOINTASK(?,?)',
                        params=[tid, self.whSesId()], fetch='none')
        except Exception as exc:
            raise self.httpRedirect('taskList?mes=%s' % self.fbExcText(exc))

    def qTaskWaresNext(self, tid):
        """ Список позиций задания """
        return self.dbExec(sql='SELECT * FROM WH_TSELECT_TW_NEXT(?)', params=[tid], fetch='all')

    def qTaskEndInfo(self, tid):
        return self.dbExec(sql="select * from WH_TSELECT_TASKEND_DATA(?)",params=[self.kId(tid)],fetch='one')

    def qTaskWaresEnd(self, twid):
        """ Завершение позиции задания """
        return self.dbExec(sql='execute procedure WH_SELECT_TW_END(?)', params=[twid], fetch='none')

    def qTaskWaresData(self, twid):
        """ Информация о позиции задания """
        return self.dbExec(sql='SELECT * FROM WH_TSELECT_TW_DATA(?)', params=[twid], fetch='one')

    def qTaskWaresSlotZonePalList(self, twid, palletid=None):
        """ Список паллет в зоне отборки"""
        sql = 'SELECT * FROM WH_SELECT_TW_SLOTZONE_PALLIST(?)'
        params = [twid]
        if palletid:
            params.append(palletid)
            sql += ' where PID = ?'
        return self.dbExec(sql=sql, params=params, fetch='all')

    def qTaskWaresJoin(self, twid):
        self.dbExec(sql="update wm_task_wares tw \
                            set tw.status = '1',tw.begintime=current_timestamp,tw.wm_sessionid=?\
                          where tw.taskwaresid = ?", params=[self.whSesId(), twid], fetch='none')

    def qTaskWaresEndChkBarcode(self, twid, barcode):
        """ Проверка отсканированного ШК, является ли он ключем завершения позиции """
        self.dbExec(sql='execute procedure WH_SELECTDC_END_CHKBARCODE(?,?)', params=[twid, barcode], fetch='none')

    def qTaskWaresLots(self, twid, qorder=None, wlotid=None):
        """ Информация партиях на паллете, с которого нужно отобрать позицию """
        sql = 'SELECT * FROM WH_SELECT_TW_LOTS(?,?)'
        params = [twid, qorder]
        if wlotid:
            return self.dbExec(sql=sql + ' where WLOTID=?', params=params.append(wlotid), fetch='all')
        else:
            return self.dbExec(sql=sql, params=params, fetch='all')

    def qTaskWaresBLots(self, twid, weight):
        """ Информация партиях на паллете, с которого нужно отобрать позицию """
        return self.dbExec(sql='SELECT * FROM WH_SELECT_TWB_LOTS(?,?)', params=[twid, weight], fetch='all')

    def qTaskWaresALots(self, twid):
        """ Информация партиях на паллете, с которого нужно отобрать позицию """
        return self.dbExec(sql='SELECT * FROM WH_SELECT_TWA_LOTS(?)', params=[twid], fetch='all')

    def qTaskWaresUDo(self, twid, wareslots, amounts, wuid=None):
        """ Отборка штучного товара """
        self.dbExec(sql='execute procedure WH_SELECT_TWU_DO(?,?,?,?)',
                    params=[twid, wareslots, amounts, wuid], fetch='none')

    def qTaskWaresWDo(self, twid, amount, wlotid=None, taracnt=None, taraweight=None):
        """ Отборка весового товара """
        self.dbExec(sql='execute procedure WH_SELECT_TWW_DO(?,?,?,?,?)',
                    params=[twid, wlotid, amount, taracnt, taraweight], fetch='none')

    def qTaskWaresBDo(self, twid, wareslots, amounts, weight):
        """ Отборка товара коробами """
        self.dbExec(sql='execute procedure WH_SELECT_TWB_DO(?,?,?,?)',
                    params=[twid, wareslots, amounts, weight], fetch='none')

    def qTaskWaresADo(self, twid, wareslots, amounts, sus):
        """ Отборка товара по среднему весу """
        self.dbExec(sql='execute procedure WH_SELECT_TWA_DO(?,?,?,?)',
                    params=[twid, wareslots, amounts, sus], fetch='none')

    def qTaskWaresNoPlace(self, twid):
        """ Нет места на паллете отборки """
        return self.dbExec(sql='select * from K_WH_SELECT_POS_ENDTASK(?)', params=[twid], fetch='one')

    def qTaskWaresPalletNo(self, twid):
        """ Нет товара на остатках """
        self.dbExec(sql='execute procedure K_WH_SELECT_POS_NOTFOUND(?,?)', params=[twid,self.whSesId()], fetch='none')

    def qTaskWaresNoAmount(self, twid):
        """ Нет хватает товара на МО """
        #try: self.dbExec(sql='execute procedure K_WH_SELECT_NOWARES_REFILLSLOT(?)', params=[twid], fetch='none')
        self.dbExec(sql='execute procedure WH_SELECTDC_SMALLREST(?)', params=[twid], fetch='none')

    def qTaskWaresClear(self, twid):
        """ Обнулить отобранные товар """
        return self.dbExec(sql='execute procedure  WH_SELECT_TW_CLEAR(?)', params=[twid], fetch='none')

    def qTaskListSite(self, tid):
        """ Список МП, на которые можно поставить поддон """
        return self.dbExec(sql='select * from WH_DC_SELECT_TASKLISTSITE(?)', params=[tid], fetch='all')

    def qTaskUWaresList(self, tid):
        """ Список товаров задания на отборку с выбором порядка пользователем """
        return self.dbExec(sql='select * from WH_SEELCT_T_U_WLIST(?)', params=[tid], fetch='all')

    def index(self):
        super().indexinit()
        return self.taskList()
    index.exposed = True
    
    def taskList(self, mes=None):
        return self.drawTemplate(templ=taskList, data=[self.qTaskList(), {'mes': mes, 'reloadurl': 'taskList'}])
    taskList.exposed = True

    def task(self, tid, **args):
        t = self.taskInfo(id=tid)
        if t['ALGORITHM']:
            self.qTaskJoin(tid)
            methodname = 'task%s' % t['ALGORITHM']
            if hasattr(self, methodname):
                args['t']=t
                return getattr(self, 'task%s' % t['ALGORITHM'])(tid=tid, **args)
            else:
                if 'mes' in args and args['mes']:
                    return self.drawTemplate(templ=task, data=[t, {'mes': args['mes']}])
                tw = self.qTaskWaresNext(tid=tid)
                if tw['datalist'] and len(tw['datalist']) > 0:
                    raise self.httpRedirect('taskWares?twid=%s' % tw['datalist'][0]['TWID'])
                raise self.httpRedirect('taskEnd?tid=%s' % tid)
        else:
            raise self.httpRedirect('taskList?mes=%s' % _('Не установлен метод выполнения задания!'))
    task.exposed = True

    def taskU(self, tid, **args):
        t = args['t'] if 't' in args else self.taskInfo(id=tid)
        wl = self.qTaskUWaresList(tid=tid)
        if wl['datalist'] and len(wl['datalist'])>0 and wl['datalist'][0]['TWSTATUS'] == '2':
            raise self.httpRedirect('taskEnd?tid=%s' % tid)
        mes = args['mes'] if 'mes' in args else None
        return self.drawTemplate(templ=taskU, data=[t, wl, {'mes': mes}])

    def taskWaresSlotZonePalList(self, twid, **args):
        tw = args['TW'] if 'TW' in args else self.qTaskWaresData(twid=twid)
        mes = args['mes'] if 'mes' in args else None
        barcode = args['barcode'] if 'barcode' in args else None
        if barcode:
            try:
                self.dbExec(sql='execute procedure WH_SELECT_TW_SLOTZONE_PALSCAN(?,?)',
                            params=[twid, barcode], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                return self.taskWares(twid=twid)
        t = args['T'] if 'T' in args else self.taskInfo(tw['TID'])
        pl = self.qTaskWaresSlotZonePalList(twid=twid)
        return self.drawTemplate(templ=taskWaresSlotZonePalList,
                                 data=[tw, t, pl, {'mes': mes, 'reloadurl': 'taskWares?twid=%s' % twid}])

    def taskWaresParams(self, tw, params):
        p = params if params else {}
        p['reloadurl'] = 'taskWares?twid=%s' % tw['TWID']
        if tw['TMALGO'] == 'U':
            p['backurl'] = 'task?tid=%s' % tw['TID']
        return p

    def taskWares(self, twid, **args):
        args['TW'] = tw = self.qTaskWaresData(twid=twid)
        if 'mes' not in args or not args['mes']:
            if tw['TWSTAT'] == '0':
                if tw['TMALGO'] == 'U':
                    self.qTaskWaresJoin(twid=twid)
                else:
                    raise self.httpRedirect('taskWaresPallet?twid=%s' % tw['TWID'])
            elif tw['TWSTAT'] == '2':
                raise self.httpRedirect('task?tid=%s&mes=%s' % (tw['TID'], _('Позиция задания уже отработана!')))
            if 'flend' in args:
                return self.taskWaresEnd(twid=twid, **args)
            if tw['TWSTAT'] == '1' and tw['SPCODE'] == 'PALSLOT' and not tw['PID']:
                return self.taskWaresSlotZonePalList(twid=twid, **args)
            wT = self.waresType(tw['WID'])['WTYPE']
            if tw['WSELTYPE'] == 'A':
                return self.taskWaresA(twid=twid, **args)
            if wT == 'U':
                return self.taskWaresU(twid=twid, **args)
            elif wT == 'W' or wT == 'M' or wT == 'V':
                if tw['WSELTYPE'] == 'B':
                    return self.taskWaresB(twid=twid, **args)
                elif tw['WSELTYPE'] == 'U' or tw['WSELTYPE'] == 'W':
                    return self.taskWaresU(twid=twid, **args)
                else:
                    return self.taskWaresW(twid=twid, **args)
            mes = _('Система не знает, каким образом нужно отбирать этот товар')
        else:
            mes = args['mes']
        t = self.taskInfo(tw['TID'])
        params = self.taskWaresParams(tw, {'mes': mes})
        return self.drawTemplate(templ=taskWares, data=[t, tw, params])
    taskWares.exposed = True

    def taskWaresEnd(self, twid, **args):
        barcode = mes = tw = flend = flzero = None
        needend = False
        for item in args:
            if item == 'barcode':
                barcode = args[item]
            elif item == 'TW':
                tw = args[item]
            elif item == 'flend':
                flend = args[item]
            elif item == 'flzero':
                flzero = args[item]
        if barcode:
            try:
                self.qTaskWaresEndChkBarcode(twid, barcode)
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                needend = True
        elif flzero == '1':
            needend = True
        if needend:
            try:
                self.qTaskWaresEnd(twid=twid)
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                tw = self.qTaskWaresData(twid=twid)
                raise self.httpRedirect('task?tid=%s' % tw['TID'])
        if not tw:
            tw = self.qTaskWaresData(twid=twid)
        t = self.taskInfo(tw['TID'])
        params = {'mes': mes, 'flend': flend}
        if flend:
            params['backurl'] = 'taskWares?twid=%s' % twid
        return self.drawTemplate(templ=taskWaresEnd, data=[tw, t, params])

    def taskWaresB(self, twid, **args):
        mes = args['mes'] if 'mes' in args else None
        weight = args['weight'] if 'weight' in args else None
        tw = args['TW'] if 'TW' in args else self.qTaskWaresData(twid=twid)
        if 'barcode' in args:
            bcInfo = self.kBarCodeInfo(args['barcode'])
            if bcInfo and bcInfo['result']==0:
                if bcInfo['usercode']=='WARESWEIGHT':
                    if self.kId(tw['WID']) == self.kId(bcInfo['RECORDID']):
                        weight = self.dbExec(sql=bcInfo['SELECTSQL'], params=[], fetch='one')['WWEIGHT']
                elif bcInfo['usercode']=='WEIGHT':
                    weight = self.dbExec(sql=bcInfo['SELECTSQL'], params=[], fetch='one')['WWEIGHT']
                else:
                    mes = _('Не верный тип ШК')
            else:
                mes = _('Не верный ШК')
        if not weight:
            t = self.taskInfo(id=tw['TID'])
            wl = self.qTaskWaresLots(twid=twid)
            params = self.taskWaresParams(tw, {'mes': mes})
            return self.drawTemplate(templ=taskWaresBBox, data=[tw, t, wl, params])
        else:
            weight = float(weight)
        wlots = amounts = ''
        delarr = []
        for item in args:
            if item.find('WL_') != -1:
                wlots += item[3:] + ';'
                amounts += args[item] + ';'
                delarr.append(item)
        for item in delarr:
            del args[item]
        del delarr
        if wlots == '':
            t = self.taskInfo(id=tw['TID'])
            wl = self.qTaskWaresBLots(twid=twid, weight=weight)
            params = self.taskWaresParams(tw, {'mes': mes, 'WEIGHT': weight})
            return self.drawTemplate(templ=taskWaresBCnt,
                                     data=[tw, t, wl, params])
        if weight and wlots != '':
            try:
                self.qTaskWaresBDo(twid=twid, wareslots=wlots, amounts=amounts, weight=weight)
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                args['TW'] = tw = self.qTaskWaresData(twid=twid)
                del args['weight']
        if tw['FLAGEND'] == '1' and not mes:
            try:
                self.qTaskWaresEnd(twid=twid)
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('task?tid=%s' % tw['TID'])
        if mes:
            args['mes'] = mes
        return self.taskWaresB(twid=twid, **args)

    def taskWaresA(self, twid, **args):
        mes = args['mes'] if 'mes' in args else None
        tw = args['TW'] if 'TW' in args else self.qTaskWaresData(twid=twid)
        wlots = amounts = sus = ''
        delarr = []
        for item in args:
            if item.find('AVG_') != -1:
                wlots += item[4:] + ';'
                amounts += args[item] + ';'
                sus += args['SU_' + item[4:]] + ';' if 'SU_' + item[4:] in args else '0;'
                delarr.append(item)
        for item in delarr:
            del args[item]
        del delarr
        if wlots == '':
            t = self.taskInfo(id=tw['TID'])
            wl = self.qTaskWaresALots(twid=twid)
            params = self.taskWaresParams(tw, {'mes': mes})
            return self.drawTemplate(templ=taskWaresACnt, data=[tw, t, wl, params])
        if wlots != '':
            try:
                self.qTaskWaresADo(twid=twid, wareslots=wlots, amounts=amounts, sus=sus)
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                args['TW'] = tw = self.qTaskWaresData(twid=twid)
        if tw['FLAGEND'] == '1' and not mes:
            try:
                self.qTaskWaresEnd(twid=twid)
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('task?tid=%s' % tw['TID'])
        if mes:
            args['mes'] = mes
        return self.taskWaresA(twid=twid, **args)

    def taskWaresU(self, twid, **args):
        barcode = mes = wuid = tw = None
        wlots = amounts = ''
        for item in args:
            if item.find('WL_') != -1:
                wlots += item[3:] + ';'
                amounts += args[item] + ';'
            elif item == 'barcode':
                barcode = args[item]
            elif item == 'wuid':
                wuid = args[item]
            elif item == 'mes':
                mes = args[item]
            elif item == 'TW':
                tw = args[item]
        if barcode:
            try:
                self.qTaskWaresEndChkBarcode(twid, barcode)
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                try:
                    self.qTaskWaresUDo(twid=twid, wareslots=wlots, amounts=amounts, wuid=wuid)
                except Exception as exc:
                    mes = self.fbExcText(exc)
                else:
                    tw = self.qTaskWaresData(twid=twid)
                    raise self.httpRedirect('task?tid=%s' % tw['TID'])
        if not tw:
            tw = self.qTaskWaresData(twid=twid)
        t = self.taskInfo(tw['TID'])
        wl = self.qTaskWaresLots(twid=twid)
        params = self.taskWaresParams(tw, {'mes': mes})
        return self.drawTemplate(templ=taskWaresU, data=[tw, t, wl, params])

    def taskWaresW(self, twid, **args):
        barcode = mes = tw = wlotid = weight = None
        for item in args:
            if item == 'wlotid':
                wlotid = args[item]
            elif item == 'barcode':
                barcode = args[item]
            elif item == 'mes':
                barcode = args[item]
            elif item == 'TW':
                tw = args[item]
        if not tw:
            tw = self.qTaskWaresData(twid=twid)
        if tw['FLAGEND'] == '1':
            args['TW'] = tw
            return self.taskWaresEnd(twid=twid, **args)
        # if not wlotid:
        #     # Выберем партию для отборки товара
        #     raise self.httpRedirect('taskWaresLot?twid=%s&ar=F' % twid)
        if barcode:
            bcInfo = self.whBarCodeWaresInfo(barcode=barcode, waresid=tw['WID'])
            if bcInfo and bcInfo['datalist'] and len(bcInfo['datalist'])>0:
                w0 = bcInfo['datalist'][0]
                if w0['usercode']=='WARESWEIGHT':
                    weight = w0['AMOUNT']
                elif w0['usercode']=='WEIGHT':
                    weight = w0['AMOUNT']
                elif w0['usercode']=='SUPWEIGHT':
                    weight = w0['AMOUNT']
                elif w0['usercode']=='GS1':
                    weight = w0['AMOUNT']                    
                else:
                    mes = _('Не верный тип ШК')
            else:
                mes = _('Не верный ШК')
        if weight:
            if tw['TARAWEIGHT']:
                return self.taskWaresWTaraQuant(twid=twid, tw=tw, wweight=weight)
            try:
                self.qTaskWaresWDo(twid=twid, wlotid=wlotid, amount=weight)
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                tw = self.qTaskWaresData(twid=twid)
                if tw['FLAGEND'] == '1':
                    args['TW'] = tw
                    del args['barcode']
                    return self.taskWaresEnd(twid=twid, **args)
        t = self.taskInfo(tw['TID'])
        wl = self.qTaskWaresLots(twid=twid, wlotid=wlotid)
        params = self.taskWaresParams(tw, {'mes': mes, 'WARESLOTID': wlotid})
        return self.drawTemplate(templ=taskWaresW, data=[tw, t, wl, params])

    def taskWaresWTaraQuant(self, twid, **args):
        tw = args['tw'] if 'tw' in args else self.qTaskWaresData(twid=twid)
        mes = args['mes'] if 'mes' in args else None
        if 'quant' in args:
            weight = float(args['wweight']) - float(tw['TARAWEIGHT'])*float(args['quant'])
            try:
                self.qTaskWaresWDo(twid=twid, amount=weight, taracnt=args['quant'], taraweight=tw['TARAWEIGHT'])
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('taskWares?twid=%s' % twid)
        t = self.taskInfo(tw['TID'])
        wl = self.qTaskWaresLots(twid)
        params = self.taskWaresParams(tw, {'mes': mes})
        if 'wweight' in args:
            params['WWEIGHT'] = args['wweight']
        return self.drawTemplate(templ=taskWaresWTaraQuant, data=[tw, t, wl, params])
    taskWaresWTaraQuant.exposed = True

    def taskWaresAmount(self, twid, **args):
        mode = barcode = mes = wuid = tw = None
        wlots = amounts = ''
        for item in args:
            if item.find('WL_') != -1:
                wlots += item[3:] + ';'
                amounts += args[item] + ';'
            elif item == 'barcode':
                barcode = args[item]
            elif item == 'wuid':
                wuid = args[item]
            elif item == 'mode':
                mode = args[item]
            elif item == 'TW':
                tw = args[item]
        if barcode:
            try:
                self.qTaskWaresEndChkBarcode(twid, barcode)
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                try:
                    self.qTaskWaresUDo(twid=twid, wareslots=wlots, amounts=amounts, wuid=wuid)
                except Exception as exc:
                    mes = self.fbExcText(exc)
                else:
                    tw = self.qTaskWaresData(twid=twid)
                    raise self.httpRedirect('task?tid=%s' % tw['TID'])
        if not tw:
            tw = self.qTaskWaresData(twid=twid)
        t = self.taskInfo(tw['TID'])
        wl = self.qTaskWaresLots(twid)
        bu = 'taskWares?twid=%s' % twid
        ru = 'taskWaresAmount?twid=%s' % twid
        return self.drawTemplate(templ=taskWaresAmount, data=[tw, t, wl, {'mes': mes, 'reloadurl': ru, 'backurl': bu}])
    taskWaresAmount.exposed = True

    def taskWaresPallet(self, twid, barcode=None, mes=None):
        """ Этап 1.1 - Подтверждение того, что отборщик подошел к поддону """
        if barcode:
            try:
                r = self.dbExec(sql='select * from WH_TSELECT_TW_SCANPAL(?,?,?)',
                                params=[twid, self.whSesId(), barcode], fetch='one')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                if r['SELECTWARESPRESCAN']:
                    raise self.httpRedirect('taskWaresPreScan?twid=%s' % twid)
                raise self.httpRedirect('taskWares?twid=%s' % twid)
        tw = self.qTaskWaresData(twid=twid)
        t = self.taskInfo(tw['TID'])
        return self.drawTemplate(templ=taskWaresPallet,
                                 data=[tw, t, {'mes': mes, 'reloadurl': 'task?tid=%s' % tw['TID']}])
    taskWaresPallet.exposed = True

    def taskWaresPreScan(self, twid, barcode=None, mes=None):
        """ Этап 1.2 - Подтверждение выбора верного товара сканированием его ШК """
        data = []
        if barcode:
            try:
                r = self.dbExec(sql='select * from WH_TSELECT_TW_PRESCANWARES(?,?,?)',
                                params=[twid, self.whSesId(), barcode], fetch='one')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                if r['TWID_NEW'] is None:
                    raise self.httpRedirect('taskWares?twid=%s' % twid)
                else:
                    data.append(r)
        tw = self.qTaskWaresData(twid=twid)
        data.append(tw)
        data.append(self.taskInfo(tw['TID']))
        data.append({'mes': mes, 'reloadurl': 'task?tid=%s' % tw['TID']})
        return self.drawTemplate(templ=taskWaresPreScan, data=data)
    taskWaresPreScan.exposed = True

    def taskWaresPalletNo(self, tid, twid):
        """ Нет товара на остатках """
        try:
            self.qTaskWaresPalletNo(twid=twid)
        except Exception as exc:
            raise self.httpRedirect('taskWaresPallet?twid=%s&mes=%s' % (twid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('task?tid=%s' % tid)

    taskWaresPalletNo.exposed = True

    def taskWaresLot(self, twid, ar=None):
        """
            Выбор партии для отборки товара
            ar - делать ли автопробрасывание, 1 - если только одна партия, F - на первую по FEFO
        """
        url = 'taskWares?twid=%s&wlotid={WLOTID}' % twid
        tw = self.qTaskWaresData(twid=twid)
        wl = self.qTaskWaresLots(twid)
        if ar and wl['datalist']:
            if ar == '1' and len(wl['datalist']) == 1:
                raise self.httpRedirect(url.replace('{WLOTID}', str(wl['datalist'][0]['WLOTID'])))
            elif ar == 'F' and len(wl['datalist']) > 0:
                raise self.httpRedirect(url.replace('{WLOTID}', str(wl['datalist'][0]['WLOTID'])))
        t = self.taskInfo(tw['TID'])
        reloadurl = 'taskWaresLot?twid=%s' % twid
        return self.drawTemplate(templ=taskWaresLot,
                                 data=[tw, t, wl, {'url': url, 'reloadurl': reloadurl}])
    taskWaresLot.exposed = True

    def taskWaresNoPlace(self, tid, twid):
        """ Нет места на паллете отборки """
        try:
            self.qTaskWaresNoPlace(twid=twid)
        except Exception as exc:
            raise self.httpRedirect('taskWares?twid=%s&mes=%s' % (twid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('task?tid=%s' % tid)

    taskWaresNoPlace.exposed = True

    def taskWaresNoAmount(self, tid, twid):
        """ Не хватает на МО """
        try:
            self.qTaskWaresNoAmount(twid=twid)
        except Exception as exc:
            raise self.httpRedirect('taskWares?twid=%s&mes=%s' % (twid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('task?tid=%s' % tid)

    taskWaresNoAmount.exposed = True

    def taskWaresClear(self, twid):
        """ Обнулить уже отобранный товар """
        try:
            self.qTaskWaresClear(twid=twid)
        except Exception as exc:
            raise self.httpRedirect('taskWares?twid=%s&mes=%s' % (twid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('taskWares?twid=%s' % twid)

    taskWaresClear.exposed = True


    #------------------------------------------------------------------------------------------------------------------
    # Завершение задания
    #------------------------------------------------------------------------------------------------------------------
    def taskEnd(self, tid):
        try:
            r = self.dbExec(sql='select * from WH_SELECTDC_TASKEND(?)', params=[tid], fetch='one')
        except Exception as exc:
            raise self.httpRedirect('listTaskes?mes=%s' % self.fbExcText(exc))
        else:
            if r['NEXTSTEP'] == 'T':
                raise self.httpRedirect('taskEndTara?tid=%s' % tid)
            elif r['NEXTSTEP'] == 'P':
                raise self.httpRedirect('taskEndPrint?tid=%s' % tid)
            elif r['NEXTSTEP'] == 'S':
                raise self.httpRedirect('taskEndStick?tid=%s' % tid)
            elif r['NEXTSTEP'] == 'M':
                raise self.httpRedirect('taskEndSite?tid=%s' % tid)
            elif r['NEXTSTEP'] == 'L':
                raise self.httpRedirect('taskEndMail?tid=%s' % tid)
        t = self.qTaskEndInfo(tid)
        t2 = self.dbExec('select * from K_WH_SELECT_TASK_STATISTIC(?)', [tid], 'one')
        return self.drawTemplate(templ=taskEnd, data=[t, t2])

    taskEnd.exposed = True

    def taskEndTara(self, tid, **args):
        """ Сканирование принтера для печати этикетки при завершении задания """
        wareses = amounts = ''
        mes = args['mes'] if 'mes' in args else None
        for item in args:
            if item.find('tara_') != -1 and args[item]:
                waresid = item[5:]
                wareses += waresid + ';'
                amounts += args[item] + ';'
        if wareses != '' and amounts != '':
            try:
                self.dbExec('execute procedure WH_SELECTDC_TASKEND_TARASET(?,?,?)', [tid, wareses, amounts], 'none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('taskEnd?tid=%s' % tid)
        t = self.qTaskEndInfo(tid)
        tl = self.dbExec('select * from WH_SELECTDC_TASKEND_TARALIST(?)', [tid], 'all')
        return self.drawTemplate(templ=taskEndTara, data=[t, tl, {'mes': mes, 'reloadurl': 'taskEnd?tid=%s' % tid}])
    taskEndTara.exposed = True

    def taskEndPrint(self, tid, barcode=None, mes=None):
        """ Сканирование принтера для печати этикетки при завершении задания """
        if barcode and not mes:
            try:
                self.dbExec('execute procedure WH_SELECTDC_TASKENDPRINT(?,?)', [tid, barcode], 'none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('taskEnd?tid=%s' % tid)
        t = self.qTaskEndInfo(tid)
        tls = self.qTaskListSite(tid)
        return self.drawTemplate(templ=taskEndPrint, data=[t, tls, {'mes': mes}])

    taskEndPrint.exposed = True

    def taskEndStick(self, tid, barcode=None):
        """ Сканирование этикетки после наклейки на паллет  """
        mes = {}
        if barcode:
            try:
                self.dbExec('execute procedure WH_SELECTDC_TASKENDSTICK(?,?)', [tid, barcode], 'none')
            except Exception as exc:
                mes = {'mes': self.fbExcText(exc)}
            else:
                raise self.httpRedirect('taskEnd?tid=%s' % tid)
        t = self.qTaskEndInfo(tid)
        return self.drawTemplate(templ=taskEndStick, data=[t, mes])

    taskEndStick.exposed = True

    def taskEndSite(self, tid, mes=None, barcode=None):
        """ Сканирование МП, возле которого был оставлен паллет """
        if barcode:
            try:
                self.dbExec(sql='execute procedure WH_DC_SELECT_SETTASKSITE(?,?)', params=[tid, barcode], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('taskEnd?tid=%s' % tid)
        t = self.qTaskEndInfo(tid)
        tls = self.qTaskListSite(tid)
        return self.drawTemplate(templ=taskEndSite, data=[t, tls, {'mes': mes}])

    taskEndSite.exposed = True

    def taskSendMail(self, tid):
        mails = self.clientConf.selectTaskWaresDiffMails
        mailmes = None
        if mails and len(mails) > 0:
            tw = self.dbExec(sql='select * from WH_TSELECT_TW_DIFF_TOMAIL(?)', params=[tid], fetch='all')
            if len(tw['datalist']) > 0:
                t = self.taskInfo(tid)
                subject = "Продажа: №%s Дата: %s" % (t['DOCNUM'], TimeStampToDate(t['DOCDATE']))
                msg = "Документ: №<b>%s</b> Дата: %s<br>" % (t['DOCNUM'], TimeStampToDate(t['DOCDATE']))
                if t['TONAME']:
                    msg += "Клиент: <b>%s</b><br>" % t['TONAME']
                    subject += '->' + t['TONAME']
                msg += "<table border='1' cellpadding='5'>" \
                       "<thead><th>Код</th><th>Наименование</th><th>План</th><th>Факт</th></tr></thead>"
                msg += '<tbody>'
                for item in tw['datalist']:
                    msg += "<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>" % (item['WCODE'], item['WNAME'], item['QPLAN'], item['QFACT'])
                msg += "</tbody></table>"
                mailmes = self.send_email(mails, subject, msg)
        return mailmes

    def taskEndMail(self, tid, flag=None, mes=None):
        """ Отправка письма о расхождениях """
        mailmes = self.taskSendMail(tid=tid) if flag != 'N' else None
        if not mailmes or flag == '1':
            try:
                self.dbExec(sql='execute procedure WH_TSELECT_END(?)', params=[tid], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('taskList')
        t = self.qTaskEndInfo(tid)
        return self.drawTemplate(templ=taskEndMail, data=[t, {'mes': mes, 'mailmes': mailmes}])
    taskEndMail.exposed = True


    ## Отборка подготовленного мултипаллета
    def qTaskMListWares(self, tid, wid=None):
        """ Список позиций задания, если вернет всего одну запись, то сразу в нее проваливаемся """
        try:
            w = self.dbExec(sql='SELECT * FROM WH_SELECTDC_M_LISTWARES(?,?)', params=[tid, wid], fetch='all')
        except Exception as exc:
            raise self.httpRedirect('task?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
        else:
            return w

    def qTaskMDo(self, tid, barcode):
        """ Подтверждение отборки """
        try:
            self.dbExec(sql='execute procedure WH_SELECTDC_M_DO(?,?)', params=[tid, barcode], fetch='none')
        except Exception as exc:
            raise self.httpRedirect('task?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))

    def taskM(self, tid, barcode=None, mes=None):
        """ Работа с заданием с методом выполнения M - отборка мультипаллетом """
        if barcode:
            bcInfo = self.kBarCodeInfo(barcode)
            if bcInfo and bcInfo['result'] == 0:
                if bcInfo['usercode'] == 'PALLET':
                    self.qTaskMDo(tid, barcode)
                    # raise HTTPRedirect('taskPrinter?id=%s'%(id))
                    raise self.httpRedirect('taskEnd?tid=%s' % tid)
                elif bcInfo['usercode'] == 'WARES':
                    wid = self.kId(bcInfo['recordid'])
                    tw = self.qTaskMListWares(tid=tid, wid=wid)
                    if tw['datalist'] and len(tw['datalist'])>0:
                        raise self.httpRedirect('taskMWares?tid=%s&wid=%s' % (tid, wid))
                    else:
                        mes = _('Нельзя добавить новый товар на мультипаллет')
                if not mes:
                    mes = _('Не верный ШК')
            else:
                mes = bcInfo['mes']
        t = self.taskInfo(tid)
        tw = self.qTaskMListWares(tid=tid)
        return self.drawTemplate(templ=taskM, data=[tw, t, {'mes': mes}])

    taskM.exposed = True

    def taskMWares(self, tid, wid):
        t = self.taskInfo(tid)
        return TSiteVerify.palWares(self, id=t['INFOID'], wid=wid, backurl='task?tid=%s' % tid)

    taskMWares.exposed = True

    ## Отборка паллета
    def qTaskPInfo(self, tid):
        """ Подтверждение отборки """
        try:
            return self.dbExec(sql='select * from WH_SELECTDC_P_TASKINFO(?)', params=[tid], fetch='one')
        except Exception as exc:
            raise self.httpRedirect('taskList?mes=%s' % (self.fbExcText(exc)))

    def taskP(self, tid, mes=None):
        """ Работа с заданием с методом выполнения P - отборка мультипаллетом """
        t = self.qTaskPInfo(tid)
        if t['TALGO'] != 'P':
            raise self.httpRedirect('task?tid=%s' % tid)
        if not t['WID']:
            raise self.httpRedirect('taskEnd?tid=%s' % tid)
        elif t['SITEID']:
            return self.taskPSite(tid=tid, t=t)
        elif not mes:
            mes = _('Нет МП!')
        return self.drawTemplate(templ=taskP, data=[t, {'mes': mes}])

    taskP.exposed = True


    def taskPSite(self, tid, t=None, barcode=None, mes=None):
        tid = self.kId(tid)
        if barcode:
            try:
                p = self.dbExec(sql='select * from WH_SELECTDC_P_SCANSITE(?,?,?)',
                                params=[tid, barcode, self.whSesId()], fetch='one')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                if not p['PALLETID']:
                    raise self.httpRedirect('taskP?tid=%s' % tid)
                else:
                    raise self.httpRedirect('taskPPallet?tid=%s' % tid)
        if not t:
            t = self.qTaskPInfo(tid)
        return self.drawTemplate(templ=taskPSite, data=[t, {'mes': mes}])

    taskPSite.exposed = True

    def taskPPallet(self, tid, t=None, barcode=None, mes=None):
        tid = self.kId(tid)
        if barcode:
            try:
                self.dbExec(sql='execute procedure WH_SELECTDC_P_SCANPALLET(?,?)',
                            params=[tid, barcode], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('taskEnd?tid=%s' % tid)
        if not t:
            t = self.qTaskPInfo(tid)
        wl = self.qTaskWaresLots(t['TWID'])
        return self.drawTemplate(templ=taskPPallet, data=[t, wl, {'mes': mes}])

    taskPPallet.exposed = True

    def taskPWares(self, tid, wid):
        t = self.qTaskPInfo(tid)
        return TSiteVerify.palWares(self, id=t['PALLETID'], wid=wid, backurl='task?tid=%s' % tid)

    taskPWares.exposed = True

    #tmplPalIWares = TSiteVerify.tmplPalIWares

    def taskPReNew(self, tid, trash='1'):
        try:
            self.dbExec(sql='execute procedure WH_SELECTDC_P_RENEW(?,?)', params=[tid, trash], fetch='none')
        except Exception as exc:
            raise self.httpRedirect('taskPPallet?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('taskP?tid=%s' % tid)

    taskPReNew.exposed = True

    def taskPEmpty(self, tid):
        try:
            self.dbExec(sql='execute procedure WH_SELECTDC_P_EMPTY(?)', params=[tid], fetch='none')
        except Exception as exc:
            raise self.httpRedirect('taskP?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('taskList')

    taskPEmpty.exposed = True

    def pal(self, id):
        try:
            t = self.dbExec(sql='select * from WH_SELECT_TASKBYPAL(?,?)',
                            params=[id, self.whSesId()], fetch='one')
        except Exception as exc:
            raise self.httpRedirect('taskList?mes=%s' % self.fbExcText(exc))
        else:
            if t['TID']:
                if t['TMALGO'] == 'P':
                    raise self.httpRedirect('taskPPallet?tid=%s' % t['TID'])
                else:
                    raise self.httpRedirect('task?tid=%s' % t['TID'])
            else:
                raise self.httpRedirect('taskList')

    pal.exposed = True

    def taskEndToClient(self, tid, flag=None, mes=None):
        """ Отправка письма о расхождениях """
        mailmes = self.taskSendMail(tid=tid) if flag != 'N' else None
        if not mailmes or flag == '1':
            try:
                self.dbExec(sql='execute procedure WH_SELECT_TASKEND_TOBUYER(?)', params=[tid], fetch='none')
            except Exception as exc:
                raise self.httpRedirect('taskEndPrint?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
            else:
                raise self.httpRedirect('taskList')
        t = self.taskInfo(tid)
        return self.drawTemplate(templ=taskEndMail, data=[t, {'mes': mes, 'mailmes': mailmes, 'url': 'taskEndToClient'}])


    taskEndToClient.exposed = True
