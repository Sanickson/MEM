# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.common import TCommonTerm

from systems.KURSSKLAD.KURSTERM.REFILLSLOT.templates.index import index
from systems.KURSSKLAD.KURSTERM.REFILLSLOT.templates.row import row
from systems.KURSSKLAD.KURSTERM.REFILLSLOT.templates.task import task
from systems.KURSSKLAD.KURSTERM.REFILLSLOT.templates.slot import slot
from systems.KURSSKLAD.KURSTERM.REFILLSLOT.templates.wares import wares
#from systems.KURSSKLAD.KURSTERM.REFILLSLOT.templates.rangeWares import rangeWares
from systems.KURSSKLAD.KURSTERM.templates.commonRangeWares import commonRangeWares as rangeWares
from systems.KURSSKLAD.KURSTERM.REFILLSLOT.templates.taskWares import taskWares
from systems.KURSSKLAD.KURSTERM.REFILLSLOT.templates.taskWaresPallet import taskWaresPallet

class TRefillSlot(TCommonTerm):

    def rfsGetTask(self, tid=None):
        try:
            t = self.dbExec(sql='select * from K_WH_REFILLSLOT_GETTASK(?)', params=[self.whSesId()],
                            fetch='one')
            if t and t['TASKID']:
                raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s' % (t['TASKID'], t['WARESID']))
        except Exception as exc:
            raise self.httpRedirect('rfsMain?mes=%s' % (self.fbExcText(exc)))

    def index(self):
        super().index()
        raise self.httpRedirect('rfsMain')

    index.exposed = True

    def rfsTaskBySlot(self, id):
        try:
            t = self.dbExec(sql='select * from wh_REFILLSLOT_TASKBYSLOT(?,?)', params=[id, self.whSesId()],
                            fetch='one')
        except Exception as exc:
            raise self.httpRedirect('rfsMain?mes=%s' % (self.fbExcText(exc)))
        else:
            raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s' % (t['TID'], t['WID']))

    def rfsTaskWaresQ(self, taskid, waresid):
        try:
            tw = self.dbExec(sql='select * from WH_REFILLSLOT_CALCQNEED(?,?)', params=[taskid, waresid], fetch='one')
        except Exception as exc:
            raise self.httpRedirect('rfsMain?mes=%s' % (self.fbExcText(exc)))
        return tw

    def rfsTaskByWares(self, wid):
        try:
            t = self.dbExec(sql='select * from WH_REFILLSLOT_TASKBYWARES(?,?)', params=[wid, self.whSesId()],
                            fetch='one')
            if t and t['TASKID']: raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s' % (t['TASKID'], wid))
        except Exception as exc:
            raise self.httpRedirect('rfsMain?mes=%s' % (self.fbExcText(exc)))

    def qWaresByBarcoe(self, barcode):
        return self.dbExec(sql='select distinct WID, WCODE, WNAME from WH_GET_BARCODE_WARESUNIT(?)',
                        params=[barcode], fetch='all')

    def rfsMain(self, mes=None, barcode=None):
        if not mes: self.rfsGetTask() # вдруг уже есть выполняемое задание
        if barcode:
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'SITE':
                    raise self.httpRedirect('rfsSlot?id=%s' % (self.kId(bcInfo['RECORDID'])))
                mes = _('Не верный ШК')
            else:
                bc = self.whBarCodeWaresInfo(barcode)
                if bc and bc['datalist'] and len(bc['datalist']) > 0:
                    if len(bc['datalist']) == 1:
                        wid = self.kId(bc['datalist'][0]['WID'])
                        self.rfsTaskByWares(wid=wid)
                        raise self.httpRedirect('rfsWares?id=%s' % wid)
                    else:
                        params = {'url': 'rfsWares?id=', 'backurl': 'rfsMain'}
                        return self.drawTemplate(templ=rangeWares, data=[bc, params])
                else:
                    mes = _('Не верный ШК')
        self.setIfaceVar('rfsRowId', None)
        rows = self.dbExec(sql='select * from K_WH_REFILLSLOT_LISTEMPLROWS(?)', params=[self.whSesId()],
                           fetch='all')
        return self.drawTemplate(templ=index, data=[rows, {'mes': mes, 'reloadurl': 'rfsMain'}])

    rfsMain.exposed = True

    def rfsWares(self, id, mes=None):
        id = self.kId(id)
        self.sessionWaresChk(waresid=id, flags='')
        w = self.dbExec(sql='select * from WH_REFILLSLOT_PRETASKWARINFO(?,?)', fetch='one',
                        params=[id, self.getUserVar('uid')])
        return self.drawTemplate(templ=wares, data=[w, {'backurl': 'rfsMain', 'mes': mes, 'treeName': _('Товар')}])
    rfsWares.exposed = True

    def rfsSlot(self, id, mes=None, barcode=None):
        if barcode:
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'SITE':
                    raise self.httpRedirect('rfsSlot?id=%s' % (self.kId(bcInfo['RECORDID'])))
                mes = _('Не верный ШК')
            else:
                bc = self.whBarCodeWaresInfo(barcode)
                if bc and bc['datalist'] and len(bc['datalist']) > 0:
                    if len(bc['datalist']) == 1:
                        wid = self.kId(bc['datalist'][0]['WID'])
                        self.rfsTaskByWares(wid=wid)
                        raise self.httpRedirect('rfsWares?id=%s' % wid)
                    else:
                        params = {'url': 'rfsWares?id=', 'backurl': 'rfsSlot?id=%s' % (id)}
                        return self.drawTemplate(templ=rangeWares, data=[bc, params])
                else:
                    mes = _('Не верный ШК')

        self.sessionSiteChk(siteid=id)
        s = self.qSiteInfo(siteid=id)
        if s['SPCODE'] != 'S':
            raise self.httpRedirect('rfsMain?mes=%s' % (_('Местоположение не является местом отборки!')))
        w = self.dbExec(sql='select * from WH_REFILLSLOT_LISTSLOTWARES(?,?)', fetch='all',
                        params=[self.kId(id), self.getUserVar('uid')])
        r = self.dbExec(sql='select * from K_SITE_ROWBYSLOT(?)', params=[id], fetch='one')
        return self.drawTemplate(templ=slot, data=[s, w, r, {'mes': mes, 'backurl': 'rfsMain', 'treeName': _('МО')}])
    rfsSlot.exposed = True

    def rfsRow(self, id, orderby='ascending', barcode=None, mes=None):
        self.rfsGetTask() # вдруг уже есть выполняемое задание
        if barcode:
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'SITE':
                    raise self.httpRedirect('rfsSlot?id=%s' % (self.kId(bcInfo['RECORDID'])))
                mes = _('Не верный ШК')
            else:
                bc = self.whBarCodeWaresInfo(barcode)
                if bc and bc['datalist'] and len(bc['datalist']) > 0:
                    if len(bc['datalist']) == 1:
                        wid = self.kId(bc['datalist'][0]['WID'])
                        self.rfsTaskByWares(wid=wid)
                        raise self.httpRedirect('rfsWares?id=%s' % wid)
                    else:
                        params = {'url': 'rfsWares?id=', 'backurl': 'rfsRow?id=%s' % (id)}
                        return self.drawTemplate(templ=rangeWares, data=[bc, params])
                else:
                    mes = _('Не верный ШК')

        id = self.kId(id)
        self.setIfaceVar('rfsRowId', id)
        t = self.dbExec(sql='select * from K_WH_REFILLSLOT_LISTROWTASK(?,?) order by slotname %s' % (orderby),
                        params=[id, self.whSesId()], fetch='all')
        if len(t['datalist']) == 0: raise self.httpRedirect('rfsMain?mes=%s' % ('Нет заданий в этом ряду!'))
        s = self.qSiteInfo(id)
        params = {'mes': mes, 'backurl': 'rfsMain', 'reloadurl': 'rfsRow?id=%s&orderby=%s' % (id, orderby),
                  'treeName': _('Row')}
        return self.drawTemplate(templ=row, data=[s, t, params])

    rfsRow.exposed = True

    def rfsTask(self, id, barcode=None, mes=None, chkTask='0'):
        id = self.kId(id)
        if chkTask != '0': self.rfsGetTask(tid=id) # вдруг уже есть выполняемое задание
        try:
            self.dbExec(sql="execute procedure K_SESSION_JOIN_TASK(?,?)", params=[id, self.whSesId()],
                        fetch='none')
        except Exception as exc:
            raise self.httpRedirect('rfsMain?mes=%s' % (self.fbExcText(exc)))

        if barcode:
            bc = self.whBarCodeWaresInfo(barcode)
            if bc and bc['datalist'] and len(bc['datalist']) > 0:
                if len(bc['datalist']) == 1:
                    wid = self.kId(bc['datalist'][0]['WID'])
                    raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s' % (id,  wid))
                else:
                    params = {'url': 'rfsTaskWares?tid=%s&wid=' % (id),
                              'backurl': 'rfsTask?id=%s' % (id)}
                    return self.drawTemplate(templ=rangeWares, data=[bc, params])
            else:
                mes = _('Не верный ШК')
        tw = self.dbExec(sql='select * from K_WH_REFILLSLOT_LISTTASKWARES(?,NULL)', params=[id], fetch='all')
        #if len(tw['datalist'])==1:
        #    raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s'%(id,tw['datalist'][0]['WID']))
        t = self.taskInfo(id)
        s = self.qSiteInfo(t['SITEID'])
        return self.drawTemplate(templ=task, data=[t, tw, s, {'treeName': _('Task')}])

    rfsTask.exposed = True

    def rfsTaskWaresPallet(self, tid, wid, flags='O', pid=None, mes=None):
        tid = self.kId(tid)
        wid = self.kId(wid)
        if pid:
            pid = self.kId(pid)
            try:
                self.dbExec(sql="execute procedure K_WH_REFILLSLOT_SETTWPALLET(?,?,?,?)",
                            params=[tid, wid, pid, self.whSesId()], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s' % (tid, wid))
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        s = self.qSiteInfo(t['SITEID'])
        tw = self.dbExec(sql='select * from K_WH_REFILLSLOT_LISTTASKWARES(?,?)', params=[tid, wid], fetch='one')
        backurl = 'rfsTask?id=%s' % (tid)
        p = self.dbExec(sql='select * from K_WH_REFILLSLOT_LISTTWPALLETS(?,?,?)', params=[tid, wid, flags], fetch='all')
        return self.drawTemplate(templ=taskWaresPallet,
                                 data=[t, tw, w, s, p, {'treeName': 'Позиция', 'mes': mes, 'flags': flags}])

    rfsTaskWaresPallet.exposed = True

    def rfsTaskWares(self, tid, wid, mes=None):
        tid = self.kId(tid)
        try:
            self.dbExec(sql="execute procedure K_SESSION_JOIN_TASK(?,?)", params=[tid, self.whSesId()],
                        fetch='none')
        except Exception as exc:
            raise self.httpRedirect('rfsMain?mes=%s' % (self.fbExcText(exc)))
        wid = self.kId(wid)
        tw = self.dbExec(sql='select * from K_WH_REFILLSLOT_LISTTASKWARES(?,?)', params=[tid, wid], fetch='one')
        if not tw['pid']:
            raise self.httpRedirect('rfsTaskWaresPallet?tid=%s&wid=%s' % (tid, wid))
        w = self.waresInfo(wid)
        if tw['ICTCODE'] and tw['ICTCODE'] == 'EGAIS':
            wp = self.dbExec(sql="select * from WH_REFILLSLOT_TW_LOTS(?,?)", params=[tid, wid], fetch="all")
        else:
            wp = self.dbExec(sql="select * from K_WORKPALLET_PALWARLOTS(?,?)", params=[tw['pid'], wid], fetch='all')
        if not wp or len(wp['datalist']) == 0:
            raise self.httpRedirect('rfsTaskWaresPallet?tid=%s&wid=%s&mes=%s' % (
            tid, wid, 'Нет товара на поддоне!'))
        t = self.taskInfo(tid)
        s = self.qSiteInfo(t['SITEID'])
        params = {'treeName': 'Позиция', 'mes': mes, 'ctm': self.dbCurrentTimestamp()}
        return self.drawTemplate(templ=taskWares, data=[t, tw, w, s, wp, params])

    rfsTaskWares.exposed = True

    def rfsTaskWaresSave(self, **args):
        slotid = None
        if 'barcode' in args:
            bcInfo = self.whBarCodeInfo(args['barcode'])
            if bcInfo:
                if bcInfo['USERCODE'] == 'SITE':
                    slotid = self.kId(bcInfo['RECORDID'])

        if not slotid:
            raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s&mes=%s' % (args['tid'], args['wid'], _('Invalid barcode')))

        wlots = ''
        amounts = ''
        for item in args:
            if item.find('wl') != -1:
                wlots += item[2:] + ';'
                amounts += args[item] + ';'
        ctm = self.dbDateTimePrep(args['ctm']) if 'ctm' in args else None
        try:
            self.dbExec(sql='execute procedure K_WH_REFILLSLOT_DO(?,?,?,?,?,?,?)', fetch='none',
                        params=[self.whSesId(), args['tid'], slotid, args['wuid'], wlots, amounts, ctm])
        except Exception as exc:
            raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s&mes=%s' % (args['tid'], args['wid'], self.fbExcText(exc)))
        else:
            rowId = self.getIfaceVar('rfsRowId')
            if rowId:
                raise self.httpRedirect('rfsRow?id=%s' % (rowId))
            else:
                raise self.httpRedirect('rfsMain')

    rfsTaskWaresSave.exposed = True

    def rfsTaskWaresEgaisScan(self, tid, wid, barcode, ctm=None):
        """
            Перемещение ЕГАИС товара с паллета на МО
        """
        bcInfo = self.whBarCodeInfo(barcode)
        if bcInfo:
            if bcInfo['USERCODE'] == 'SITE':
                try:
                    self.dbExec(sql='execute procedure WH_REFILLSLOT_EGAISALL(?,?,?,?,?)', fetch='none',
                                params=[tid, wid, self.kId(bcInfo['RECORDID']), self.whSesId(), self.dbDateTimePrep(ctm)])
                except Exception as exc:
                    mes = self.fbExcText(exc)
                    raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, mes))
                else:
                    raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s' % (tid, wid))
        bcInfo = self.whBarCodeWaresInfo(barcode=barcode, waresid=wid)
        if bcInfo and bcInfo['datalist'] and len(bcInfo['datalist']) == 1:
            try:
                self.dbExec(sql='execute procedure WH_REFILLSLOT_EGAISSCAN(?,?,?)', fetch='none',
                            params=[tid, wid, barcode])
            except Exception as exc:
                mes = self.fbExcText(exc)
                raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, mes))
            else:
                raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s' % (tid, wid))
        raise self.httpRedirect('rfsTaskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, _('Не верный ШК')))

    rfsTaskWaresEgaisScan.exposed = True

    def rfsTaskWaresCancel(self, tid, wid):
        try:
            self.dbExec(sql='execute procedure K_WH_REFILLSLOT_CANCEL(?,?)', fetch='none', params=[tid, wid])
        except Exception as exc:
            raise self.httpRedirect('rfsTaskWaresPallet?tid=%s&wid=%s&mes=%s' % (tid, wid, self.fbExcText(exc)))
        else:
            rowId = self.getIfaceVar('rfsRowId')
            if rowId:
                raise self.httpRedirect('rfsRow?id=%s' % (rowId))
            else:
                raise self.httpRedirect('rfsMain')

    rfsTaskWaresCancel.exposed = True

    def rfsTaskWaresAside(self, tid, wid):
        try:
            self.dbExec(sql='execute procedure WH_REFILLSLOT_ASIDE(?,?)', fetch='none', params=[tid, wid])
        except Exception as exc:
            raise self.httpRedirect('rfsTaskWaresPallet?tid=%s&wid=%s&mes=%s' % (tid, wid, self.fbExcText(exc)))
        else:
            rowId = self.getIfaceVar('rfsRowId')
            if rowId:
                raise self.httpRedirect('rfsRow?id=%s' % (rowId))
            else:
                raise self.httpRedirect('rfsMain')

    rfsTaskWaresAside.exposed = True

    def rfsTaskEnd(self, id):
        try:
            self.dbExec(sql='execute procedure K_WH_REFILLSLOT_END(?)', fetch='none', params=[id])
        except Exception as exc:
            raise self.httpRedirect('rfsTask?id=%s&mes=%s' % (id, self.fbExcText(exc)))
        else:
            rowId = self.getIfaceVar('rfsRowId')
            if rowId:
                raise self.httpRedirect('rfsRow?id=%s' % (rowId))
            else:
                raise self.httpRedirect('rfsMain')

    rfsTaskEnd.exposed = True

    def rfsTaskCreate(self, wid):
        try:
            t = self.dbExec(sql='select * from WH_REFILLSLOT_TASKCREATETERM(?,?)', fetch='one',
                            params=[wid, self.getUserVar('uid')])
        except Exception as exc:
            raise self.httpRedirect('rfsWares?id=%s&mes=%s' % (wid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('rfsTask?id=%s' % (t['taskid']))
    rfsTaskCreate.exposed = True
    