# -*- coding: utf-8 -*-

from systems.KURSSKLAD.KURSTERM.common import TCommonTerm
from systems.KURSSKLAD.KURSTERM.templates.commonRangeWares import commonRangeWares as rangeWares

from systems.KURSSKLAD.KURSTERM.WARESSELGROUP.templates.index import index
from systems.KURSSKLAD.KURSTERM.WARESSELGROUP.templates.wares import wares
from systems.KURSSKLAD.KURSTERM.WARESSELGROUP.templates.pallet import pallet
from systems.KURSSKLAD.KURSTERM.WARESSELGROUP.templates.site import site


class TWaresSelGroup(TCommonTerm):

    def index(self):
        super().index()
        return self.main()
    index.exposed = True

    def main(self, barcode=None, mes=None):
        if barcode:
            bcInfo = self.whBarCodeInfo(barcode)
            if bcInfo:
                if bcInfo['USERCODE'] == 'SITE':
                    raise self.httpRedirect('site?sid=%s' % bcInfo['recordid'])
                elif bcInfo['USERCODE'] == 'PALLET':
                    raise self.httpRedirect('pallet?pid=%s' % bcInfo['recordid'])
                mes = _('Не верный ШК')
            else:
                bc = self.whBarCodeWaresInfo(barcode)
                if bc and bc['datalist'] and len(bc['datalist']) > 0:
                    if len(bc['datalist']) == 1:
                        raise self.httpRedirect('wares?wid=%s' % bc['datalist'][0]['WID'])
                    else:
                        params = {'url': 'wares?wid=', 'backurl': 'main'}
                        return self.drawTemplate(templ=rangeWares, data=[bc, params])
                else:
                    mes = _('Не верный ШК')
        return self.drawTemplate(templ=index, data=[{'mes': mes}])
    main.exposed = True

    def wares(self, wid, mes=None):
        wid = self.kId(wid)
        w = self.waresInfo(waresid=wid)
        return self.drawTemplate(templ=wares, data=[w, {'mes': mes, 'backurl': 'main'}])
    wares.exposed = True

    def site(self, sid, mes=None):
        try:
            s = self.qSiteInfo(siteid=sid)
            w = self.dbExec(sql='select * from WH_TWSG_SITE_WARESLIST(?)', fetch='all', params=[self.kId(sid)])
        except Exception as exc:
            raise self.httpRedirect('main?mes=%s' % self.fbExcText(exc))
        return self.drawTemplate(templ=site, data=[s, w, {'mes': mes, 'backurl': 'main'}])
    site.exposed = True

    def siteWaresSelGroup(self, sid, wid, **args):
        backurl = 'site?sid=%s' % sid
        args['href'] = 'siteWaresSelGroup?sid=%s&wid=%s&sgid=' % (sid, wid)
        return self.whWaresSelGroup(waresid=wid, backurl=backurl, **args)
    siteWaresSelGroup.exposed = True

    def pallet(self, pid, mes=None):
        try:
            p = self.qPalletInfo(pid=pid)
            w = self.dbExec(sql='select * from WH_TWSG_PAL_WARESLIST(?)', fetch='all', params=[self.kId(pid)])
        except Exception as exc:
            raise self.httpRedirect('main?mes=%s' % self.fbExcText(exc))
        return self.drawTemplate(templ=pallet, data=[p, w, {'mes': mes, 'backurl': 'main'}])
    pallet.exposed = True

    def palWaresSelGroup(self, pid, wid, **args):
        backurl = 'pallet?pid=%s' % pid
        args['href'] = 'palWaresSelGroup?pid=%s&wid=%s&sgid=' % (pid, wid)
        return self.whWaresSelGroup(waresid=wid, backurl=backurl, **args)
    palWaresSelGroup.exposed = True

    def waresSelGroup(self, wid, **args):
        backurl = 'wares?wid=%s' % wid
        args['href'] = 'waresSelGroup?wid=%s&sgid=' % wid
        return self.whWaresSelGroup(waresid=wid, backurl=backurl, **args)
    waresSelGroup.exposed = True