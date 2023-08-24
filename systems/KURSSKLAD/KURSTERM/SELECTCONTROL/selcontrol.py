# -*- coding: utf-8 -*-

import systems.KURSSKLAD.cheetahutils as chu

from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.index import index
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.man import man
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.palL import palL
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.task import task
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.taskDbl import taskDbl
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.taskEndMail import taskEndMail
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.taskWares import taskWares
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.taskWaresAdd import taskWaresAdd
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.taskWaresAddPrDate import taskWaresAddPrDate
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.taskWaresChange import taskWaresChange
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.taskWaresEgais import taskWaresEgais
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.taskWaresMarkers import taskWaresMarkers
from systems.KURSSKLAD.KURSTERM.SELECTCONTROL.templates.taskRangeWares import taskRangeWares
from systems.KURSSKLAD.KURSTERM.pallet import TCommonPallet


class SelectControl(TCommonPallet):
    tmplPalL = palL

    def index(self, id_system=None):
        super().index()
        return self.main()
    index.exposed = True

    def main(self, mes=None):
        task = self.dbExec(sql='select * from rbs_selcontrol_gettask(?)', params=[self.whSesId()], fetch='one')
        if task['TASKID']:
            raise self.httpRedirect('task?id=%s' % task['TASKID'])
        elif task['MANID']:
            raise self.httpRedirect('man?mid=%s' % task['MANID'])
        else:
            return self.drawTemplate(templ=index, data=[{'mes': mes}])
    main.exposed = True

    def scanMain(self, barcode):
        bcInfo = self.kBarCodeInfo(barcode)
        if bcInfo and bcInfo['result'] == 0:
            if bcInfo['usercode'] == 'PALLET':
                palletInfo = self.palletInfo(bcInfo['recordid'])
                pallet = self.dbExec(sql='select * from pallet p where p.palletid = ?', params=[int(bcInfo['recordid'])], fetch='one')
                if pallet['STATUS2'] == '2' and palletInfo['PTYPECODE'] == 'S':
                    try:
                        raise self.httpRedirect('pal?id=%s' % bcInfo['recordid'])
                    except Exception as exc:
                        raise self.httpRedirect('main?mes=%s' % self.fbExcText(exc))
                else:
                    return self.main(mes=_('С данным паллетом нельзя производить действия в интерфейсе'))
        else:
            bcInfo = self.whBarCodeInfo(barcode=barcode, codes='ENGINEUSER')
            if bcInfo and bcInfo['usercode'] == 'ENGINEUSER':
                m = self.dbExec(sql='select * from WH_USER_GETMAN(?)', params=[bcInfo['RECORDID']], fetch='one')
                if m['MANID']:
                    raise self.httpRedirect('man?mid=%s' % m['MANID'])
                else:
                    return self.drawTemplate(templ=index, data=[{'mes': _('Не установлено физлицо по ШК')}])
                # task = self.dbExec(sql='select * from WH_SELCONTROLDBL_GETTASK(?)',
                #            params=[bcInfo['RECORDID']],
                #            fetch='one')
                # if task['TASKID']:
                #     raise HTTPRedirect('taskSelect?id=%s' % (task['TASKID']))
                # else:
                #     return self.drawTemplate(templ=index, data=[{'mes': 'Не найдено подходящее задание отборки у сотрудника %s' % (bcInfo['TEXTINFO'])}])
        return self.main(mes=_('Ничего не найдено'))
    scanMain.exposed = True

    def man(self, mid, action=None, mes=None):
        if action:
            if action == 'S':
                try:
                    self.dbExec(sql='execute procedure WH_SELCTRL_MANSTART(?,?)',
                                params=[self.whSesId(), mid], fetch='none')
                except Exception as exc:
                    mes = self.fbExcText(exc)
            elif action == 'F':
                try:
                    self.dbExec(sql='execute procedure WH_SELCTRL_MANEND(?,?)',
                                params=[self.whSesId(), mid], fetch='none')
                except Exception as exc:
                    mes = self.fbExcText(exc)
                else:
                    raise self.httpRedirect('main')
            elif action.isdigit():
                try:
                    task = self.dbExec(sql='select * from WH_SELCONTROLDBL_CREATE_TASK(?,?)',
                                       params=[action, self.whSesId()], fetch='one')
                except Exception as exc:
                    mes = self.fbExcText(exc)
                else:
                    raise self.httpRedirect('taskCntrlDbl?id=%s' % task['TASKID'])
        t = self.dbExec(sql='select * from WH_SELCONTROLDBL_GETTASK(?,?)', params=[mid, self.whSesId()], fetch='one')
        return self.drawTemplate(templ=man, data=[t, {'reloadurl': 'man?mid=%s' % mid, 'mes': mes}])
    man.exposed = True

    def pal(self, id, barcode=None, mes=None):
        if barcode:
            try:
                bcInfo = self.dbExec(sql='select * from RBS_SELCONTROL_BCINFO(?)', params=[barcode], fetch='one')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                raise self.httpRedirect('pal?id=%s' % bcInfo['ID'])
        p = self.palQInfo(id)
        pw = self.palQWares(id=id)
        return self.drawTemplate(templ=palL, data=[p, pw, {'mes': mes, 'backurl': 'main'}])
    pal.exposed = True

    def start(self, id):
        try:
            task = self.dbExec(sql='select * from RBS_SELCONTROL_CREATE_TASK(?,?)',
                               params=[id, self.whSesId()], fetch='one')
        except Exception as exc:
            raise self.httpRedirect('pal?id=%s&mes=%s' % (id, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('task?id=%s' % task['TASKID'])
    start.exposed = True

    def taskCntrlDbl(self, id, mes=None):
        id = self.kId(id)
        t = self.dbExec(sql="select * from WH_SELCTRLDBL_TASKINFO(?)",params=[self.kId(id)],fetch='one')
        lw = self.dbExec(sql="select * from WH_SELCONTROLDBL_TASKWARES(?)", params=[id], fetch='all')
        data=[]
        if lw['datalist'] and len(lw['datalist']):
            lw = lw['datalist'][0]
            wT = self.waresType(lw['WID'])
            data = [t, lw,wT, {'tid': id, 'mes': mes}]
        else:
            twend = self.dbExec(sql="select * from WH_SELCONTROLDBL_TWEND(?)", params=[id], fetch='one')
            data = [t, twend, {'tid': id, 'mes': mes}]
        return self.drawTemplate(templ=taskDbl, data=data)
    taskCntrlDbl.exposed = True

    def taskCntrlDblWaresQuant(self, tid, twid, wuid, q, sucnt=None, taraweight=None):
        try:
            self.dbExec(sql="execute procedure WH_SELCONTROLDBL_SAVE(?,?,?,?,?)", fetch='none',
                        params=[twid, wuid, q, sucnt, taraweight])
        except Exception as exc:
            raise self.httpRedirect('taskCntrlDbl?id=%s&mes=%s'
                               % (tid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('taskCntrlDbl?id=%s' % tid)
    taskCntrlDblWaresQuant.exposed = True

    def taskInfo(self, tid):
        return self.dbExec(sql="select * from RBS_SELCONTROL_TASKINFO(?)", params=[tid],
                        fetch='one')

    def task(self, id, mes=None, filter='0'):
        id = self.kId(id)
        t = self.taskInfo(id)
        if t and t['algorithm'] == 'D':
            raise self.httpRedirect('taskCntrlDbl?id=%s' % id)
        lw = self.dbExec(sql="select * from RBS_SELCONTROL_LISTWARES(?)", params=[id], fetch='all')
        return self.drawTemplate(templ=task, data=[t, lw, {'tid': id, 'filter': filter, 'mes': mes}])
    task.exposed = True

    def scanTask(self, id, barcode=None):
        #bcInfo = self.kBarCodeInfo(barcode)
        #if bcInfo and bcInfo['result'] == 0:
        #    if bcInfo['usercode'] == 'WARES':
        #        raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (id, bcInfo['recordid']))
        #    elif bcInfo['usercode'] == 'WARESUNIT':
        #        wu = self.waresUnitInfo(waresunitid=bcInfo['recordid'])
        #        raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (id, wu['wid']))
        #raise self.httpRedirect('task?id=%s&mes=%s' % (id, _('Отсканируйте товар')))
        bcInfo = self.dbExec(sql="select * from WH_SELCTRL_BARCODE_WARESLIST(?,?)", params=[id, barcode], fetch='all')
        if not bcInfo or not bcInfo['datalist'] or len(bcInfo['datalist']) == 0:
            raise self.httpRedirect('task?id=%s&mes=%s' % (id, _('Отсканируйте товар')))
        elif len(bcInfo['datalist']) == 1:
            raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (id, bcInfo['datalist'][0]['WID']))
        else:
            return self.drawTemplate(templ=taskRangeWares,
                                     data=[bcInfo, {'TID': id, 'barcode': barcode, 'backurl': 'task?id=%s' % id}])

    scanTask.exposed = True

    def taskWares(self, tid, wid, mes=None, ar='0'):
        self.dbExec(sql='execute procedure RBS_SELCONTROL_TWCREATE(?,?,?)', fetch='none',
                    params=[tid, wid, self.whSesId()])
        tid = self.kId(tid)
        ti = self.dbExec(sql='select * from wm_task t where t.taskid = ?', params=[tid], fetch='one')
        wid = self.kId(wid)
        wli = self.dbExec(sql="select * from RBS_SELCONTROL_TASKWARESLOTS(?,?)", params=[tid, wid], fetch='all')
        pwi = self.dbExec(sql='select * from WH_PALLETWARES_INFO(?,?,?)',
                          params=[ti['INFOID'], wid, self.whSesId()], fetch='one')

        if pwi['ICTCODE'] == 'EGAIS':
            raise self.httpRedirect('taskWaresEgais?tid=%s&wid=%s' % (tid, wid))
        else:
            if len(wli['datalist']) == 1 and str(ar) == '1':
                d0 = wli['datalist'][0]
                raise self.httpRedirect('taskWaresLot?tid=%s&wid=%s&productdate=%s&docid=%s' %
                                        (tid, wid, chu.TimeStampToDate(d0['productdate']), d0['docid']))
            lw = self.dbExec(sql="select * from RBS_SELCONTROL_LISTWARES(?,?)", params=[tid, wid], fetch='one')
            # if lw['HASMARKERS'] == '1':
            #     return self.taskWaresMarkers(tid=tid, wid=wid, mes=mes)
            t = self.taskInfo(tid)
            w = self.waresInfo(wid)
            wt = self.waresType(wid)
            return self.drawTemplate(templ=taskWares,
                                     data=[t, lw, w, wt, wli, {'tid': tid, 'wid': wid, 'mes': mes}])
    taskWares.exposed = True

    def taskWaresMarkers(self, tid, wid, mes=None, barcode=None, higherid=None):
        if barcode:
            try:
                self.dbExec(sql="execute procedure WH_PALSCTRL_TW_MARKERSCAN(?,?,?,?,?)", fetch='none',
                            params=[tid, wid, self.whSesId(), barcode, higherid])
            except Exception as exc:
                mes = self.fbExcText(exc)
        tid = self.kId(tid)
        wid = self.kId(wid)
        lw = self.dbExec(sql="select * from RBS_SELCONTROL_LISTWARES(?,?)",
                         params=[tid, wid], fetch='one')
        t = self.taskInfo(tid=tid)
        w = self.waresInfo(wid)
        wli = self.dbExec(sql="select * from RBS_SELCONTROL_TASKWARESLOTS(?,?)", params=[tid, wid], fetch='all')
        ll = self.qMarkerLastLockInf(taskid=tid, waresid=wid)
        #wt = self.waresType(wid)
        return self.drawTemplate(templ=taskWaresMarkers,
                                 data=[t, lw, w, wli, {'mes': mes, 'scannedbarcode': ll}])
    taskWaresMarkers.exposed = True


    def taskWaresClear(self, tid, wid):
        url = 'taskWares?tid=%s&wid=%s' % (tid, wid)
        try:
            self.dbExec(sql="execute procedure WH_SELCONTROL_TW_CLEAR(?,?,?)", fetch='none',
                        params=[tid, wid, self.whSesId()])
        except Exception as exc:
            raise self.httpRedirect(url + '&mes=%s' % self.fbExcText(exc))
        else:
            raise self.httpRedirect(url)
    taskWaresClear.exposed = True

    def taskWaresEgais(self, tid, wid, barcode=None, mes=None):
        if barcode:
            try:
                r = self.dbExec(sql='select * from WH_SELCONTROL_EGAIS_SCAN(?,?,?)',
                                params=[tid, wid, barcode], fetch='one')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                if r['RES'] == 'R':
                    mes = _('Вы уже сканировали этот ШК!')
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        wt = self.waresType(wid)
        l = self.dbExec(sql='select * from WH_SELCONTROL_EGAIS_LOTS(?,?)', params=[tid, wid], fetch='all')
        return self.drawTemplate(templ=taskWaresEgais,
                                 data=[t, l, w, wt, {'tid': tid, 'mes': mes}])
    taskWaresEgais.exposed = True

    def taskWaresLot(self, tid, wid, productdate, docid, mes=None):
        self.dbExec(sql='execute procedure RBS_SELCONTROL_TWCREATE(?,?,?)', fetch='none',
                    params=[tid, wid, self.whSesId()])
        tid = self.kId(tid)
        wid = self.kId(wid)
        wli = self.dbExec(sql="select * from RBS_SELCONTROL_TASKWARESLOT(?,?,?,?)",
                          params=[tid, wid, productdate, docid], fetch='all')
        t = self.taskInfo(tid)
        w = self.waresInfo(wid)
        wt = self.waresType(wid)
        return self.drawTemplate(templ=taskWaresChange,
                                 data=[t, w, wt, wli,
                                       {'tid': tid, 'mes': mes, 'backurl': 'taskWares?tid=%s&wid=%s' % (tid, wid)}])

    taskWaresLot.exposed = True

    def taskWaresSave(self, tid, wid, wuid, q, productdate, docid, flag='+'):
        try:
            self.dbExec(sql="execute procedure RBS_SELCONTROL_SAVE(?,?,?,?,?,?)", fetch='none',
                        params=[tid, wuid, q, productdate, docid, flag])
        except Exception as exc:
            raise self.httpRedirect('taskWaresLot?tid=%s&wid=%s&productdate=%s&docid=%s&mes=%s'
                                    % (tid, wid, productdate, docid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))

    taskWaresSave.exposed = True


    def taskWaresEnd(self, tid, wid):
        try:
            self.dbExec(sql="execute procedure WH_TASKWARES_END(?,?)", params=[tid, wid], fetch='none')
        except Exception as exc:
            raise self.httpRedirect('taskWares?tid=%s&wid=%s&mes=%s' % (tid, wid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('task?id=%s' % tid)

    taskWaresEnd.exposed = True

    def taskEnd(self, id, mes=None, flag='0'):
        mails = self.clientConf.selCtrlTaskWaresDiffMails
        mailmes = t = tw = None
        if mails:
            try:
                tw = self.dbExec(sql="select * from WH_RSELCTRL_TASKWARES(?)", params=[id], fetch='all')
            except Exception as exc:
                mes = self.fbExcText(exc)
            else:
                trs = ''
                for r in tw['datalist']:
                    qPlan = float(r['QPLAN']) if r['QPLAN'] else 0
                    qSel = float(r['QSEL']) if r['QSEL'] else 0
                    qChk = float(r['QCHK']) if r['QCHK'] else 0
                    # if qChk != qSel or qChk != qPlan:
                    if qChk != qSel:
                        trs += '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td>' % (r['WCODE'], r['WNAME'], qPlan, qSel, qChk)
                if trs != '':
                    t = self.taskInfo(id)
                    subject = "Контроль %s" % id
                    msg = "Контроль отборки <b>%s</b><br>" % id
                    if t['CLNAME']:
                        msg += "Клиент: <b>%s</b><br>" % t['CLNAME']
                        subject += '->' + t['CLNAME']
                    if t['DNUM']:
                        msg += "Документ: №<b>%s</b> Дата: %s<br>" % (t['DNUM'], chu.TimeStampToDate(t['DDATE']))
                        subject += "(" + chu.TimeStampToDate(t['DDATE']) + ' №' + t['DNUM'] + ")"
                    if t['NUMPALLET']:
                        msg += "Паллет: №<b>%s</b><br>" % t['NUMPALLET']
                    msg += "Сотрудник: <b>%s</b><br>" % self.getUserVar('userfio')
                    msg += "<table border='1' cellpadding='5'>" \
                           "<thead><th>Код</th><th>Наименование</th><th>План</th><th>Отборка</th><th>Проверка</th></tr></thead>"
                    msg += '<tbody>' + trs + '</tbody></table>'
                    mailmes = self.send_email(mails, subject, msg)
        if mes:
            raise self.httpRedirect('task?id=%s&mes=%s' % (id, mes))

        if not mailmes or flag == '1':
            try:
                self.dbExec(sql="execute procedure WH_TASKEND(?,?)", params=[id, self.whSesId()], fetch='none')
            except Exception as exc:
                raise self.httpRedirect('task?id=%s&mes=%s' % (id, self.fbExcText(exc)))
            else:
                if not t:
                    t = self.taskInfo(id)
                if t['MID_SELECT']:
                    #проверяем есть ли ещё у этого отборщика задания
                    raise self.httpRedirect('man?mid=%s' % (t['MID_SELECT']))
                else:
                    raise self.httpRedirect('main')
        if mailmes:
            if not t:
                t = self.taskInfo(id)
            return self.drawTemplate(templ=taskEndMail,
                                     data=[t, tw, {'backurl': 'task?id=%s' % id, 'mes': mes, 'mailmes': mailmes}])
    taskEnd.exposed = True

    def taskWaresAdd(self, tid, wid, wuid=None, productdate=None, amount=None, docid=None):
        wid = self.kId(wid)
        tid = self.kId(tid)
        backurl = 'taskWares?tid=%s&wid=%s' % (tid, wid)
        params = {'backurl': backurl, 'TID': tid}
        if productdate and amount:
            try:
                self.dbExec(sql='execute procedure RBS_SELCONTROL_TWCREATE(?,?,?)', fetch='none',
                            params=[tid, wid, self.whSesId()])
                self.dbExec(sql="execute procedure RBS_SELCONTROL_SAVE(?,?,?,?,?,?)", fetch='none',
                            params=[tid, wuid, amount, productdate, docid, '+'])
            except Exception as exc:
                params['mes'] = self.fbExcText(exc)
            else:
                raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))
        w = self.waresInfo(wid)
        t = self.taskInfo(tid)
        p = self.palQInfo(id=t['PALID'])
        if p['PAL_SID'] is None:
            raise self.httpRedirect('task?tid=%s&mes=%s' % (tid, _('У поддона нет местоположения!')))

        if not productdate or productdate == self.dateMask:
            params['backurl'] = backurl
            return self.drawTemplate(templ=taskWaresAddPrDate, data=[t, w, p, params])
        else:
            params['productdate'] = productdate

        if not wuid:
            if w['VWUID']:
                wuid = w['VWUID']
            else:
                wuid = w['MWUID']
        wu = self.waresUnitInfo(wuid)

        if amount:
            params['amount'] = amount
        else:
            params['amount'] = ''
        params['backurl'] = 'taskWaresAdd?tid=%s&wid=%s&productdate=%s' % (tid, wid, productdate)
        return self.drawTemplate(templ=taskWaresAdd, data=[w, wu, p, params])

    taskWaresAdd.exposed = True

    def taskWaresNull(self, tid, wid):
        self.dbExec(sql='execute procedure RBS_SELCONTROL_TWNULL(?,?,?)', fetch='none',
                    params=[tid, wid, self.whSesId()])
        raise self.httpRedirect('taskWares?tid=%s&wid=%s' % (tid, wid))

    taskWaresNull.exposed = True

    def taskWaresDblSkip(self, tid, twid):
        self.dbExec(sql='execute procedure WH_SELCONTROLDBL_TWSKIP(?,?)', fetch='none',
                    params=[tid, twid])
        raise self.httpRedirect('taskCntrlDbl?id=%s' % tid)

    taskWaresDblSkip.exposed = True