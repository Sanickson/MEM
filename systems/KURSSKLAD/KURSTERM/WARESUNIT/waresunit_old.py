# -*- coding: utf-8 -*-

from systems.KURSSKLAD.KURSTERM.common import TCommonTerm

from systems.KURSSKLAD.KURSTERM.WARESUNIT.templates.index import index
from systems.KURSSKLAD.KURSTERM.WARESUNIT.templates.rangeWares import rangeWares
from systems.KURSSKLAD.KURSTERM.WARESUNIT.templates.wares import wares
from systems.KURSSKLAD.KURSTERM.WARESUNIT.templates.waresunit import waresunit
from systems.KURSSKLAD.KURSTERM.WARESUNIT.templates.waresgetunits import waresgetunits
from systems.KURSSKLAD.KURSTERM.WARESUNIT.templates.barcodes import barcodes

from cherrypy import HTTPRedirect

class TWaresUnit(TCommonTerm):
    wuTmplRangeWares = rangeWares
    wuTmplMain = index
    wuTmplWares = wares
    wuTmplWaresUnit = waresunit
    wuTmplWaresGetUnits = waresgetunits
    wuTmplBarcodes = barcodes
    
    def index(self):
        TCommonTerm.index(self)
        self.setSesVar('wmsid',self.GetKSessionID())
        return self.wuMain()
    index.exposed = True

    def wuMain(self, barcode=None):
        mes = None
        if barcode:
            bcInfo = self.whBarCodeWaresInfo(barcode)
            if bcInfo and bcInfo['datalist'] and len(bcInfo['datalist']) > 0:
                if len(bcInfo['datalist']) == 1:
                    bc0 = bcInfo['datalist'][0]
                    raise HTTPRedirect('wuWaresUnit?wid=%s&uid=%s' % (bc0['WID'], bc0['UID']))
                    # raise HTTPRedirect('wuWares?id=%s' % (bcInfo['datalist'][0]['WID']))
                else:
                    return self.drawTemplate(templ=self.wuTmplRangeWares, data=[bcInfo])
            else:
                mes=_('Не верный ШК')
        return self.drawTemplate(templ=self.wuTmplMain, data=[{'mes':mes}])
    wuMain.exposed = True
    
    def wuWares(self, id, mes=None, backurl = 'wuMain'):
        id = self.kId(id)
        w = self.waresInfo(waresid=id)
        wu = self.dbExec(sql='select * from K_WH_SPWARES_WUNITS(?) order by WUFACTOR',params=[id],fetch='all')
        return self.drawTemplate(templ=self.wuTmplWares, data=[w, wu, {'mes':mes, 'backurl':backurl, 'treeName':_('Товар')}])
    wuWares.exposed = True
    
    def wuWaresUnit(self, wid, uid, mes=None, backurl=None):
        w = self.waresInfo(waresid=wid)
        wu = self.dbExec(sql='select * from K_WH_SPWARES_WUNITS(?,?) order by WUFACTOR',params=[wid,uid],fetch='one')
        if not backurl: backurl = 'wuWares?id=%s'%(wid)
        return self.drawTemplate(templ=self.wuTmplWaresUnit, data=[w, wu, {'mes':mes, 'backurl':backurl}])
    wuWaresUnit.exposed = True
    
    def wuSet(self, **args):
        params = [args['wid'],args['uid']]
        if 'factor' in args: params.append(args['factor'])
        else: params.append(None)
        if 'w' in args and args['w']: params.append(args['w'])
        else: params.append(None)
        if 'l' in args and args['l']: params.append(args['l'])
        else: params.append(None)
        if 'h' in args and args['h']: params.append(args['h'])
        else: params.append(None)
        if 'c' in args and args['c']: params.append(args['c'])
        else: params.append(None)
        if 'b' in args and args['b']: params.append(args['b'])
        else: params.append(None)
        if 'n' in args and args['n']: params.append(args['n'])
        else: params.append(None)
        if 'mc' in args and args['mc']: params.append(args['mc'])
        else: params.append(None)
        try: self.dbExec(sql='execute procedure K_WH_SPWARES_SETWARESUNIT(?,?,?,?,?,?,?,?,?,?)',params=params,fetch='none')
        except Exception as exc: raise HTTPRedirect('wuWaresUnit?wid=%s&uid=%s&mes=%s' % (args['wid'], args['uid'],
                                                                                          self.fbExcText(exc)))
        raise HTTPRedirect('wuWares?id=%s'%(args['wid']))
    wuSet.exposed = True    
    
    def wuWaresGetUnits(self, wid):
        wid = self.kId(wid)
        w = self.waresInfo(waresid=wid)
        u = self.dbExec(sql='select * from WM_LINKUNITTOWARES(?,Null)',params=[wid],fetch="all")
        return self.drawTemplate(templ=self.wuTmplWaresGetUnits, data=[w, u, {'backurl':'wuWares?id=%s'%(wid), 'treeName':_('Выбор ЕИ')}])
    wuWaresGetUnits.exposed = True

    def wuBarcodes(self,wid,uid,mes=None):
        w = self.waresInfo(waresid=wid)
        u = self.dbExec(sql='select * from K_WH_SPWARES_WUNITS(?,?)',params=[wid,uid],fetch='one')
        wu = self.dbExec(sql='select * from WH_SPWARES_WULISTBARCODES(?,?)',params=[wid,uid],fetch='all')
        return self.drawTemplate(templ=self.wuTmplBarcodes, data=[w, u, wu, {'mes':mes,'backurl':'wuWaresUnit?wid=%s&uid=%s'%(wid,uid),'treeName':_('ШК')}])
    wuBarcodes.exposed = True

    def wuSetBarcodes(self,**args):
        ids = ''
        barcodes = ''
        for i in args:
            if i=='wid':
                wid = args[i]
            elif i == 'uid':
                uid = args[i]
            elif i.find('wbcid') != -1:
                id = i[5:]
                ids = ids + id + ';'
                barcodes = barcodes + args[i] + ';'
        params = [wid,uid,ids,barcodes]
        try: self.dbExec('execute procedure WH_SPWARES_WUSETBARCODES(?,?,?,?)',params,'none')
        except Exception as exc:
            mes= self.fbExcText(exc)
            raise HTTPRedirect('wuBarcodes?wid=%s&uid=%s&mes=%s'%(wid,uid,mes))
        raise HTTPRedirect('wuWaresUnit?wid=%s&uid=%s'%(wid,uid))    
    wuSetBarcodes.exposed = True
    
