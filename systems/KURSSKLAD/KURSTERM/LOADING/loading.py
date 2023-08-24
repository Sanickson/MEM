# -*- coding: utf-8 -*-
from log import logSet, logGet, logWrite
from systems.KURSSKLAD.KURSTERM.common import TCommonTerm

from systems.KURSSKLAD.KURSTERM.LOADING.templates.index import index
from systems.KURSSKLAD.KURSTERM.LOADING.templates.startLoading import startLoading
from systems.KURSSKLAD.KURSTERM.LOADING.templates.task import task
from systems.KURSSKLAD.KURSTERM.LOADING.templates.taskPallet import taskPallet
from systems.KURSSKLAD.KURSTERM.LOADING.templates.taskEnd import taskEnd

class Loading(TCommonTerm):

    tmplMain = index
    tmplStartLoading = startLoading
    tmplTask = task
    tmplTaskPallet = taskPallet
    tmplTaskEnd = taskEnd

    def index(self, id_system=None):
        super().index()
        return self.main()
    index.exposed = True 

    def main(self, mes=None):
        wmsid = self.whSesId()
        try:
            taskList = self.dbExec(sql="select * from WH_LOADING_TASKLIST(?)", params=[wmsid], fetch="all")
        except Exception as exc:
            raise self.httpRedirect('main?mes=%s' % self.fbExcText(exc))
        else:
            return self.drawTemplate(templ=self.tmplMain, data=[taskList, {'mes':mes}])
    main.exposed = True

    def gateInfo(self):
        return self.dbExec(sql="select * from WH_LOADING_GATELIST", fetch="all")

    def taskInfo(self, tid):
        return self.dbExec(sql="select * from WH_LOADING_TASKINFO(?)", params=[tid], fetch="one")

    def task(self, sid=None, tid=None, mes=None):
        backurl = 'main'
        wmsid = self.whSesId()
        task = self.taskInfo(tid)
        if not task['TASKID']:
            try:
                taskid = self.dbExec(sql="execute procedure WH_LOADING_CREATETASK(?,?)", params=[sid, wmsid], fetch="one")
                task = self.taskInfo(taskid['TID'])
                tid = taskid['TID']
            except Exception as exc:
                raise self.httpRedirect('startLoading?mes=%s' % self.fbExcText(exc))
            else:
                backurl = 'startLoading'
        p = self.dbExec(sql="select * from WH_LOADING_PALLETLIST(?)", params=[tid], fetch="all")

        return self.drawTemplate(templ=self.tmplTask, data=[task, p, {'mes': mes, 'backurl': backurl}])
    task.exposed = True

    def taskPallet(self, tid, barcode=None, mes=None):
        if barcode:
            mes = _('Не верный ШК')
            bcInfo = self.kBarCodeInfo(barcode)
            if bcInfo['result'] == 0:
                if bcInfo['usercode'] == 'PALLET':
                    try:
                        p = self.dbExec(sql="select * from WH_LOADING_PALLETINFO(?)", params=[int(bcInfo['recordid'])], fetch='one')
                    except Exception as exc:
                        raise self.httpRedirect('task?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
                    else:
                        mes = _('Паллет не найден')
                        if p['PNUMBER']:
                            t = self.taskInfo(tid)
                            mes = None
                            return self.drawTemplate(templ=self.tmplTaskPallet, data=[p, t, {'mes': mes, 'backurl':'task?tid=%s' % tid}])
            else:
                mes = bcInfo['mes']
        raise self.httpRedirect('task?tid=%s&mes=%s' % (tid, mes))
    taskPallet.exposed = True

    def taskPalletCreate(self, tid=None, pid=None):
        wmsid = self.whSesId()
        try:
            self.dbExec(sql="execute procedure WH_LOADING_PALLETTASK(?,?,?)", params=[tid, pid, wmsid], fetch="none")
        except Exception as exc:
            raise self.httpRedirect('task?&tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('task?&tid=%s' % (tid))

    taskPalletCreate.exposed = True

    def taskSetPallet(self, tid):
        t = self.taskInfo(tid)
        return self.drawTemplate(templ=self.tmplTaskEnd, data=[t, {'backurl':'task?tid=%s' % tid}])
    taskSetPallet.exposed = True

    def taskEnd(self, tid, palcount):
        try:
            self.dbExec(sql="execute procedure WH_LOADING_TASKEND(?,?)", params=[tid, palcount], fetch="none")
        except Exception as exc:
            raise self.httpRedirect('task?tid=%s&mes=%s' % (tid, self.fbExcText(exc)))
        else:
            raise self.httpRedirect('main')
    taskEnd.exposed = True
    
    def startLoading(self, mes=None):
        data = self.gateInfo()
        return self.drawTemplate(templ=self.tmplStartLoading, data=[data, {'mes':mes, 'backurl':'main'}])
    startLoading.exposed = True














