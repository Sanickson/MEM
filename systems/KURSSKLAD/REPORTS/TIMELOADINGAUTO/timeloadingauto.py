# -*- coding: utf-8 -*-

from systems.KURSSKLAD.ksprav import KSprav
from systems.KURSSKLAD.REPORTS.TIMELOADINGAUTO.templates.index import index

class TimeLoadingAuto(KSprav):

    def index(self, id_system=None):
        KSprav.index(self, id_system)
        return self.drawTemplate(templ=index, data=[])

    index.exposed = True

    def timeloadingautolist(self, dbeg, dend):
        d = self.dbExec(sql="select * from WH_TIMELOADINGAUTO_LIST(?,?)", params=[dbeg, dend], fetch='all')
        return self.pyDumps(data=d, ext_data={'dbeg': dbeg, 'dend': dend})

    timeloadingautolist.exposed = True

    def timeloadingautoDocs(self, aid, dbeg, dend):
        d = self.dbExec(sql="select * from WH_TIMELOADINGAUTO_DOCS(?,?,?)", params=[aid, dbeg, dend], fetch='all')
        return self.pyDumps(data=d, ext_data={'aid': aid, 'dbeg': dbeg, 'dend': dend})

    timeloadingautoDocs.exposed = True

    def timeloadingautoTasks(self, docid):
        d = self.dbExec(sql="select * from WH_TIMELOADINGAUTO_TASKS(?)", params=[docid], fetch='all')
        return self.pyDumps(data=d, ext_data={'docid': docid})

    timeloadingautoTasks.exposed = True