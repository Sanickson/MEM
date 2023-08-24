# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.common import TCommonTerm

from systems.KURSSKLAD.KURSTERM.WARESSLOT.templates.index import index
from systems.KURSSKLAD.KURSTERM.WARESSLOT.templates.slot import slot
from systems.KURSSKLAD.KURSTERM.WARESSLOT.templates.wares import wares
from systems.KURSSKLAD.KURSTERM.templates.commonRangeWares import commonRangeWares as rangeWares
from systems.KURSSKLAD.KURSTERM.WARESSLOT.templates.waresSlot import waresSlot

from cherrypy import HTTPRedirect


class TWaresSlot(TCommonTerm):

    def waresInfo(self, waresid):
        return self.dbExec(sql='select * from WH_WARESSLOT_INFO(?,?)',
                           params=[self.kId(waresid), self.getUserVar('uid')], fetch='one')


    def index(self):
        super().index()
        return self.main()

    index.exposed = True


    def main(self, barcode=None, mes=None):
        if barcode:
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'SITE':
                    raise HTTPRedirect('slot?id=%s' % (bcInfo['recordid']))
                mes = _('Не верный ШК')
            else:
                bc = self.whBarCodeWaresInfo(barcode)
                if bc and bc['datalist'] and len(bc['datalist']) > 0:
                    if len(bc['datalist']) == 1:
                        raise HTTPRedirect('wares?id=%s' % bc['datalist'][0]['WID'])
                    else:
                        params = {'url': 'wares?id=', 'backurl': 'main'}
                        return self.drawTemplate(templ=rangeWares, data=[bc, params])
                else:
                    mes = _('Не верный ШК')
        return self.drawTemplate(templ=index, data=[{'mes': mes}])

    main.exposed = True


    def wares(self, id, mes=None):
        id = self.kId(id)
        self.sessionWaresChk(waresid=id, flags='')
        w = self.waresInfo(waresid=id)
        supplier = self.waresInfoLastSupplier(waresid=id)
        return self.drawTemplate(templ=wares,
                                 data=[supplier, w, {'mes': mes, 'backurl': 'main', 'treeName': _('Товар')}])

    wares.exposed = True

    def waresScan(self, id, barcode):
        bcInfo = self.whBarCodeInfo(barcode)
        if bcInfo:
            if bcInfo['USERCODE'] == 'SITE':
                raise HTTPRedirect('waresSlot?wid=%s&sid=%s' % (id, bcInfo['RECORDID']))
            mes = _('Не верный ШК')
        else:
            bc = self.whBarCodeWaresInfo(barcode)
            if bc and bc['datalist'] and len(bc['datalist']) > 0:
                if len(bc['datalist']) == 1:
                    raise HTTPRedirect('wares?id=%s' % bc['datalist'][0]['WID'])
                else:
                    params = {'url': 'wares?id=', 'backurl': 'main'}
                    return self.drawTemplate(templ=rangeWares, data=[bc, params])
            else:
                mes = _('Не верный ШК')
        return self.wares(id=id, mes=mes)

    waresScan.exposed = True

    def slot(self, id, mes=None):
        self.sessionSiteChk(siteid=id)
        s = self.qSiteInfo(siteid=id)
        if s['SITESTATUS'] != '1':
            raise HTTPRedirect('main?mes=%s' % ('МП не активно'))
        w = self.dbExec(sql='select * from WH_WARESSLOT_LIST(?,?)', fetch='all',
                        params=[self.kId(id), self.getUserVar('uid')])
        return self.drawTemplate(templ=slot, data=[s, w, {'mes': mes, 'backurl': 'main', 'treeName': _('МО')}])

    slot.exposed = True


    def waresSlot(self, wid, sid, conf='0', mes=None):
        wid = self.kId(wid)
        sid = self.kId(sid)
        self.sessionWaresChk(waresid=wid, flags='')
        self.sessionSiteChk(siteid=sid, flags='')
        ws = self.waresInfo(waresid=wid)
        #supplier = self.waresInfoLastSupplier(waresid=wid)
        supplier = None
        s = self.qSiteInfo(siteid=sid)
        if s['SITESTATUS'] != '1':
            raise HTTPRedirect('wares?id=%s&mes=%s' % (wid, _('МП не активно')))
        return self.drawTemplate(templ=waresSlot, data=[supplier, ws, s, {'mes': mes, 'backurl': 'wares?id=%s' % (wid),
                                                                          'treeName': _('Товар')}])

    waresSlot.exposed = True

    def waresSlotDel(self, wid):
        wid = self.kId(wid)
        try:
            self.dbExec(sql='execute procedure K_WARESSLOT_DEL(?,?,Null)', params=[wid, self.whSesId()],
                        fetch='none')
        except Exception as exc:
            raise HTTPRedirect('wares?id=%s&mes=%s' % (wid, self.fbExcText(exc)))
        else:
            raise HTTPRedirect('wares?id=%s' % wid)

    waresSlotDel.exposed = True

    def waresSlotSet(self, wid, wuid, sid, q):
        wid = self.kId(wid)
        sid = self.kId(sid)
        try:
            self.dbExec(sql='execute procedure WH_WARESSLOT_SET(?,?,?,?,Null)',
                        params=[wuid, q, sid, self.whSesId()], fetch='none')
        except Exception as exc:
            raise HTTPRedirect('waresSlot?wid=%s&sid=%s&mes=%s' % (wid, sid, self.fbExcText(exc)))
        else:
            raise HTTPRedirect('wares?id=%s' % wid)

    waresSlotSet.exposed = True