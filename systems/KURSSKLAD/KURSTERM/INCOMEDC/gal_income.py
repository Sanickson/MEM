# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.INCOMEDC.income import TIncome

class TIncomeGAL(TIncome):

    chkIncomeTerm = False
    titleTaskWaresPrDates = False
    urlTaskPrinter = 'taskSGPrinter'

    def defaultProductDate(self):
        return self.GetCurDate(shortYear=True)

    def qTaskWaresStartChk(self, tid, wid):
        return {'ERR_TYPE': None}

    def taskWaresNoSelGroup(self, tid, **args):
        w = args['w'] = self.qTaskWaresNoSelGroup(tid=tid)
        args['backurl'] = 'main' if len(w['datalist']) > 0 else 'task?tid=%s' % tid
        return super().taskWaresNoSelGroup(tid=tid, **args)

    taskWaresNoSelGroup.exposed = True
