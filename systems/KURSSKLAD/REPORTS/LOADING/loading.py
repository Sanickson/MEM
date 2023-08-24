# -*- coding: utf-8 -*-

from systems.KURSSKLAD.TASKMANAGER.taskmanagerview import TaskManagerView
from systems.KURSSKLAD.REPORTS.LOADING.templates.index import index
from systems.KURSSKLAD.REPORTS.LOADING.templates.waresWaybill import waresWaybill
from systems.KURSSKLAD.REFERENCE.TRUCK.truck import Truck

class Loading(TaskManagerView, Truck):

    tmplIndex = index
    tmplWaresWaybill = waresWaybill

    def index(self, id_system=None):
        TaskManagerView.index(self, id_system)
        return self.drawTemplate(templ=self.tmplIndex, data=[])

    index.exposed = True

    def getLoadingTaskList(self, dbeg, dend):
        try:
            data = self.dbExec('select * from WH_LOADING_GET_TASKLIST(?,?)', params=[dbeg, dend], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data, ext_data={'dbeg': dbeg, 'dend': dend})

    getLoadingTaskList.exposed = True

    def getLoadingPalletList(self, tid):
        try:
            data = self.dbExec('select * from WH_LOADING_GET_PALLETLIST(?)', params=[tid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data, ext_data={'tid': tid})

    getLoadingPalletList.exposed = True

    def waresWaybill(self, taskid, cid):
        return self.drawTemplate(templ=self.tmplWaresWaybill, data=[{'TASKID': taskid, 'CID': cid}])

    waresWaybill.exposed = True

    def getAutoInfo(self):
        try:
            data = self.dbExec('select * from WH_LOADING_WB_AUTOINFO', fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data)

    getAutoInfo.exposed = True

    def listCarsLic(self, license=None):
        try:
            data = self.dbExecC(sql="select  * from CARS_LIST(?,?)", params=[None, license], fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={'LICENSE': license})

    listCarsLic.exposed = True

    def listNumTrailer(self, **kwargs):
        if not kwargs['truckid']: kwargs['truckid'] = None
        if not kwargs['type']: kwargs['type'] = None
        params = [kwargs['truckid'], kwargs['type']]
        try:
            data = self.dbExecC(sql="select * from CARS_TRUCK(?,?)", params=params, fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    listNumTrailer.exposed = True

    def listGates(self, taskid):
        taskid=None
        try:
            data = self.dbExec(sql="select * from GATE_LIST(?)", params=[taskid], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    listGates.exposed = True

    def cngTrailer(self, license, carrying, capacity, type, truckid, capacitypal, carid=None):
        params = [carid, None, license, None, carrying, capacity, None, truckid, type, capacitypal]
        try:
            data = self.dbExecC(sql="select * from CAR_CNG(?,?,?,?,?,?,?,?,?,?)", params=params, fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listCars(data['ID'])

    cngTrailer.exposed = True

    def taskAuto(self, taskid, driverid, carid, trailerid, truckid, numstump):
        if not driverid: driverid = None
        if not carid: carid = None
        if not trailerid: trailerid = None
        if not truckid: truckid = None
        if not numstump: numstump = None
        #if not kwargs['numstump']: kwargs['numstump'] = None
        try:
            self.dbExec(sql="execute procedure WH_LOADING_TASKAUTO(?,?,?,?,?,?)", params=[taskid, driverid, carid, trailerid, truckid, numstump], fetch="none")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={'taskid':taskid, 'driverid':driverid, 'carid':carid, 'trailerid':trailerid, 'truckid':truckid})
    taskAuto.exposed = True

    def reloadTaskInfo(self, taskid):
        try:
            data = self.dbExec(sql="select * from WH_LOADING_GET_TASKINFO(?)", params=[taskid], fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    reloadTaskInfo.exposed = True

    def whRouteInfo(self, taskid):
        try:
            data = self.dbExec(sql="select * from WH_LOADING_WB_ROUTEINFO(?)", params=[taskid], fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    whRouteInfo.exposed = True

    def pWaresInfo(self, tid, cid):
        try:
            data = self.dbExec(sql="select * from WH_LOADING_WB_PALLETINFO(?,?)", params=[tid, cid], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)

    pWaresInfo.exposed = True

    def listCarsMask(self):
        try:
            data = self.dbExec(sql="select * from WH_LOADING_CARSMASKLIST", fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listCarsMask.exposed = True

