# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.INCOMEDC.income import TIncome

class TIncomeUSR(TIncome):

    chkIncomeTerm = False
    titleTaskWaresPrDates = False
    urlTaskPrinter = 'taskSGPrinter'

    def defaultProductDate(self):
        return self.GetCurDate(shortYear=True)

    def qTaskWaresStartChk(self, tid, wid):
        return {'ERR_TYPE': None}

    def task(self, tid, **args):
        w=self.qTaskWaresNoSelGroup(tid=tid)
        if len(w['datalist']) > 0:
            return self.taskWaresNoSelGroup(tid=tid, w=w)
        return super().task(tid=tid, **args)

    task.exposed = True

    def taskWaresNoSelGroup(self, tid, **args):
        w = args['w'] = self.qTaskWaresNoSelGroup(tid=tid)
        args['backurl'] = 'main' if len(w['datalist']) > 0 else 'task?tid=%s' % tid
        return super().taskWaresNoSelGroup(tid=tid, **args)

    taskWaresNoSelGroup.exposed = True

    def taskWaresSelGroup(self, tid, wid, **args):
        backurl = 'taskWaresNoSelGroup?tid=%s' % tid
        args['href'] = 'taskWaresSelGroup?tid=%s&wid=%s&sgid=' % (tid, wid)
        return self.whWaresSelGroup(waresid=wid, backurl=backurl, **args)

    taskWaresSelGroup.exposed = True