# -*- coding: utf-8 -*-
__author__ = 'Nickson'
from cherrypy import HTTPRedirect

from systems.KURSSKLAD.KURSTERM.common import TCommonTerm

from systems.KURSSKLAD.KURSTERM.templates.mainPal import mainPal
from systems.KURSSKLAD.KURSTERM.templates.mainPalWares import mainPalWares
from systems.KURSSKLAD.KURSTERM.templates.mainPalWaresTara import mainPalWaresTara
from systems.KURSSKLAD.KURSTERM.templates.commonRangeWares import commonRangeWares as rangeWares
#from systems.KURSSKLAD.KURSTERM.templates.mainPalWaresRange import mainPalWaresRange
from systems.KURSSKLAD.KURSTERM.templates.mainPalSite import mainPalSite

from systems.KURSSKLAD.KURSTERM.templates.mainPalS import mainPalS

class TCommonPallet(TCommonTerm):
    # ссылка для возврата
    palBackUrl = 'main'
    palFlagsSessionChk = ''

    palDefaultCanSite = True
    palDefaultCanWares = True
    palDefaultCanPallet = True
    canTaraWeightChg = False
    # ----------------------------------------------------------------------------------------------------------
    # Шаблоны
    # ----------------------------------------------------------------------------------------------------------
    tmplPal = mainPal
    tmplPalWares = mainPalWares
    tmplPalWaresTara = mainPalWaresTara
    tmplPalWaresRange = rangeWares
    tmplPalSite = mainPalSite

    tmplPalS = mainPalS

    # ----------------------------------------------------------------------------------------------------------
    # Запросы
    # ----------------------------------------------------------------------------------------------------------
    def palQInfo(self, id):
        return self.qPalletInfo(pid=id, palFlagsSessionChk=self.palFlagsSessionChk)

    def palQWaresInfo(self, pid, wid):
        return self.dbExec(sql="select * from WH_PALLETWARES_INFO(?,?,?)",
                           params=[pid, wid, self.getIfaceVar('wmsid')], fetch="one")


    def palQWares(self, id):
        return self.dbExec(sql="select * from K_PALLET_LISTWARES(?)", params=[id], fetch="all")

    def palSQWares(self, id, wid=None):
        if wid:
            return self.dbExec(sql="select * from WH_PALLETS_LISTWARES(?,?)", params=[id, wid], fetch="one")
        else:
            return self.dbExec(sql="select * from WH_PALLETS_LISTWARES(?)", params=[id], fetch="all")

    def palQWaresLots(self, id, wid):
        return self.dbExec(sql="select * from WH_PALLETWARES_LOTINCOMES(?,?,?)",
                           params=[id, wid, self.getIfaceVar('wmsid')], fetch="all")
        #return self.dbExec(sql="select * from K_WORKPALLET_PALWARLOTS(?,?)", params=[id, wid], fetch="all")

    def palQWaresWLs(self, pid, wid):
        return self.dbExec(sql="select * from WH_PALLETWARES_LOTS(?,?)", params=[pid, wid], fetch="all")

    def palQWaresLot(self, id, wid, wlotid, wlincomeid=None):
        return self.dbExec(sql="select * from WH_PALLETWARES_LOTINCOME(?,?,?,?,?)",
                           params=[id, wid, self.getIfaceVar('wmsid'), wlotid, wlincomeid], fetch="one")

    def palQWaresChk(self, id, wid):
        return self.dbExec(sql="execute procedure WH_PALLET_WARESCHK(?,?,?)",
                           params=[id, wid, self.getIfaceVar('wmsid')], fetch="one")['MODE']

    def palQWaresMove(self, id, wuid, wlots, amounts, newpalid, dt=None):
        self.dbExec(sql='execute procedure K_WH_WORKPALLET_SAVE(?,?,?,?,?,?,?)', fetch='none',
                    params=[self.getIfaceVar('wmsid'), id, wuid, wlots, amounts, newpalid, dt])

    def palQSiteListLevels(self, id, sid):
        return self.dbExec(sql="select * from WH_PALLET_SITELISTLEVELS(?,?)", params=[id, sid], fetch="all")

    def palQSiteSet(self, id, sid, dt=None):
        self.dbExec(sql="execute procedure K_WORKPALLET_MOVE(?,?,?,?)", fetch='none',
                    params=[id, sid, self.getIfaceVar('wmsid'), dt])

    def palQWaresByBarcode(self, id, barcode):
        return self.dbExec(sql="select * from WH_PALLET_WARESBYBARCODE(?,?)", fetch='all', params=[id, barcode])

    # ----------------------------------------------------------------------------------------------------------
    # Отрисовка
    # ----------------------------------------------------------------------------------------------------------
    def pal(self, id, **args):
        """
            Отрисовка паллета, только этот метод должен быть exposed, он вызывает правильный метод для отрисовки
            паллета согласно1 его типа
        """
        id = self.kId(id)
        TCommonTerm.sessionPalletChk(self, palletid=id, url=self.palBackUrl, flags='')
        p = self.palQInfo(id)
        pw = None
        tmpl = self.tmplPal
        mes = args['mes'] if 'mes' in args else None
        if p['pal_tcode']:
            methodname = 'pal' + p['pal_tcode']
            if hasattr(self, methodname):
                return getattr(self, methodname)(id=id, p=p, mes=mes)
            methodname = 'pal' + p['pal_tcode'] + 'QWares'
            if hasattr(self, methodname):
                pw = getattr(self, methodname)(id=id)
            methodname = 'tmplPal' + p['pal_tcode']
            if hasattr(self, methodname):
                tmpl = getattr(self, methodname)
        if pw is None:
            pw = self.palQWares(id=id)
        backurl = args['backurl'] if 'backurl' in args else self.palBackUrl
        return self.drawTemplate(templ=tmpl, data=[p, pw, {'backurl': backurl, 'mes': mes}, args])

    pal.exposed = True

    # ----------------------------------------------------------------------------------------------------------
    # Перемещение товара
    # ----------------------------------------------------------------------------------------------------------
    def palWares(self, id, wid, mes=None, backurl=None):
        """
            Отрисовка товара на паллете
        """
        id = self.kId(id)
        if not backurl:
            backurl = 'pal?id=%s' % id
        try:
            mode = self.palQWaresChk(id, wid)
        except Exception as exc:
            raise HTTPRedirect(urls=backurl + '&mes=%s' % self.fbExcText(exc))
        p = self.palQInfo(id)
        pwi = wl = None
        tmpl = self.tmplPalWares
        if p['pal_tcode']:
            methodname = 'pal' + p['pal_tcode'] + 'Wares'
            if hasattr(self, methodname):
                return getattr(self, methodname)(id=id, p=p, wid=wid, mes=mes, mode=mode)
            methodname = 'pal' + p['pal_tcode'] + 'QWaresLots'
            if hasattr(self, methodname):
                wl = getattr(self, methodname)(id=id, wid=wid)
            methodname = 'pal' + p['pal_tcode'] + 'QWaresInfo'
            if hasattr(self, methodname):
                pwi = getattr(self, methodname)(pid=id, wid=wid)
            methodname = 'tmplPal' + p['pal_tcode'] + 'Wares' + mode
            if hasattr(self, methodname):
                tmpl = getattr(self, methodname)
        if wl is None:
            wl = self.palQWaresLots(id=id, wid=wid)
        if pwi is None:
            pwi = self.palQWaresInfo(pid=id, wid=wid)
        w = self.waresInfo(waresid=wid)
        return self.drawTemplate(templ=tmpl, data=[p, w, wl, pwi, {'backurl': backurl, 'mes': mes, 'mode': mode}])

    palWares.exposed = True


    def palWaresMove(self, **args):
        newpalletid = None
        if 'barcode' in args:
            bcInfo = self.kBarCodeInfo(args['barcode'])
            if bcInfo and bcInfo['result'] == 0:
                if bcInfo['usercode'] == 'PALLET':
                    newpalletid = self.kId(bcInfo['recordid'])
                elif bcInfo['usercode'] == 'SITE':
                    newpalletid = self.getSitePallet(siteid=bcInfo['recordid'])
                elif bcInfo['usercode'] == 'WARES':
                    raise HTTPRedirect('palWares?id=%s&wid=%s' % (args['pid'], bcInfo['recordid']))
        if not newpalletid:
            raise HTTPRedirect('palWares?id=%s&wid=%s&mes=%s' % (args['pid'], args['wid'], _('Не верный ШК')))
        self.sessionPalletChk(palletid=args['pid'])
        self.sessionPalletChk(palletid=newpalletid)
        wlots = ''
        amounts = ''
        for item in args:
            if item.find('wl') != -1:
                wlots += item[2:] + ';'
                amounts += args[item] + ';'
        try:
            self.palQWaresMove(id=args['pid'], wuid=args['wuid'], wlots=wlots, amounts=amounts, newpalid=newpalletid,
                               dt=args['ctm'])
        except Exception as exc:
            raise HTTPRedirect('palWares?id=%s&wid=%s&mes=%s' % (args['pid'], args['wid'], self.fbExcText(exc)))
        else:
            raise HTTPRedirect('pal?id=%s' % (args['pid']))

    palWaresMove.exposed = True

    # ----------------------------------------------------------------------------------------------------------
    # Перемещение паллета
    # ----------------------------------------------------------------------------------------------------------
    def palSite(self, id, sid, mes=None, canPallet=None):
        sid = self.kId(sid)
        self.sessionSiteChk(siteid=sid, url='pal?id=%s' % (id), flags='')
        id = self.kId(id)
        p = self.palQInfo(id)
        try:
            b = self.palQSiteListLevels(id, sid)
        except Exception as exc:
            raise HTTPRedirect('pal?id=%s&mes=%s' % (id, self.fbExcText(exc)))
        data = [p, b]
        if canPallet is None:
            canPallet = self.palDefaultCanPallet
        if canPallet:
            s = self.qSiteInfo(siteid=sid)
            data.append(s)
        if len(b['datalist']) == 0 and canPallet and s['SITEPALLETID']:
            raise HTTPRedirect('pal?id=%s' % (s['SITEPALLETID']))
        data.append({'mes': mes, 'backurl': 'pal?id=%s' % (id)})
        return self.drawTemplate(templ=self.tmplPalSite, data=data)

    palSite.exposed = True

    def palSiteSet(self, id, sid, dt=None):
        dt = self.dbDateTimePrep(dt=dt)
        try:
            self.palQSiteSet(id=id, sid=sid, dt=dt)
        except Exception as exc:
            raise HTTPRedirect('palSite?id=%s&sid=%s&mes=%s' % (id, sid, self.fbExcText(exc)))
        else:
            raise HTTPRedirect(self.palBackUrl)

    palSiteSet.exposed = True

    # ----------------------------------------------------------------------------------------------------------
    # Сканирование
    # ----------------------------------------------------------------------------------------------------------
    def palScan(self, id, barcode, canSite=None, canWares=None, canPallet=None):
        """
            Сканирование при работе с паллетом
        """
        bcInfo = self.whBarCodeInfo(barcode)
        if bcInfo:
            if bcInfo['USERCODE'] == 'SITE':
                if canSite is None:
                    canSite = self.palDefaultCanSite
                if canSite == True:
                    p = self.palQInfo(id)
                    if p['PAL_TCANMOVE'] != '0':
                        raise HTTPRedirect('palSite?id=%s&sid=%s' % (id, bcInfo['RECORDID']))
                    else:
                        if canPallet is None:
                            canPallet = self.palDefaultCanPallet
                        if canPallet == True:
                            pid = self.getSitePallet(siteid=bcInfo['RECORDID'])
                            if pid:
                                raise HTTPRedirect('pal?id=%s' % (pid))
            elif bcInfo['usercode'] == 'PALLET':
                if canPallet is None:
                    canPallet = self.palDefaultCanPallet
                if canPallet == True:
                    raise HTTPRedirect('pal?id=%s' % (bcInfo['RECORDID']))
            mes = _('Не верный ШК')
        else:
            if canWares is None:
                canWares = self.palDefaultCanWares
            if canWares == True:
                bc = self.palQWaresByBarcode(id, barcode)
                if bc and bc['datalist'] and len(bc['datalist']) > 0:
                    if len(bc['datalist']) == 1:
                        raise HTTPRedirect('palWares?id=%s&wid=%s' % (id, bc['datalist'][0]['WID']))
                    else:
                        p = self.palQInfo(id)
                        params = {'url': 'palWares?id=%s&wid=' % id, 'backurl': 'pal?id=%s' % id}
                        return self.drawTemplate(templ=self.tmplPalWaresRange, data=[p, bc, params])
                else:
                    mes = _('Не верный ШК')
        if not mes:
            mes = _('Не верный ШК')
        raise HTTPRedirect('pal?id=%s&mes=%s' % (id, mes))

    palScan.exposed = True

    def palWaresTara(self, pid, wid, **args):
        wid = self.kId(wid)
        backurl = args['backurl'] if 'backurl' in args else 'palWares?id=%s&wid=%s' % (pid, wid)
        saveurl = args['saveurl'] if 'saveurl' in args else backurl
        params = {'backurl': backurl, 'saveurl': saveurl}
        if 'weight' in args:
            try:
                self.dbExec(sql="execute procedure PALLETWARES_TARA_SET(?,?,?,?)",
                            fetch='none', params=[pid, wid, args['weight'], self.getIfaceVar('wmsid')])
            except Exception as exc:
                params['mes'] = self.fbExcText(exc)
            else:
                raise HTTPRedirect(saveurl)
        w = self.waresInfo(wid)
        p = self.palletInfo(pid)
        pwt = self.dbExec(sql="select * from PALLETWARES_TARA_GET(?,?)", fetch='one', params=[pid, wid])
        return self.drawTemplate(templ=self.tmplPalWaresTara, data=[p, w, pwt, params])

    palWaresTara.exposed = True
