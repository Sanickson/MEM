# -*- coding: utf-8 -*-
__author__ = 'Nickson'


from systems.KURSSKLAD.common import WHCommon

from systems.KURSSKLAD.REPORTS.PALLETPRINT.templates.palleti import palleti
from systems.KURSSKLAD.REPORTS.PALLETPRINT.templates.palletsum import palletsum
from systems.KURSSKLAD.REPORTS.PALLETPRINT.templates.freelabel import freelabel


class PalletPrint(WHCommon):

    def index(self, id_system=None):
        WHCommon.index(self, id_system)
        return self.palleti()

    index.exposed = True

    def palletsum(self):
        return self.drawTemplate(templ=palletsum, data=[])

    palletsum.exposed = True

    def freelabel(self):
        return self.drawTemplate(templ=freelabel, data=[])

    freelabel.exposed = True

    def qpalletsum(self, dtbeg, dtend):
        try:
            data = self.dbExec(sql="select * from WH_RPALLETPRINT_SUM_DATA(?,?)", params=(dtbeg, dtend), fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    qpalletsum.exposed = True
    

    def palleti(self):
        return self.drawTemplate(templ=palleti, data=[])

    palleti.exposed = True
    
    def qpalleti(self, dtbeg, dtend):
        try:
            data = self.dbExec(sql="select * from WH_RPALLETPRINT_I_DATA(?,?)", params=(dtbeg, dtend), fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    qpalleti.exposed = True

    def printers(self):
        try:
            data = self.dbExec(sql="select alias from WM_PRINTERS", params=[], fetch='all')
        except Exception as exc:
            return self.pyDumps({'errMes': exc[1]})
        return self.pyDumps(data=data)

    printers.exposed = True

    def print_label(self, pid, printer, cnt):
        if cnt:
            try:
                self.dbExec(sql="execute procedure K_WH_INCOME_PRINTPALLET('INCOME',?,?,?,?)",
                            params=[self.GetKSessionID(), pid, printer.decode('utf-8').encode('cp1251'), cnt], fetch='none')
            except Exception as exc:
                return self.pyDumpsExc(exc=exc)
            return self.pyDumps({})
        else:
            return self.pyDumps({'errMes': "Не задано количество этикеток для печати"})

    print_label.exposed = True

    def print_free_label(self, ltext, lbarcode, lsize, lamount, lprinter):
        if int(lamount) > 0:
            try:
                self.dbExec(sql="execute procedure  WH_FREELABEL_PRINT(?,?,?,?,?,?)",
                            params=[self.GetKSessionID(), ltext.decode('utf-8').encode('cp1251'), lbarcode, lsize,
                                    lamount, lprinter.decode('utf-8').encode('cp1251')], fetch='none')
            except Exception as exc:
                return self.pyDumpsExc(exc=exc)
            return self.pyDumps({})
        #else:
        #    return self.pyDumps({'errMes': "Не задан штрихкод"})

    print_free_label.exposed = True

