# -*- coding: utf-8 -*-
from systems.KURSSKLAD.ksprav import KSprav
from systems.KURSSKLAD.REPORTS.SELCONTROL.templates.main import main as tmplmain

class SelControl(KSprav):

    def index(self, id_system=None):
        super().index(id_system=id_system)
        self.setIfaceVar('manid', self.GetKEmployeeID())
        return self.drawTemplate(templ=tmplmain, data=[])

    index.exposed = True

    def getSelectUsers(self):
        return self.pyDumps(self.getUsers('TSelect'))
    getSelectUsers.exposed = True

    def getControlUsers(self):
        return self.pyDumps(self.getUsers('SelectControl'))
    getControlUsers.exposed = True

    def getUsers(self, system_class):
        return self.dbExec(sql='select su.* \
                                  from ENGINE_SYSTEMS es \
                                  left join ENGINE_GET_SYSTEM_USERS(es.ID_SYSTEM) su on 1=1 \
                                 where es.class_name = ?',
                           params=[system_class],
                           id_system=-1)

    def getAlgorithm(self):
        return self.pyDumps(data=self.dbExec(sql='select * from WH_SELCONTROL_TASKMETHOD', params=[]))
    getAlgorithm.exposed = True


    def master(self, dbeg, dend,algorithm, fromobj=None, select=None, control=None):
        return self.pyDumps(data=self.dbExec(sql='select * from WH_SELCONTROL_MASTER(?,?,?,?,?,?)',
                                             params=[dbeg, dend, self.cStrE(fromobj), self.cInt(select),
                                                     self.cInt(control),algorithm]))
    master.exposed = True


    def detail(self, dbeg, dend, objid,algorithm,  fromobj=None, select=None, control=None):
        return self.pyDumps(data=self.dbExec(sql='select * from WH_SELCONTROL_DETAIL(?,?,?,?,?,?,?)',
                                             params=[dbeg, dend, self.cStrE(fromobj), self.cInt(select),
                                                     self.cInt(control), objid,algorithm]))
    detail.exposed = True

    def task(self, taskid):
        try:
            data = self.dbExec(sql="SELECT * from WH_RSELCTRL_TASKWARES(?)", params=[taskid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=data)
    task.exposed = True

    # def listObjects(self, incname):
    #     return self.pyDumps(data=super().listObjectsC(objtypes='C', namemask=incname))
    #
    # listObjects.exposed = True

    def getObjects(self):
        return self.pyDumps(data=self.listZoneObjects(self.getIfaceVar('manid')),
                            ext_data={'curzone': self.employeeObj(self.getIfaceVar('manid'))})

    getObjects.exposed = True

    # def listObjects(self, catid=None, incname=None):
    #     return self.pyDumps(
    #         super().listObjects(fields="lo.OBJID,lo.NAME", objtypes='C,D', objstatuses=None, catid=catid,
    #                              namemask=incname, sqladd='order by lo.name'))
    #
    # listObjects.exposed = True

    def report(self, dbeg, dend, fromobj=None, toobj=None, wid=None):
        return self.pyDumps(data=self.dbExec(sql='select * from WH_SELCONTROL_REPORT(?,?,?,?,?)',
                                             params=[dbeg, dend, self.cStrE(fromobj), self.cInt(toobj), self.cInt(wid)]))
    report.exposed = True
