# -*- coding: utf-8 -*-
# ver. 1.0.1
from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.ksprav import KSprav
from systems.KURSSKLAD.REFERENCE.SHOPS.templates.main import main as tmplmain
from systems.KURSSKLAD.REFERENCE.SHOPS.templates.clients import clients
from systems.KURSSKLAD.REFERENCE.SHOPS.templates.newclients import newclients

import db


class Shops(KSprav):
    # настройки вкладок

    tabs = {
        'clients': '"Настройки"',
        'newclients': '  "Клиенты без настроек"'
    }

    tabsSort = ('newclients', 'clients')

    def index(self, id_system=None):
        WHCommon.index(self, id_system)
        return self.newclients()
    index.exposed = True

    def clients(self):
        return self.drawTemplate(templ=clients, data=[])
    clients.exposed = True

    def newclients(self):
        return self.drawTemplate(templ=newclients, data=[])
    newclients.exposed = True

    def listObjects(self, incname=None):
        return self.pyDumps(
            WHCommon.listObjects(self, fields="lo.OBJID,lo.NAME", objtypes='C,D', objstatuses=None,
                                 namemask=incname, sqladd='order by lo.name'))

    listObjects.exposed = True

    def getClientTypes(self):
        return self.pyDumps(self.dbExec(
            sql="SELECT * FROM client_type",
            params=[], fetch='all'))

    getClientTypes.exposed = True

    def getBrand(self, whid):
        return self.pyDumps(self.dbExec(
            sql="SELECT * FROM BRAND_SEL(?)",
            params=[whid], fetch='all'))
    getBrand.exposed = True

    def qShop(self, objid=None, higherid=None, status=None):
        if objid == 'None':
            objid = None
        if higherid == 'None':
            higherid = None
        try:
            dg = self.dbExec(sql='select * from WH_CLIENTSLIST(?,NULL,Null,?) order by status desc, toname', params=[objid,status], fetch='all')
            wh = self.dbExec(sql='select first 1 * from RBS_WH_GETOBJ', params=[], fetch='one')


        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=dg,ext_data={'WHID': wh['OBJID']})

    qShop.exposed = True

    def qRegionList(self, id=None):
        return self.pyDumps(self.dbExec( sql="SELECT * FROM WH_REGION(?)",params = [id], fetch = 'all'))
    qRegionList.exposed = True

    def qNewClients(self, whid):
        try:
            dg = self.dbExecC(sql='select * from WH_NEW_CLIENTSLIST(?) order by toname', params=[whid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=dg,ext_data={'WHID': whid})

    qNewClients.exposed = True

    def qAddressCl(self, objid):
        try:
            dg = self.dbExecC(sql='select * from WH_OBJECT_ADDRESS(?)', params=[objid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        return self.pyDumps(data=dg,ext_data={'OBJID': objid})
    qAddressCl.exposed = True

    def setClient(self, objid,
                  clienttypeid=None, brandid=None, routel=None, email=None, entityid=None, prntclienttypeid=None,
                  higherid=None, region=None, waresid=None, trnpriority=None, raddress=None, address=None,
                  palselvolume=None,  palselweight=None, selectSeparator=None, objname=None):
        'Изменение настроек магазина'
        if higherid == '':
            higherid = None
        if email == '':
            email = None
        if brandid == "":
            brandid = None
        if clienttypeid == "":
            clienttypeid = None
        if (entityid == 'None' or entityid == ""):
            entityid = None
        if region == "":
            region = None
        if trnpriority == "" or str(trnpriority) == '0':
            trnpriority = None
        """if palselvolume == "" or int(palselvolume) == 0:
            palselvolume = None
        if palselweight == "" or int(palselweight) == 0:
            palselweight = None"""
        palselvolume = None
        palselweight = None
        if selectSeparator == "":
            selectSeparator = None
        if objname == "":
            objname = None

        try:
            self.dbExecC(sql='execute procedure WH_CLIENT_SET_OPTIONS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                        params=[objid, higherid, clienttypeid, brandid, prntclienttypeid, entityid, routel, email,
                                region, waresid, trnpriority, raddress, address,
                                selectSeparator, palselvolume, palselweight, objname],
                        fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.qShop(objid, higherid )
    setClient.exposed = True

    def setEmailClient (self, objid, email=None):
        'Изменение почты магазина'
        if email == '':
            email = None
        try:
            self.dbExec(sql='execute procedure WH_CLIENT_SET_EMAIL(?,?) ',
                        params=[objid, email],
                        fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.qShop(objid )
    setEmailClient.exposed = True


    def setWaresClient (self, clientid, waresid):
        'Изменение привязки товара к магазину'
        try:
            self.dbExec(sql='execute procedure WH_CLIENT_SET_WARES(?,?) ',
                        params=[clientid, waresid],
                        fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.qShop(clientid)
    setWaresClient.exposed = True


    def setAddressClient (self, objid, address, raddress, entityId=None):
        'Изменение привязки товара к магазину'
        if entityId == '':
            entityId = None
        try:
            self.dbExecC(sql='execute procedure WH_CLIENT_SET_ADDRESS(?,?,?,?) ',
                        params=[objid, address, raddress, entityId],
                        fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.qShop(objid)
    setAddressClient.exposed = True

    def setPriorityClient (self, objid, priority=None):
        if str(priority) == '0' or priority == '':
            priority = None
        try:
            self.dbExecC(sql='execute procedure WH_CLIENT_SET_PRIORITY(?,?) ',
                        params=[objid, priority],
                        fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.qShop(objid)
    setPriorityClient.exposed = True

    def statusUpdClient (self, objid,status):
        try:
            self.dbExec(sql='execute procedure WH_CLIENT_STATUSUPD(?,?) ',
                        params=[objid, status],
                        fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.qShop(objid)
    statusUpdClient.exposed = True

    def cfgQPblList(self, clientid, smid=None):
        try:
            d = self.dbExec(sql='select * from CFG_CLIENTPBL_SMLIST(?,?)', params=[clientid, smid], fetch='all')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.pyDumps(data=d, ext_data={'CLID': clientid})
    cfgQPblList.exposed = True

    def cfgQPblSet(self, clientid, smid, flag=None):
        try:
            self.dbExec(sql='execute procedure CFG_CLIENTPBL_SET(?,?,?)', params=[clientid, smid, flag], fetch='none')
        except Exception as exc:
            return self.pyDumpsExc(exc=exc)
        else:
            return self.cfgQPblList(clientid=clientid, smid=smid)
    cfgQPblSet.exposed = True


