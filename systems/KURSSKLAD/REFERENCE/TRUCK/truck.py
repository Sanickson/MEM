# -*- coding: cp1251 -*-
from systems.KURSSKLAD.common import WHCommon

from systems.KURSSKLAD.REFERENCE.TRUCK.templates.main import main
from systems.KURSSKLAD.REFERENCE.TRUCK.templates.index import index
from systems.KURSSKLAD.REFERENCE.TRUCK.templates.truck import truck
from systems.KURSSKLAD.REFERENCE.TRUCK.templates.cars import cars

class Truck(WHCommon):
    tabs = {'truck': 'Водители', 'index': 'Транспортные компании', 'cars': 'Автомобили'}
    tabsSort = ('index', 'truck', 'cars')

    def index(self, id_system=None):
        WHCommon.index(self, id_system)
        return self.drawTemplate(templ=index, data=[])
    index.exposed = True

    def truck(self):
        return self.drawTemplate(templ=truck, data=[])
    truck.exposed = True

    def cars(self):
        return self.drawTemplate(templ=cars, data=[])
    cars.exposed = True

    def listTruck(self, truckid=None):
        try: data = self.dbExec(sql="select * from TRUCK_LIST(?)", params=[truckid], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listTruck.exposed = True


    def listAddress(self, nametruck=None):
        try: data = self.dbExecC(sql="select DISTINCT o.priintdata from object o where o.descript containing (?)", params=[nametruck], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listAddress.exposed = True

    def listTypeOwnerSh(self):
        try: data = self.dbExec(sql="select * from TYPE_OWNERSHIP", params=[], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listTypeOwnerSh.exposed = True

    def cngTruck(self, **kwargs):
        if not kwargs['truckid']: kwargs['truckid'] = None
        if not kwargs['name']: kwargs['name'] = None
        if not kwargs['status']: kwargs['status'] = None
        if not kwargs['address']: kwargs['address'] = None
        if not kwargs['type']: kwargs['type'] = None
        if not kwargs['contract']: kwargs['contract'] = None
        if not kwargs['guid']: kwargs['guid'] = None
        params = [kwargs['truckid'], kwargs['name'], kwargs['status'], kwargs['address'], kwargs['type'], kwargs['contract'], kwargs['guid']]
        try: data = self.dbExecC(sql="select * from TRUCK_CNG(?,?,?,?,?,?,?)", params=params, fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listTruck(data['ID'])
    cngTruck.exposed = True

    def cngTruckGUID(self, **kwargs):
        params = [kwargs['truckid'], kwargs['guid']]
        try:
            data = self.dbExecC(sql="select * from WH_TRUCK_GUIDCNG(?,?)", params=params, fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listTruck(data['ID'])
    cngTruckGUID.exposed = True

    def delTruck(self, **kwargs):
        try: self.dbExec(sql="execute procedure TRUCK_DEL(?)", params=[kwargs['truckid']], fetch="none")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={"TRUCKID": kwargs['truckid']})
    delTruck.exposed = True

    def listDrivers(self, driverid=None, truckid=None):
        try: data = self.dbExecC(sql="select * from TRUCKDRIVER_LIST(?,?)", params=[driverid, truckid], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data, ext_data={"DRIVERID": driverid, "TRUCKID": truckid})
    listDrivers.exposed = True

    def cngDriver(self, **kwargs):
        if not kwargs['driverid']: kwargs['driverid'] = None
        if not kwargs['fio']: kwargs['fio'] = None
        if not kwargs['phone']: kwargs['phone'] = None
        if not kwargs['truckid']: kwargs['truckid'] = None

        params = [kwargs['driverid'], kwargs['fio'], kwargs['phone'], kwargs['truckid']]
        try: data = self.dbExecC(sql="select * from TRUCKDRIVER_CNG(?,?,?,?)", params=params, fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listDrivers(data['ID'])
    cngDriver.exposed = True

    def delDriver(self, **kwargs):
        try: self.dbExec(sql="execute procedure TRUCKDRIVER_DEL(?)", params=[kwargs['driverid']], fetch="none")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={"DRIVERID": kwargs['driverid']})
    delDriver.exposed = True



    def listCars(self, carid=None):
        try: data = self.dbExec(sql="select * from CARS_LIST(?)", params=[carid], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listCars.exposed = True

    def listTypeCar(self):
        try: data = self.dbExecC(sql="select * from CARTYPES", params=[], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listTypeCar.exposed = True

    def listKindCar(self):
        try: data = self.dbExecC(sql="select * from CAR_KIND", params=[], fetch="all")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    listKindCar.exposed = True


    def cngCar(self, **kwargs):
        if not kwargs['carid']: kwargs['carid'] = None
        if not kwargs['carname']: kwargs['carname'] = None
        if not kwargs['license']: kwargs['license'] = None
        if not kwargs['typecar']: kwargs['typecar'] = None
        if not kwargs['carrying']: kwargs['carrying'] = None
        if not kwargs['capacity']: kwargs['capacity'] = None
        if not kwargs['kind']: kwargs['kind'] = None
        if not kwargs['truckid']: kwargs['truckid'] = None
        if not kwargs['type']: kwargs['type'] = None
        if not kwargs['capacitypal']: kwargs['capacitypal'] = None

        params = [kwargs['carid'], kwargs['carname'], kwargs['license'], kwargs['typecar'],
                  kwargs['carrying'], kwargs['capacity'], kwargs['kind'],
                  kwargs['truckid'], kwargs['type'], kwargs['capacitypal']]
        try: data = self.dbExecC(sql="select * from CAR_CNG(?,?,?,?,?,?,?,?,?,?)", params=params, fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listCars(data['ID'])
    cngCar.exposed = True


    def cngCarGUID(self, **kwargs):
        params = [kwargs['carid'], kwargs['guid']]
        try: data = self.dbExecC(sql="select * from WH_CAR_GUIDCNG(?,?)", params=params, fetch="one")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.listCars(data['ID'])
    cngCarGUID.exposed = True

    def delCar(self, **kwargs):
        try: self.dbExec(sql="execute procedure CAR_DEL(?)", params=[kwargs['carid']], fetch="none")
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(ext_data={"CARID": kwargs['carid']})
    delCar.exposed = True