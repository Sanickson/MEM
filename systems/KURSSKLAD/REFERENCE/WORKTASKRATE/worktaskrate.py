# -*- coding: utf-8 -*-
from systems.KURSSKLAD.REFERENCE.common import RCommon
#from systems.KURSSKLAD.taskInfo import TaskInfo
from systems.KURSSKLAD.ksprav import KSprav

from systems.KURSSKLAD.REFERENCE.WORKTASKRATE.templates.wtrtasktype import wtrtasktype
from systems.KURSSKLAD.REFERENCE.WORKTASKRATE.templates.wtrtasktypezone import wtrtasktypezone
from systems.KURSSKLAD.REFERENCE.WORKTASKRATE.templates.wtrTaskStatistics import wtrTaskStatistics
from systems.KURSSKLAD.REFERENCE.WORKTASKRATE.templates.wtrTaskObjSelGrRate import wtrTaskObjSelGrRate


class WorkTaskRate(RCommon, KSprav):
    # настройки вкладок
    '''
        tabs = {
            'trashSite':'Корзина',
          'trashPallet':'Недоcтача',
                 'rest':'Остатки',
                 'restWares':'Остатки (МП)',
        }
    '''

    tabs = {'tasktypeRate': 'По типам', 'tasktypeZoneRate': 'По типам и зонам', 'taskStatistics': 'Пересчет статистики', 'taskObjSelGrRate': 'По типу, зоне и ГО'}
    tabsSort = ('tasktypeRate', 'tasktypeZoneRate', 'taskObjSelGrRate', 'taskStatistics')

    def index(self, id_system=None):
        RCommon.index(self, id_system)
        return self.tasktypeRate()

    index.exposed = True

    def tasktypeRate(self):
        return self.drawTemplate(templ=wtrtasktype, data=[])

    tasktypeRate.exposed = True

    def qTaskTypeList(self):
        try:
            data = self.dbExecC('select TASKTYPEID AS ID, NAME from WM_TASKTYPE order by NAME', fetch='all', params=[])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    qTaskTypeList.exposed = True

    def ttrQSOne(self, id):
        try:
            data = self.dbExecC('select * from WH_WORKTASKTYPERATE_S_ONE(?)', fetch='one', params=[id])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, formats={'DBEG': '%d.%m.%Y', 'DEND': '%d.%m.%Y'})

    ttrQSOne.exposed = True

    def ttrQList(self, dbeg, dend, ttid=None):
        try:
            data = self.dbExecC('select * from WH_WORKTASKTYPERATE_S(?,?,?)', fetch='all',
                                params=[dbeg, dend, ttid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, formats={'DBEG': '%d.%m.%Y', 'DEND': '%d.%m.%Y'})

    ttrQList.exposed = True

    def coalesce(self, param, val):
        if param:
            return param
        else:
            return val

    def ttrQAdd(self, dbeg, dend, ttid, rateunit, rateunitw, rateweight, ratevolume, ratetask):
        rateunit = self.coalesce(rateunit, 0.000)
        rateunitw = self.coalesce(rateunitw, 0.000)
        rateweight = self.coalesce(rateweight, 0.000)
        ratevolume = self.coalesce(ratevolume, 0.000)
        ratetask = self.coalesce(ratetask, 0.000)
        try:
            data = self.dbExecC('select * from WH_WORKTASKTYPERATE_I(?,?,?,?,?,?,?,?)', fetch='one',
                                params=[ttid, dbeg, dend, rateunit, rateunitw, rateweight, ratevolume, ratetask])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.ttrQSOne(id=data['ID'])

    ttrQAdd.exposed = True

    def ttrQUpd(self, dbeg, dend, ttid, rateunit, rateunitw, rateweight, ratevolume, ratetask, id):
        rateunit = self.coalesce(rateunit, 0.000)
        rateunitw = self.coalesce(rateunitw, 0.000)
        rateweight = self.coalesce(rateweight, 0.000)
        ratevolume = self.coalesce(ratevolume, 0.000)
        ratetask = self.coalesce(ratetask, 0.000)
        try:
            self.dbExecC('execute procedure WH_WORKTASKTYPERATE_U(?,?,?,?,?,?,?,?,?)', fetch='none',
                         params=[ttid, dbeg, dend, rateunit, rateunitw, rateweight, ratevolume, ratetask, id])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.ttrQSOne(id=id)

    ttrQUpd.exposed = True

    def ttrQDel(self, id):
        try:
            self.dbExecC('execute procedure WH_WORKTASKTYPERATE_D(?)', fetch='none', params=[id])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={'ID': id})

    ttrQDel.exposed = True


    def tasktypeZoneRate(self):
        return self.drawTemplate(templ=wtrtasktypezone, data=[])

    tasktypeZoneRate.exposed = True

    def ttorQSOne(self, id):
        try:
            data = self.dbExecC('select * from WH_WORKOBJTASKTYPERATE_S_ONE(?)', fetch='one', params=[id])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, formats={'DBEG': '%d.%m.%Y', 'DEND': '%d.%m.%Y'})

    ttorQSOne.exposed = True

    def ttorQList(self, dbeg, dend, whid=None, ttid=None):
        try:
            data = self.dbExecC('select * from WH_WORKOBJTASKTYPERATE_S(?,?,?,?,?)', fetch='all',
                                params=[self.getUserVar('uid'), dbeg, dend, whid, ttid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, formats={'DBEG': '%d.%m.%Y', 'DEND': '%d.%m.%Y'})

    ttorQList.exposed = True

    def ttorQAdd(self, dbeg, dend, whid, ttid, rateunit, rateunitw, rateweight, ratevolume, ratetask):
        rateunit = self.coalesce(rateunit, 0.000)
        rateunitw = self.coalesce(rateunitw, 0.000)
        rateweight = self.coalesce(rateweight, 0.000)
        ratevolume = self.coalesce(ratevolume, 0.000)
        ratetask = self.coalesce(ratetask, 0.000)
        try:
            data = self.dbExecC('select * from WH_WORKOBJTASKTYPERATE_I(?,?,?,?,?,?,?,?,?)', fetch='one',
                                params=[whid, ttid, dbeg, dend, rateunit, rateunitw, rateweight, ratevolume, ratetask])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.ttorQSOne(id=data['ID'])

    ttorQAdd.exposed = True

    def ttorQUpd(self, dbeg, dend, whid, ttid, rateunit, rateunitw, rateweight, ratevolume, ratetask, id):
        rateunit = self.coalesce(rateunit, 0.000)
        rateunitw = self.coalesce(rateunitw, 0.000)
        rateweight = self.coalesce(rateweight, 0.000)
        ratevolume = self.coalesce(ratevolume, 0.000)
        ratetask = self.coalesce(ratetask, 0.000)
        try:
            self.dbExecC('execute procedure WH_WORKOBJTASKTYPERATE_U(?,?,?,?,?,?,?,?,?,?)', fetch='none',
                         params=[whid, ttid, dbeg, dend, rateunit, rateunitw, rateweight, ratevolume, ratetask, id])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.ttorQSOne(id=id)

    ttorQUpd.exposed = True

    def ttorQDel(self, id):
        try:
            self.dbExecC('execute procedure WH_WORKOBJTASKTYPERATE_D(?)', fetch='none', params=[id])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={'ID': id})

    ttorQDel.exposed = True


    def taskStatistics(self):
        return self.drawTemplate(templ=wtrTaskStatistics, data=[])

    taskStatistics.exposed = True

    def taskStatisticsList(self, dtbeg, dtend, ttid, wid='null'):
        if wid == 'null':
            wid = None
        if ttid == 0:
            ttid = None
        try:
            dl = self.dbExecC('select * from WH_RWORKTASKRATE_STATISTICSLIST(?,?,?,?)', fetch='all',
                              params=[dtbeg, dtend, ttid, wid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=dl)

    taskStatisticsList.exposed = True

    def taskStatisticsCalc(self, tid):
        try:
            t = self.dbExecC('select * from WH_RWORKTASKRATE_STATISTICSCALC(?)', fetch='one', params=[tid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=t, ext_data={'TID': tid})

    taskStatisticsCalc.exposed = True

    def taskStatisticsWares(self, tid):
        try:
            t = self.dbExecC('select * from WH_RWORKTASKRATE_STATISTICSTITL(?)', fetch='one', params=[tid])
            tw = self.dbExecC('select * from WH_RWORKTASKRATE_STATISTICSTW(?)', fetch='all', params=[tid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        ed = {'TID': tid}
        ed['TITLEQUANTITY'] = t['TITLEQUANTITY']
        ed['TITLESCANCOUNT'] = t['TITLESCANCOUNT']
        ed['TITLESUCCESSSCAN'] = t['TITLESUCCESSSCAN']
        ed['TITLESCANQUANT'] = t['TITLESCANQUANT']
        return self.pyDumps(data=tw, ext_data=ed)

    taskStatisticsWares.exposed = True


    def taskObjSelGrRate(self):
        return self.drawTemplate(templ=wtrTaskObjSelGrRate, data=[])

    taskObjSelGrRate.exposed = True

    def qTaskTypeMetList(self):
        try:
            data = self.dbExecC("select tm.methodid as id, tm.tasktypeid as ttid, tm.name as name \
                                from wm_taskmethod tm order by tm.tasktypeid, tm.name", fetch='all', params=[])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    qTaskTypeMetList.exposed = True

    def taskObjSelList(self, dbeg, dend, ttid=None, whid=None, sgid=None):
        try:
            data = self.dbExecC('select * from WH_WORKOBJTASKSEL_ID(?,?,?,?,?)', fetch='all',
                                params=[dbeg, dend,whid, ttid,sgid])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    taskObjSelList.exposed = True

    def taskObjSelInfo(self, id):
        try:
            data = self.dbExecC('select * from WH_WORKOBJTASKSEL_IDINFO(?)', fetch='one',
                                params=[id])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    taskObjSelInfo.exposed = True

    def setTaskObjSel(self, dbeg, dend, whid, ttid, rateunit=None, rateunitw=None, rateweight=None, ratevolume=None, ratetask=None,sgid=None, id=None):
        try:
            data = self.dbExecC('select * from WH_WORKOBJTASKSEL_SET(?,?,?,?,?,?,?,?,?,?,?)', fetch='one',
                         params=[whid, ttid,sgid, dbeg, dend, rateunit, rateunitw, rateweight, ratevolume, ratetask, id])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.taskObjSelInfo(id=data['ID'])

    setTaskObjSel.exposed = True

    def delTaskObjSel(self, id):
        try:
            self.dbExecC('execute procedure WH_WORKOBJTASKSEL_D(?)', fetch='none', params=[id])
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={'ID': id})

    delTaskObjSel.exposed = True
