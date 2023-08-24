# -*- coding: utf-8 -*-

from systems.KURSSKLAD.KURSTERM.WORKPALLET.workslot import TWorkSlot

class TWorkPallet(TWorkSlot):

    def palQWaresMove(self, id, wuid, wlots, amounts, newpalid, dt=None):
        self.dbExec(sql='execute procedure WH_WORKPALLET_SAVE_CHECK(?,?,?,?,?,?,?)', fetch='none',
                    params=[self.getIfaceVar('wmsid'), id, wuid, wlots, amounts, newpalid, dt])

    def palQWaresMoveEgaisAll(self, pid, wid, newpalletid, ctm):
        self.dbExec(sql='execute procedure WH_WORKPALLET_MOVE_EGAISALL_CHK(?,?,?,?,?)',
                    params=[self.getIfaceVar('wmsid'), pid, wid, newpalletid, ctm], fetch='none')

    def palQWaresMoveEgaisStart(self, pid, wid, newpalletid, ctm):
        return self.dbExec(sql='select * from WH_WORKPALLET_MOVE_EGAISTARTCHK(?,?,?,?,?)',
                           params=[self.getIfaceVar('wmsid'), pid, wid, newpalletid, ctm], fetch='one')

