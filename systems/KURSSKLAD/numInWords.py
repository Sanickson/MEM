# -*- coding: utf-8 -*-
#!/usr/bin/env python
# -*- coding: cp1251 -*-

"""сумма прописью"""

nw_1_999_en = {"1":"odin",
         "2":"dva", "3":"tri", "4":"4etire", "5":"pjat'", "6":"west'", "7":"sem'", "8":"vosem'", "9":"devjat'", "10":"desiat'",
         "11":"odinnadtsat'", "12":"dvenadtsat'", "13":"trinadtsat'", "14":"4etirnadtsat'", "15":"piatnadtsat'", 
         "16":"westnadtsat'", "17":"semtadtsat'", "18":"vosemnadtsat'", "19":"deviatnadtsat'", "20":"dvadtsat'",
         "30":"tridtsat'", "40":"sorok", "50":"piatdesiat", "60":"westdesiat", 
         "70":"semdesiat", "80":"vosem'desiat", "90":"devianosto", "100":"sto", 
         "200":"dvesti", "300":"trista", "400":"4etiresta", "500":"piatsot",
         "600":"west'sot", "700":"sem'sot", "800":"vosem'sot", "900":"deviatsot"}

nw_en = {"1000": {"value":"tisia4", "except":{"1":"odna tisia4a","2":"dve tisia4i","3":"tri tisia4i","4":"4etire tisia4i"}},
         "1000000": {"value":"millionov", "except":{"1":"odin million","2":"dva milliona","3":"tri milliona","4":"4etire milliona"}},
         "1000000000": {"value":"milliardov", "except":{"1":"odin milliard","2":"dva milliarda","3":"tri milliarda","4":"4etire millliarda"}}
        }


nw_ru = {"1000": {"value":"тысяч", "except":{"1":"одна тысяча","2":"две тысячи","3":"три тысячи","4":"четыре тысячи"}},
         "1000000": {"value":"миллионов", "except":{"1":"один миллион","2":"два миллиона","3":"три миллиона","4":"четыре миллиона"}},
         "1000000000": {"value":"миллиардов", "except":{"1":"один миллиард","2":"два миллиарда","3":"три миллиарда","4":"четыре миллиарда"}}
        }
        
nw_1_999_ru = {"1":"один", 
         "2":"два", "3":"три", "4":"четыре", "5":"пять", "6":"шесть", "7":"семь", "8":"восемь", "9":"девять", "10":"десять",
         "11":"одиннадцать", "12":"двенадцать", "13":"тринадцать", "14":"четырнадцать", "15":"пятнадцать", 
         "16":"шестнадцать", "17":"семнадцать", "18":"восемнадцать", "19":"девятнадцать", "20":"двадцать",
         "30":"тридцать", "40":"сорок", "50":"пятьдесят", "60":"шестьдесят", 
         "70":"семьдесят", "80":"восемьдесят", "90":"девяносто", "100":"сто", 
         "200":"двести", "300":"триста", "400":"четыреста", "500":"пятьсот",
         "600":"шестьсот", "700":"семьсот", "800":"восемьсот", "900":"девятьсот"}


wrapper = {
    "money" : {"int":"руб.","fract":"коп.","scale":2}
}

def numInWords(num):
    num = int(num)
    if num == 0: return ''
    elif num < 0:
        num = -num
        res = '- '
    else:    
        res = ''
        
    nw_1_999 = nw_1_999_ru
    nw = nw_ru
    
    def num3InWords(num_1_999_str,nw_num = '1'):
        
        def addNumInWords(num):
            num = str(num)
            if nw_num != '1':
                if num in nw[nw_num]["except"]:
                    return nw[nw_num]["except"][num]
                else:
                    return nw_1_999[num]+' '+nw[nw_num]["value"]
            return nw_1_999[num]
                    
        res = ''
        if num_1_999_str in nw_1_999:
            res = addNumInWords(num_1_999_str)+' '
        else:
            num_1_999_int = int(num_1_999_str)
            num_100_int = (num_1_999_int / 100) * 100
            num_1_99_int = num_1_999_int - num_100_int
            if num_1_99_int:
                if num_100_int > 0: res = res + nw_1_999[str(num_100_int)] + ' '
                num_1_99_str = str(num_1_99_int)
                if num_1_99_str in nw_1_999:
                    res = res + addNumInWords(num_1_99_str) + ' '
                else:
                    num_10_int = (num_1_99_int / 10) * 10
                    if num_10_int > 0: res = res + nw_1_999[str(num_10_int)] + ' '
                    num_1_9_int = num_1_99_int - num_10_int
                    if num_1_9_int > 0: res = res + addNumInWords(num_1_9_int) + ' '
            else:
                res = res + addNumInWords(num_100_int)
        return res
    
    num_str = str(int(num))
    num_arr = []
    num_len = len(num_str)
    while num_len != 0:        
        if num_len >= 3: 
            num_arr.append(num_str[num_len-3:])
            num_len = num_len - 3
            num_str = num_str[:num_len]
        else: 
            num_arr.append(num_str)
            num_len = 0
        
    n_0 = 1
    for item in num_arr:
        if item != '000':
            res = num3InWords(item, str(n_0)) + res
        n_0 = n_0 * 1000
    return res.strip()
    
def amountInWords(amount,wrapper_item):
    if wrapper_item in wrapper:
        amount_int = int(amount)
        scale = 0
        if "scale" in wrapper[wrapper_item]: scale = wrapper[wrapper_item]["scale"]
        res = ''
        if amount_int == 0: res  = '0'
        else: res = numInWords(amount_int)
        res =  res + ' ' + wrapper[wrapper_item]["int"] + ' '
        if scale > 0:
            amount_fract = int(round((amount - amount_int) * pow(10,scale),0))
            if amount_fract == 0: 
                fractInWords = '0'*scale
            else: 
                amount_fract_str = str(amount_fract)
                if len(amount_fract_str) < scale: 
                    fractInWords = '0'*(scale-len(amount_fract_str)) + amount_fract_str
                else: fractInWords = amount_fract_str
            if "fract" in wrapper[wrapper_item]:
                res = res + fractInWords + ' ' + wrapper[wrapper_item]["fract"]
        return res.strip()
    else:
        return "Error wrapper"
    
def sumInWords(summa):
    return amountInWords(summa,"money")

def monthInWord(nummonth):
    nummonth = int(nummonth)
    
    Months = ['январ', 'феврал', 'март', 'апрел', 'ма', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр']
    
    if nummonth in (3, 8):
        return Months[nummonth-1] + 'а'
    else:
        return Months[nummonth-1] + 'я'
    