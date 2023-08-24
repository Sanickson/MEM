# -*- coding: utf-8 -*-

from systems.KURSSKLAD.KURSTERM.pallet import TCommonPallet

from systems.KURSSKLAD.KURSTERM.WARESTOBUYER.templates.index import index
from systems.KURSSKLAD.KURSTERM.WARESTOBUYER.templates.doc import doc
from systems.KURSSKLAD.KURSTERM.WARESTOBUYER.templates.auto import auto
from systems.KURSSKLAD.KURSTERM.WARESTOBUYER.templates.palS import palS


class TWaresToBuyer(TCommonPallet):
    helpSystem = False
    tmplPalS = palS

    # настройки для работы с паллетом
    def index(self, id_system=None):
        super().index()
        return self.main()

    index.exposed = True

    def main(self, mes=None):
        ld = self.dbExec(sql='select * from WH_TWARESTOBUYER_DOCS', params=[], fetch='all')
        la = self.dbExec(sql='select * from WH_TWARESTOBUYER_LISTAUTO', params=[], fetch='all')
        return self.drawTemplate(templ=index, data=[ld, {'mes': mes, 'reloadurl': 'main', 'listauto': la['datalist']}])
    main.exposed = True

    def doc(self, docid, mes=None):
        d = self.dbExec(sql='select * from WH_TWARESTOBUYER_DOCS(?)', params=[docid], fetch='one')
        dl = self.dbExec(sql='select * from WH_TWARESTOBUYER_DOC_TASKES(?)', params=[docid], fetch='all')
        return self.drawTemplate(templ=doc, data=[d, dl, {'mes': mes, 'reloadurl': 'doc?docid=%s' % docid, 'backurl': 'main'}])
    doc.exposed = True

    def auto(self, tid, mes=None):
        a = self.dbExec(sql='select * from WH_TWARESTOBUYER_LISTAUTO(?)', params=[tid], fetch='one')
        t = self.dbExec(sql='select * from WH_TWARESTOBUYER_AUTO_TASKES(?)', params=[tid], fetch='all')
        return self.drawTemplate(templ=auto, data=[a, t, {'mes': mes, 'reloadurl': 'auto?tid=%s' % tid, 'backurl': 'main'}])
    auto.exposed = True

    def scan(self, barcode, **args):
        try:
            bcInfo = self.dbExec(sql='select * from WH_WARESTOBUYER_BCINFO(?)', params=[barcode], fetch='one')
        except Exception as exc:
            exctext = self.fbExcText(exc)
            if 'docid' in args:
                raise self.httpRedirect('doc?docid=%s&mes=%s' % (args['docid'], exctext))
            elif 'taskid' in args:
                raise self.httpRedirect('auto?tid=%s&mes=%s' % (args['taskid'], exctext))
            else:
                raise self.httpRedirect('main?mes=%s' % exctext)
        else:
            if 'docid' in args:
                raise self.httpRedirect('pal?id=%s&docid=%s' % (bcInfo['id'], args['docid']))
            elif 'taskid' in args:
                raise self.httpRedirect('pal?id=%s&taskid=%s' % (bcInfo['id'], args['taskid']))
            else:
                raise self.httpRedirect('pal?id=%s' % bcInfo['id'])
    scan.exposed = True

    def palToHands(self, pid, **args):
        try:
            self.dbExec(sql='execute procedure WH_WARESTOBUYER_PALEND(?,?)', params=[pid, self.whSesId()], fetch='none')
        except Exception as exc:
            exctext = self.fbExcText(exc)
            if 'docid' in args:
                raise self.httpRedirect('pal?id=%s&docid=%s&mes=%s' % (pid, args['docid'], exctext))
            elif 'taskid' in args:
                raise self.httpRedirect('pal?id=%s&taskid=%s&mes=%s' % (pid, args['taskid'], exctext))
            else:
                raise self.httpRedirect('pal?id=%s&mes=%s' % (pid, exctext))
        else:
            if 'docid' in args:
                raise self.httpRedirect('docid?id=%s' % args['docid'])
            elif 'taskid' in args:
                raise self.httpRedirect('auto?tid=%s' % args['taskid'])
            else:
                raise self.httpRedirect('main')
    palToHands.exposed = True

    def pal(self, id, **args):
        if 'docid' in args:
            args['backurl'] = 'doc?docid=%s' % args['docid']
        elif 'taskid' in args:
            args['backurl'] = 'auto?tid=%s' % args['taskid']
        return super().pal(id=id, **args)
    pal.exposed = True