# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon

from systems.KURSSKLAD.REPORTS.STORAGELIFE.templates.restwithoutstoragelife import restwithoutstoragelife
from systems.KURSSKLAD.REPORTS.STORAGELIFE.templates.badwareslot import badwareslot
from systems.KURSSKLAD.REPORTS.STORAGELIFE.templates.palletbadwareslot import palletbadwareslot
from systems.KURSSKLAD.REPORTS.STORAGELIFE.templates.rotation import rotation
from systems.KURSSKLAD.REPORTS.STORAGELIFE.templates.forecast import forecast


class StorageLife(WHCommon):
    # настройки вкладок

    tabs = {
        'restwithoutstoragelife': '"Остатки без срока годности"',
        'badwareslot': '"За период"',
        'palletbadwareslot': '  "По мультипаллетам"',
        'forecast': '"Прогноз по стоку"',
        'rotation': '"Ротация"'
    }

    tabsSort = ('restwithoutstoragelife', 'badwareslot', 'rotation', 'forecast')


    def index(self, id_system=None):
        super().index(id_system=id_system)
        return self.badwareslot()
    index.exposed = True

    ### Остатки без срока годности
    def restwithoutstoragelife(self):
        return self.drawTemplate(templ=restwithoutstoragelife, data=[])
    restwithoutstoragelife.exposed = True


    def qRestWithoutStorageLife(self, whid):
        try:
            data = self.dbExec(sql="select * from WH_RESTWITHOUTSTORAGELIFE(?)", params=[whid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    qRestWithoutStorageLife.exposed = True


    ### За период
    def badwareslot(self):
        return self.drawTemplate(templ=badwareslot, data=[])
    badwareslot.exposed = True

    def qBadWaresLotData(self, whid, wid, daysbeg, daysend, typepal):
        if daysbeg == "":
            daysbeg = None
        try:
            data = self.dbExec(sql='select * from WH_RBADWARESLOT_DATA(?,?,?,?,?)',
                               params=[whid, wid, daysbeg, daysend, typepal], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'WHID': whid, 'WID': wid})

    qBadWaresLotData.exposed = True


    ### По мультипаллетам - используется только на НВ, нет процедур в БД
    def palletbadwareslot(self):
        return self.drawTemplate(templ=palletbadwareslot, data=[])
    palletbadwareslot.exposed = True

    def qWaresPallet(self, pid):
        try:
            dt = self.dbExec(sql='select * from WH_RBADWARESLOT_PALLET_TRNDATA(?)',
                               params=[pid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=dt, ext_data={'PID': pid})
    qWaresPallet.exposed = True

    ### Ротация
    def rotation(self):
        return self.drawTemplate(templ=rotation, data=[])
    rotation.exposed = True

    def qRotationWaresList(self, whid, sgid=None, wgid=None):
        """ Список товаров у которых остаток в МО позднее, чем есть на МХ """
        try:
            data = self.dbExec(sql="select * from WH_ROTATION_WARESLIST(?,?,?)", params=[whid, sgid, wgid], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            ext_data = {'WHID': whid}
            if sgid:
                ext_data['SGID'] = sgid
            if wgid:
                ext_data['WGID'] = wgid
            return self.pyDumps(data=data, ext_data=ext_data)

    qRotationWaresList.exposed = True


    def qRotationWaresData(self, wid, whid, prdate):
        try:
            lc = self.dbExecC(sql='select * from WH_ROTATION_WARESDATA(?,?,?)', params=[wid, whid, prdate], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=lc, ext_data={'wid': wid})

    qRotationWaresData.exposed = True


    ### Прогноз по стоку
    def forecast(self):
        return self.drawTemplate(templ=forecast, data=[])
    forecast.exposed = True


    def qForecastWaresData(self, whid, wid, bdate, edate):
        try:
            data = self.dbExec(sql='select * from WH_BADWARESLOT_FORECAST(?,?,?,?)',
                params=[wid, whid, bdate, edate], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'WHID': whid, 'WID': wid})

    qForecastWaresData.exposed = True


