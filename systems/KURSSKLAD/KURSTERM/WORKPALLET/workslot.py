# -*- coding: utf-8 -*-

from systems.KURSSKLAD.KURSTERM.pallet import TCommonPallet

from systems.KURSSKLAD.KURSTERM.WORKPALLET.templates.index import index
from systems.KURSSKLAD.KURSTERM.WORKPALLET.templates.task import task
from systems.KURSSKLAD.KURSTERM.WORKPALLET.templates.taskE import taskE
from systems.KURSSKLAD.KURSTERM.WORKPALLET.templates.palI import palI
from systems.KURSSKLAD.KURSTERM.WORKPALLET.templates.palS import palS
from systems.KURSSKLAD.KURSTERM.WORKPALLET.templates.palWares import palWares
from systems.KURSSKLAD.KURSTERM.WORKPALLET.templates.palWaresEgaisAll import palWaresEgaisAll
from systems.KURSSKLAD.KURSTERM.WORKPALLET.templates.palWaresEgaisBox import palWaresEgaisBox

from cherrypy import HTTPRedirect


class TWorkSlot(TCommonPallet):
    helpSystem = True

    # настройки для работы с паллетом
    tmplTask = task
    tmplTaskE = taskE
    tmplPalI = palI
    tmplPalS = palS
    tmplPalV = palI
    tmplPalIWares = palWares
    tmplPalSWares = palWares
    tmplPalVWares = palWares
    palBackUrl = 'wpMain'
    tmplPalWaresEgaisAll = palWaresEgaisAll
    tmplPalWaresEgaisBox = palWaresEgaisBox

    def sessionPalletChk(self, palletid):
        TCommonPallet.sessionPalletChk(self, palletid=palletid, url=self.palBackUrl, flags='')

    helpSystem = True

    def index(self, id_system=None):
        TCommonPallet.index(self, id_system)
        self.setIfaceVar('wmsid', self.GetKSessionID())
        self.setIfaceVar('manid', self.userGetManId())
        return self.wpMain()

    index.exposed = True

    def wpMain(self, barcode=None, mes=None):
        if barcode:
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                mes = _('Не верный ШК')
                if bcInfo['usercode'] == 'PALLET':
                    raise HTTPRedirect('pal?id=%s' % (bcInfo['recordid']))
                elif bcInfo['usercode'] == 'SITE':
                    pid = self.getSitePallet(siteid=bcInfo['recordid'])
                    if pid:
                        raise HTTPRedirect('pal?id=%s' % (pid))
            else:
                mes = _('ШК не обрабатыается')
        else:
            t = self.dbExec(sql='select * from WH_WORKPALLET_ACTIVETASK(?)', fetch='one',
                            params=[self.getIfaceVar('wmsid')])
            if t['TASKID']:
                raise HTTPRedirect('wpTask?tid=%s' % t['TASKID'])
        return self.drawTemplate(templ=index, data=[{'mes': mes}])

    wpMain.exposed = True

    def palQWaresMoveEgaisAll(self, pid, wid, newpalletid, ctm):
        self.dbExec(sql='execute procedure WH_WORKPALLET_MOVE_EGAISALL(?,?,?,?,?)',
                    params=[self.getIfaceVar('wmsid'), pid, wid, newpalletid, ctm], fetch='none')

    def palQWaresMoveEgaisStart(self, pid, wid, newpalletid, ctm):
        return self.dbExec(sql='select * from WH_WORKPALLET_MOVE_EGAISSTART(?,?,?,?,?)',
                           params=[self.getIfaceVar('wmsid'), pid, wid, newpalletid, ctm], fetch='one')

    def palWaresEgaisAll(self, pid, wid, ctm=None, mes=None, barcode=None):
        """
            Перемещение всего ЕГАИС товара с паллета на паллет
        """
        if barcode:
            newpalletid = None
            bcInfo = self.kBarCodeInfo(barcode)
            if bcInfo and bcInfo['result'] == 0:
                if bcInfo['usercode'] == 'PALLET':
                    newpalletid = self.kId(bcInfo['recordid'])
                elif bcInfo['usercode'] == 'SITE':
                    newpalletid = self.getSitePallet(siteid=bcInfo['recordid'])
            if not newpalletid:
                mes = _('Не верный ШК')
            else:
                try:
                    self.palQWaresMoveEgaisAll(pid=pid, wid=wid, newpalletid=newpalletid, ctm=ctm)
                except Exception as exc:
                    mes = self.fbExcText(exc)
                else:
                    raise HTTPRedirect('pal?id=%s' % pid)

        pid = self.kId(pid)
        backurl = 'palWares?id=%s&wid=%s' % (pid, wid)
        p = self.palQInfo(pid)
        wl = self.palQWaresLots(id=pid, wid=wid)
        w = self.waresInfo(waresid=wid)
        return self.drawTemplate(templ=self.tmplPalWaresEgaisAll, data=[p, w, wl, {'backurl': backurl, 'mes': mes}])

    palWaresEgaisAll.exposed = True

    def palWaresEgaisBox(self, pid, wid, ctm=None, mes=None, barcode=None):
        """
            Перемещение части товара ЕГАИС товара с паллета на паллет
        """
        if barcode:
            newpalletid = None
            bcInfo = self.kBarCodeInfo(barcode)
            if bcInfo and bcInfo['result'] == 0:
                if bcInfo['usercode'] == 'PALLET':
                    newpalletid = self.kId(bcInfo['recordid'])
                elif bcInfo['usercode'] == 'SITE':
                    newpalletid = self.getSitePallet(siteid=bcInfo['recordid'])
            if not newpalletid:
                mes = _('Не верный ШК')
            else:
                try:
                    t = self.palQWaresMoveEgaisStart(pid=pid, wid=wid, newpalletid=newpalletid, ctm=ctm)
                except Exception as exc:
                    mes = self.fbExcText(exc)
                else:
                    raise HTTPRedirect('wpTask?tid=%s' % t['TASKID'])

        pid = self.kId(pid)
        backurl = 'palWares?id=%s&wid=%s' % (pid, wid)
        p = self.palQInfo(pid)
        wl = self.palQWaresLots(id=pid, wid=wid)
        w = self.waresInfo(waresid=wid)
        return self.drawTemplate(templ=self.tmplPalWaresEgaisBox, data=[p, w, wl, {'backurl': backurl, 'mes': mes}])

    palWaresEgaisBox.exposed = True

    def wpTask(self, tid, **args):
        t = self.taskInfo(id=tid)
        if t['ALGORITHM'] == 'E':
            args['t'] = t
            return self.wpTaskE(tid=tid, **args)
        else:
            mes = _('Задания такого метода не обрабатываются')
            return self.drawTemplate(templ=self.tmplTask, data=[t, {'reloadurl': 'wpTask?tid=%s' % tid, 'mes': mes}])

    wpTask.exposed = True

    def wpTaskE(self, tid, **args):
        mes = args['mes'] if 'mes' in args else None
        if 'barcode' in args:
            try:
                self.dbExec(sql='execute procedure WH_WORKPALLET_MOVE_EGAISSCAN(?,?)',
                            params=[tid, args['barcode']], fetch='none')
            except Exception as exc:
                mes = self.fbExcText(exc)
        t = self.dbExec(sql='select * from WH_WORKPALLET_TASKE_INFO(?)', params=[tid], fetch='one')
        l = self.dbExec(sql='select * from WH_WORKPALLET_TASKE_LOTS(?)', params=[tid], fetch='all')
        return self.drawTemplate(templ=self.tmplTaskE, data=[t, l, {'mes': mes}])

    def wpTaskEnd(self, tid):
        try:
            self.dbExec(sql='execute procedure WH_TASKEND(?,?)', params=[tid, self.getIfaceVar('wmsid')], fetch='none')
        except Exception as exc:
            mes = self.fbExcText(exc)
            raise HTTPRedirect('wpTask?tid=%s&mes=%s' % (tid, mes))
        else:
            raise HTTPRedirect('wpMain')

    wpTaskEnd.exposed = True
