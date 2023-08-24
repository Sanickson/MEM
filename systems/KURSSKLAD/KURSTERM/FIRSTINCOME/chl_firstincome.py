# -*- coding: utf-8 -*-
from systems.KURSSKLAD.KURSTERM.FIRSTINCOME.firstincome import TFirstIncome

class TFirstIncomeChl(TFirstIncome):
    def defaultProductDate(self):
        """ Дата производтсва, которая проставится по умолчанию в форме приемки """
        return self.dateMask
