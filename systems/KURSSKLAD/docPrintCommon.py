# -*- coding: utf-8 -*-
import datetime_utils as dtu
from systems.KURSSKLAD.cheetahutils import TimeStampToDate
from systems.KURSSKLAD.common import WHCommon
from systems.KURSSKLAD.DOCPRINT.templates.docPrint import docPrint as docPrintTMPL
class TDocPrintCommon(WHCommon):
    rnd = 4
    amt = 3
    
    def NormalizeStr (self, line):
        if line:
          pos=line.find('.')
          if pos == -1: pos=line.find(',')
          if pos == -1: return line
          else: line = line[:pos]
          return line
        else: return ''      

    def GetCompanyInfo(self, objid=None, Prefix=None):
        dic={}
        if Prefix is None: Prefix=''
        if objid:
            res=self.dbExec(sql='select * from WM_GET_COMPANYINFO(?)',
              params=(objid,),
              fetch='one')
            dic = {Prefix+'CompanyName':res['NAME'], Prefix+'OKPO':res['OKPO'], Prefix+'Phone':res['PHONECHIEF'], 
                   Prefix+'BankAccount': res['BANKACCOUNT'], Prefix+'INN': self.NormalizeStr(res['INN']), Prefix+'Adres':res['ADRESS'],
                   Prefix+'KPP': res['KPP']}
        return dic
   
    def GetTaskInfo(self, docid):
        task = self.dbExec(sql='select taskid, tasktypeid from WM_TASK where DOCID=? and ownertask is NULL',params=(docid,), fetch="one")
        if not task: raise "Не найдено задание"
        elif not task['taskid']: raise "Не найден идентификатор задания"
        elif not task['tasktypeid']: raise "Не найден идентификатор типа задания"
        else: return task
        
    # Собственно процедура печати документа:
    def report(self, docid, **args):
        ownerObj = self.dbExec(sql='SELECT OWNER FROM CONFIG',params=(), fetch="one")
        owner = self.GetCompanyInfo(objid=ownerObj['OWNER'], Prefix='owner')
        
        if 'flag' in args: flag = args['flag']
        else: flag = None
        
        docsData = []
        docs = docid.split(',')        
        for docid in docs:
            if docid:
                doc = self.dbExec(sql='select * from K_DOCPRINT_GET_DOC_INFO(?)',params=(docid,),fetch="one")
                if doc['DTCODE']=='INCOME' and flag=='c':
                    if 'timestamp' in args: timestamp = args['timestamp']
                    else: timestamp = None
                
                    task = self.GetTaskInfo(docid)
                    # акт разногласий
                    wares = self.dbExec(sql='select distinct * from K_INCOME_CLAIM_REPORT_PRINT(?,?,?,?) ORDER BY WARESNAME ',
                        params=(task['taskid'], self.rnd, 1, timestamp), fetch="all")
                    sum = self.dbExec(sql='select distinct * from K_INCOME_GET_CLAIM_SUM(?)',
                        params=(docid,), fetch="one")
                    date = self.dbExec(sql='select distinct * from K_INCOME_GET_DOCDATETIME(?)',
                        params=(docid,), fetch="one")['DOCDATETIME']
                    docsData.append({'doc':doc,'wares':wares['datalist'], 'sumClaim': sum['SUM'], 'sumFact': sum['SUMFACT'], 
                                     'dateTime': dtu.formatMxDateTime(date, '%d.%m.%Y %H:%M:%S')})
                elif doc['DTCODE']=='ININCOME':
                    wares = self.dbExec(sql='select * from K_DOCPRINT_ININCOME_LISTWARES(?)',params=[docid], fetch="all")
                    docsData.append({'doc':doc,'wares':wares['datalist']})
                else:
                    wares = self.dbExec(sql='select lc.code,lc.waresname,lc.amount,lc.price,lc.docsum, lc.WARESUNITID_NAME\
                                               from listcargo(?) lc \
                                              where abs(lc.amount)>0.00001 \
                                              order by lc.waresname',
                                    params=(docid, ), fetch="all")
                    docsData.append({'doc':doc,'wares':wares['datalist']})
        return self.drawTemplate(templ=docPrintTMPL, data=[{'docs':docsData,'prefix':'O', 'flag':flag},owner])
    report.exposed = True

    def report(self, docid, reportid=None, dbid=None):
        def toNone(val):
            if val == ' ':
                return None
            else:
                return val

        if reportid is None: self.pyDumps({'errMes': 'Не указан тип отчета!'})
        # получим данные об отчете
        reportdata = self.dbExec('select * from K_REPORTS_DOCTYPE where REPORTID = ?', [reportid], fetch='one')
        ownerObj = self.dbExec(sql='SELECT OWNER FROM CONFIG', params=(), fetch="one")
        owner = self.GetCompanyInfo(objid=ownerObj['OWNER'], Prefix='owner')
        session = None
        try:
            session = self.GetKSessionID()
        except:
            return self.pyDumps({'errMes': 'Нет сессии!!!'})

        docs = docid.split(',')
        dbid = dbid.split(',')
        i = 0
        docsData = []
        for docid in docs:
            if docid:
                print('select * from %s(?)' % str(reportdata['PROCMASTERNAME']))
                doc = self.dbExec(sql='select * from %s(?,?)' % reportdata['PROCMASTERNAME'],
                                  params=[docid, toNone(dbid[i])], fetch="one")
                wares = self.dbExec(sql='select * from %s(?,?)' % reportdata['PROCDETAILNAME'],
                                    params=[docid, toNone(dbid[i])], fetch="all")
                docsData.append({'doc': doc, 'wares': wares['datalist']})
                if reportdata['SETENDTASK'] == '1' and dbid[i] == ' ':
                    self.dbExec(sql='execute procedure K_DOCUMENT_ENDTASK(?,?,?)', params=[docid, reportid, session],
                                fetch="none")
            i = i + 1
        if reportdata['PRINTHEADER'] and reportdata['PRINTHEADER'] == '1':
            printHeader = '1'
        else:
            printHeader = '0'
        return self.drawTemplate(templ=docPrintTMPL, data=[
            {'docs': docsData, 'prefix': 'O', 'DTPRINTTMPL': reportdata['TEMPL'],
             'PRINTHEADER': reportdata['PRINTHEADER'], 'HEADHTML': reportdata['HEADHTML']}, owner])

    report.exposed = True

    def getReports(self, docid, dbid=None):
        def objName(objid):
            return self.dbExec('select * from getobjectname(?,?)', [objid, ''], fetch='one')['FULLNAME']

        def toNone(val):
            if val == ' ':
                return None
            else:
                return val

        docs = docid.split(',')
        db = dbid.split(',')
        available = {}
        i = 0
        for docid in docs:
            if docid:
                reports = self.dbExec('select * from K_REPORTS_AVAILABLE(?,?)', [docid, toNone(db[i])], fetch='all')[
                    'datalist']
                for report in reports:
                    if report['REPORTID'] not in available:
                        available[report['REPORTID']] = {'reportid': report['REPORTID'],
                                                         'reportname': report['REPORTNAME'], 'docs': []}
                    doc = self.dbExecC('select * from GETDOCUMENTBYID(?,?)', [docid, toNone(db[i])], fetch='one')
                    available[report['REPORTID']]['docs'].append({'docid': doc['DOCID'],
                                                                  'docdate': dtu.formatMxDateTime(doc['DOCDATE'],
                                                                                                  format='%d.%m.%Y'),
                                                                  'number': doc['NUMBER'],
                                                                  'from': objName(doc['FROMOBJ']),
                                                                  'to': objName(doc['TOOBJ']),
                                                                  'dbid': db[i]})
            i = i + 1
        out = []
        for key in list(available.keys()):
            out.append(available[key])
        return self.pyDumps(out)

    getReports.exposed = True

