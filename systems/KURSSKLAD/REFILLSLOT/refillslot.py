# -*- coding: utf-8 -*-
from systems.KURSSKLAD.common import WHCommon
#from systems.KURSSKLAD.REFILLSLOT.templates.main import main as tmplmain
from systems.KURSSKLAD.REFILLSLOT.templates.wares import wares
from systems.KURSSKLAD.REFILLSLOT.templates.automatic import automatic


class RefillSlot(WHCommon):
    tmplWares = wares
    tmplAutomatic = automatic

    def sspid(self, code):
        return self.dbExec(sql='select sitespeciesid as sspid from SITESPECIES where CODE=?',params=(code,),fetch='one')['sspid']    
    
    def __init__(self):
        self.datef = '%d.%m.%Y'
        self.datetimef = '%d.%m.%Y %H:%M:%S'
        self.roundf = '%.2f'
    
    def index(self):  
        super().index()
        raise self.httpRedirect('wares')
    index.exposed = True
    
    # Заказы
    def wares(self):
        lz = self.listZoneObjects(manid=self.GetKEmployeeID())
        return self.drawTemplate(templ=self.tmplWares, data=[lz,{'OBJID':self.employeeObj()}])
    wares.exposed = True
        
    def qWaresList(self,objid,dbeg,dend):
        return self.dbExec(sql='select * from WH_REFILLSLOT_LISTWARES(?,?,?) order by WCODE',params=[objid,dbeg,dend],fetch='all')
    
    def waresList(self, objid, dbeg, dend):
        try:
            data = self.qWaresList(objid,dbeg,dend)
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data, ext_data={'OBJID':objid,'DBEG':dbeg,'DEND':dend})
    waresList.exposed = True
        
    def qWaresRest(self, objid, wid):
        return self.dbExec(sql='select * from WH_REFILLSLOT_WARESREST(?,?)',params=[objid,wid],fetch='one')
    
    def waresRest(self,objid,wid):
        try:
            data = self.qWaresRest(objid, wid)
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data)
    waresRest.exposed = True
    
    def listWaresDocs(self, objid, waresid, dbeg = None, dend=None):
        try:
            data = self.dbExec(sql='select * from K_REFILLSLOT_LISTWARESDOCS(?,?,?,?)',params=[objid,waresid,dbeg,dend],fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data = data, ext_data = {'WID':waresid})
    listWaresDocs.exposed = True
    
                    
    # Автоматически
    def automatic(self):
        lz = self.listZoneObjects(manid=self.GetKEmployeeID())
        return self.drawTemplate(templ=self.tmplAutomatic, data=[lz,{'OBJID':self.employeeObj()}])
    automatic.exposed = True
                   
    def automaticWares(self, objid, wid=None, wgid=None):
        try: 
            data = self.dbExec(sql="select * from WH_REFILLSLOT_LISTWARESSELOPT(?,?,?)", params=[objid, wid, wgid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=data, ext_data={'WID':wid, 'OBJID':objid})
    automaticWares.exposed = True    
    
    def automaticCalcStatistic(self, objid, wid, dbeg, dend, flags):
        try: 
            self.dbExec(sql="execute procedure WH_REFILLSLOT_RECALCSTATISTIC(?,?,?,?,?,?)", params=[objid, wid, dbeg, dend, flags, self.getUserVar('uid')], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.automaticWares(wid=wid, objid=objid)
    automaticCalcStatistic.exposed = True  
    
    def automaticWaresSelOptSet(self, objid, wid, fld, val):
        if fld == 'waitnull':
            try: 
                self.dbExec(sql="execute procedure WH_SPWARES_SETSELOPT_WAITNULL(?,?,?)", params=[objid, wid, val], fetch='none')
            except Exception as exc:
                return self.pyDumpsExc(exc=exc)
        elif fld == 'enabled':
            try: 
                self.dbExec(sql="execute procedure WH_SPWARES_SETSELOPT_ENABLED(?,?,?)", params=[objid, wid, val], fetch='none')
            except Exception as exc:
                return self.pyDumpsExc(exc=exc)
        elif fld == 'fullpallet':
            try: 
                self.dbExec(sql="execute procedure WH_SPWARES_SETSELOPT_FULLPALLET(?,?,?)", params=[objid, wid, val], fetch='none')
            except Exception as exc:
                return self.pyDumpsExc(exc=exc)
        elif fld == 'slotcontent':
            try:
                self.dbExec(sql="execute procedure WH_SPWARES_SETSELOPT_SLOTCONT(?,?,?)", params=[objid, wid, val], fetch='none')
            except Exception as exc:
                return self.pyDumpsExc(exc=exc)
        elif fld == 'minqhands':
            try: 
                self.dbExec(sql="execute procedure WH_SPWARES_SETSELOPT_MINQHANDS(?,?,?)", params=[objid, wid, val], fetch='none')
            except Exception as exc:
                return self.pyDumpsExc(exc=exc)
        return self.automaticWares(wid=wid, objid=objid)
    automaticWaresSelOptSet.exposed = True  

    def automaticWaresGroup(self, wgid=None):
        data = self.dbExec(sql='select * from K_SP_WARESGROUPS_LISTGROUPS(?) order by NAME',params=[wgid],fetch='all')
        return self.pyDumps(data)
    automaticWaresGroup.exposed = True    
    
    # Формирование заданий
    def qCreateTask(self, objid, waresid):
        self.dbExecC(sql='execute procedure WH_REFILLSLOT_ACTIVATE(?,?)',params=(objid, waresid), fetch='none')
    
    def createTask(self, objid, waresid):
        try: 
            data = self.qCreateTask(objid, waresid)
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.automaticWares(wid=waresid, objid=objid)
    createTask.exposed = True
    
