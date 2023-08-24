# -*- coding: utf-8 -*-
import time
import types
from Cheetah.Filters import RawOrEncodedUnicode
class DateFilter(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        #FB datetime example 2007-06-24 00:00:00.00 
        sdate=str(val).split('.')[0]#Drop down .00
        sformatFrom='%Y-%m-%d %H:%M:%S' if sdate.find(' ') > -1 else '%Y-%m-%d'
        sdateTuple=time.strptime(sdate,sformatFrom)
        sformatTo='%d.%m.%Y'
        sdateStr=time.strftime(sformatTo,sdateTuple)
        return  sdateStr


class DateFilterMD(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        #FB datetime example 2007-06-24 00:00:00.00
        sdate = str(val).split('.')[0]#Drop down .00
        sformatFrom = '%Y-%m-%d %H:%M:%S' if sdate.find(' ') > -1 else '%Y-%m-%d'
        sdateTuple = time.strptime(sdate, sformatFrom)
        sformatTo = '%d.%m'
        sdateStr = time.strftime(sformatTo, sdateTuple)
        return sdateStr


class DateFilter2(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        #FB datetime example 2007-06-24 00:00:00.00 
        sdate=str(val).split('.')[0]#Drop down .00
        sformatFrom = '%Y-%m-%d %H:%M:%S' if sdate.find(' ') > -1 else '%Y-%m-%d'
        sdateTuple=time.strptime(sdate,sformatFrom)
        sformatTo='%d.%m.%y'
        sdateStr=time.strftime(sformatTo,sdateTuple)
        return  sdateStr
        
class ShortDateFilter(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        #FB datetime example 2007-06-24 00:00:00.00 
        sdate=str(val).split('.')[0]#Drop down .00
        sformatFrom = '%Y-%m-%d %H:%M:%S' if sdate.find(' ') > -1 else '%Y-%m-%d'
        sdateTuple=time.strptime(sdate,sformatFrom)
        sformatTo='%d.%m.%y'
        sdateStr=time.strftime(sformatTo,sdateTuple)
        return  sdateStr

class Quantity(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        if not val: return '0'
        val=str(val)
        if val=='0.0': return '0'
        f=val.find('.')
        if f==-1: 
            ret=val
        else:
            val = float(val)
            scale = 0
            while abs(val - round(val,scale))>=0.001 and scale < 4:
                scale += 1
            val = str(round(val,scale))
            f=val.find('.')
            if f==-1: 
                ret=val
            else:
                ret = val[:f]
                if scale: 
                    ret+=val[f:(f+scale+1)]
                    if ret[:3] == '00.': ret = ret[1:]
                else: ret = val[:f]
        return  ret
        
class TimeFilter(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        #FB datetime example 2007-06-24 00:00:00.00 
        sdate=str(val).split('.')[0]#Drop down .00
        sformatFrom = '%Y-%m-%d %H:%M:%S' if sdate.find(' ') > -1 else '%Y-%m-%d'
        sdateTuple=time.strptime(sdate,sformatFrom)
        sformatTo='%H:%M'
        sdateStr=time.strftime(sformatTo,sdateTuple)
        return  sdateStr

class Round3(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        val=str(val)
        f=val.find('.')
        if f==-1: 
          ret=val
        else:
          ret=val[:f+4]  
        return  ret

class Round2(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        val=str(val)
        f=val.find('.')
        if f==-1:
          ret=val
        else:
          ret=val[:f+3]
        return  ret

class Money(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        val=str(val)
        f = val.find('.')
        ost = ''
        rank = ''
        ret = ''
        if f==-1:
            s = val + 'X'
        else:
            s = val[:f] + 'X'
            drob = val[f:f + 3]
        i = 1
        while i < (len(s) - 1):
            rank = s[-(i + 3):-i]
            ost = s[:-(i + 3)]
            i += 3
            ret = rank + ' ' + ret
        ret = ost + ' ' + ret
        if drob :
            ret = ret[:-1] + drob
        return  ret

class DateTimeFilter(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        #FB datetime example 2007-06-24 00:00:00.00 
        sdate=str(val).split('.')[0]#Drop down .00
        sformatFrom = '%Y-%m-%d %H:%M:%S' if sdate.find(' ') > -1 else '%Y-%m-%d'
        sdateTuple=time.strptime(sdate,sformatFrom)
        sformatTo='%d.%m.%y %H:%M'
        sdateStr=time.strftime(sformatTo,sdateTuple)
        return  sdateStr

class DateTimeWSecFilter(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        #FB datetime example 2007-06-24 00:00:00.00 
        sdate=str(val).split('.')[0]#Drop down .00
        sformatFrom = '%Y-%m-%d %H:%M:%S' if sdate.find(' ') > -1 else '%Y-%m-%d'
        sdateTuple=time.strptime(sdate,sformatFrom)
        sformatTo='%d.%m.%y %H:%M:%S'
        sdateStr=time.strftime(sformatTo,sdateTuple)
        return  sdateStr

class LongDateTimeFilter(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        #FB datetime example 2007-06-24 00:00:00.00 
        sdate=str(val).split('.')[0]#Drop down .00
        sformatFrom = '%Y-%m-%d %H:%M:%S' if sdate.find(' ') > -1 else '%Y-%m-%d'
        sdateTuple=time.strptime(sdate,sformatFrom)
        sformatTo='%d.%m.%Y %H:%M'
        sdateStr=time.strftime(sformatTo,sdateTuple)
        return  sdateStr

class LongDateTimeWSecFilter(RawOrEncodedUnicode):
    def filter(self, val, encoding=None, **kw):
        #FB datetime example 2007-06-24 00:00:00.00 
        sdate=str(val).split('.')[0]#Drop down .00
        sformatFrom = '%Y-%m-%d %H:%M:%S' if sdate.find(' ') > -1 else '%Y-%m-%d'
        sdateTuple=time.strptime(sdate,sformatFrom)
        sformatTo='%d.%m.%Y %H:%M:%S'
        sdateStr=time.strftime(sformatTo,sdateTuple)
        return  sdateStr
