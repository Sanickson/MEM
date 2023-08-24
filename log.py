# -*- coding: utf-8 -*-
import sys
import simplejson as json

import db
from base import BasePage

import system_init as si
from py_utils import *
import cp_utils as cpu

#In all methods, accepted parameter class_name,
#it may be Class Object or string specified full class name (examples: self.__class__, 'systems.ENGINE.ADMINPANEL.admin.AdminPanel')

def objtostr(obj):
    if type(obj) == str:
        return obj
    else:
        return str(obj)

def logformat(obj):
    typ = type(obj)
    if issubclass(typ, dict):
        obj_new = {}
        for kwarg_key, kwarg_val in list(obj.items()):
            obj_new[logformat(obj=kwarg_key)] = logformat(obj=kwarg_val)
    elif issubclass(typ, list) or issubclass(typ, tuple):
        obj_new = []
        for arg in obj:
            obj_new.append(logformat(obj=arg))
    elif type(obj) == bytes:
        try:
            obj_new = obj.decode('utf-8') #+ ' (unicode)'
        except UnicodeEncodeError:
            obj_new = repr(obj) + " (Can't encode unicode value)"
    else:
        obj_new = obj
    return obj_new

class LogException(Exception):
    pass

def realClassName(classType):
    spl = str(classType).split("'")
    return spl[1] if len(spl) > 1 else str(classType)

def logGetTableName(class_name):
    "returns table name like (SHORTCLASSNAME_1234567890), where 1234567890 - is hash of full class_name"
    class_name = realClassName(class_name)
    h_ = hash(class_name)
    if is_x32():
        h = h_ + 2**31
    else:
        h = h_ & (2**32-1)
    return '%s_%d' % (class_name.split('.')[-1][:20], h)
    #return '%s_%d' % (class_name.split('.')[-1].split("'")[0][:20], h)

def logGetLOGIdSystem():
    "returns id_system of LOG system"
    res = db.dbExec(sql='select id_system from ENGINE_FIND_SYSTEM_BY_FULL_REF(?)', params=['/LOG'], fetch='one', id_system=-1)
    if not res:
        raise LogException('system LOG not found')
    return res['id_system']

def convDocString(docstr):
    return docstr
    if isUnicode(docstr):
        try:
            docstr_new = docstr.encode('windows-1251')
        except UnicodeEncodeError:
            docstr_new = repr(docstr)
    else:
        docstr_new = str(docstr)
    return docstr_new

#получить можно только при наличии системы /LOG (raise)
def logGet(class_name, code=None, datetime_from=None, datetime_to=None, uid=None, userfio=None):
    """getting log data by filter (class_name only required):
    ID_LOG, ID_SYSTEM, SYSTEM_DESCRIPT, CLASS_NAME, METHOD_NAME, CODE, DOC_STRING, UID, FIO, DATE_STAMP, PARAMS
    """
    log_system = logGetLOGIdSystem()
    return db.dbExec(sql='select * from LOG_GET(?,?,?,?,?,?)',
        params=[realClassName(class_name), code, datetime_from, datetime_to, uid, userfio],
        fetch='all',
        id_system=log_system)

def logParseParams(params_str, strip_coding=True):
    """парсинг параметров, хрянящихся в строке params_str в json-формате в кодировке windows-1251.
    strip_coding - обрезать возможные название кодировок в конце компонентов-строк (' (windows-1251)', ' (utf-8)', ' (unicode)')
    """
    ret_params = logformat(obj=json.loads(params_str, encoding='utf-8'))
    return iif(strip_coding, trunc_coding(ret_params), ret_params)

#установить можно даже при отсутствии системы /LOG (no raise)
def logSet(code):
    "wrapper for logging methods (code required max 20 chars)"
    def wrap(f):
        def wrapped(*args, **kwargs):
            res = db.dbExec(sql='select id_system from ENGINE_FIND_SYSTEM_BY_FULL_REF(?)', params=['/LOG'], fetch='one', id_system=-1)
            if not res:
                cpu.cherrypylog('system LOG not found')
                return f(*args, **kwargs)
            log_system = res['id_system']
            if not f.__doc__:
                raise LogException('Doc string of method %s.%s not found' % (args[0].__class__, f.__name__))
            id_system = int(args[0].id_system) #int(args[0].getIfaceVar('id_system'))
            #print "------------------"
            #print log_system
            #print "------------------"

            sargs = ''
            skwargs = ''
            args_1251 = logformat(obj=args)
            kwargs_1251 = logformat(obj=kwargs)

            #args
            for arg in args_1251[1:]:
                sargs += '%s, ' % iif(arg is None, 'null', objtostr(arg).replace('"', '\\"'))
            if sargs:
                sargs = '"args": [%s]' % sargs[:-2]

            #kwargs
            for name, val in list(kwargs_1251.items()):
                skwargs += '%s: %s, ' % (objtostr(name).replace('"', '\\"'),
                                         iif(val is None, 'null', objtostr(val).replace('"', '\\"')))
            if skwargs:
                skwargs = '"kwargs": {%s}' % skwargs[:-2]

            #sallargs = '; '.join((sargs, skwargs)) #ne katit
            #sallargs = str(sargs + skwargs).strip()
            sallargs = sargs
            if sallargs:
                if skwargs:
                    sallargs += ', ' + skwargs
            else:
                sallargs = skwargs
            sallargs = '{%s}' % sallargs

            #table_name = logGetTableName(args[0].__class__)
            cl = args[0].__class__
            className = realClassName(cl)
            conv_f_doc = convDocString(f.__doc__)

            db.dbExec(sql='execute procedure prepare_metadata(?)', params=[cl.__name__], fetch='none', id_system=log_system)
            db.dbExec(sql='execute procedure log_insert(?,?,?,?,?,?,?,?,?,?)',
                params=(
                    cl.__name__,
                    id_system,
                    si.systems_params[id_system]['system_name'],
                    className,
                    f.__name__,
                    code[:20],
                    conv_f_doc,
                    args[0].getUserVar('uid'), #int(args[0].getUserVar('uid')),
                    args[0].getUserVar('userfio'),
                    sallargs
                ), fetch='none', id_system=log_system)
            result = f(*args, **kwargs)
            return result
        wrapped.__doc__ = f.__doc__
        return wrapped
    return wrap

#вызвать эту процедуру можно даже при отсутствии системы /LOG (no raise)
#можно вызывать из метода, метода, обёрнутого в декоратор и из функции, не обёрнутой в декоратор (например, из app.init)
def logWrite(code, ext_params=None, level=0):
    "direct write into log (code required max 20 chars)"

    def get_params_for_log():
        type_caller, self, f, f_cum_name = find_base_caller(level = level + 2)

        if type_caller == 'b':
            cls = self.__class__
            str_cls = cls.__name__
            id_system = int(self.id_system) #int(self.getIfaceVar('id_system')) #or nested function not in class (self is none), or class is borned not from BasePage
            system_name = si.systems_params[id_system]['system_name']
            f_doc = f.__doc__

        elif type_caller in ['f', 'n']:
            #try:
            cls = f.__module__
            str_cls = "m " + str(f.__module__)
            id_system = -1
            system_name = 'SYSTEM'
            f_doc = f.__doc__
            #except:

        elif type_caller == 't':
            cls = None
            str_cls = None
            id_system = None
            system_name = None
            f_doc = None
            #print 'Top level'
            #raise Exception('Класс не порождён от BasePage')

        else:# type_caller == 'o':
            cls = None
            str_cls = None
            id_system = None
            system_name = None
            f_doc = None
            #print 'Class not borned from BasePage'
            #raise Exception('Класс не порождён от BasePage')

        return type_caller == 'b', f_cum_name, cls, str_cls, id_system, system_name, f_doc

    is_class, f_name, cls, str_cls, id_system, system_name, f_doc = get_params_for_log()

    res = db.dbExec(sql='select id_system from ENGINE_FIND_SYSTEM_BY_FULL_REF(?)', params=['/LOG'], fetch='one', id_system=-1)
    if not res:
        cpu.cherrypylog('system LOG not found')
        return
    log_system = res['id_system']

    #print is_class
    #print f_name
    #try:
    #    print f.__name__
    #except:
    #    pass

    if not f_doc:
        raise LogException('Doc string of %s %s.%s not found' % (iif(is_class, 'method', 'function'), cls, f_name))

    tb_frame = sys._getframe(level+1)

    #simple args and arg-argument
    args_new = []
    #simple argument
    for local in list(tb_frame.f_locals.keys()):
        vl = tb_frame.f_locals[local]
        if is_simple_argument(local, tb_frame):
            args_new.append(logformat(obj=vl))

    #arg-argument
    for local in list(tb_frame.f_locals.keys()):
        vl = tb_frame.f_locals[local]
        if is_args(local, tb_frame):
            args_new.extend(logformat(obj=vl))

    #kwargs and ext_params
    kwargs_new = {}
    for local in list(tb_frame.f_locals.keys()):
        vl = tb_frame.f_locals[local]
        #kwarg-argument or is arg
        if is_kwargs(local, tb_frame):
            if ext_params:
                vlcopy = vl.copy()
                vlcopy.update(ext_params)
            kwargs_new = logformat(obj=vlcopy)
            break #only once
    if kwargs_new == {}:
        kwargs_new = logformat(obj=ext_params)

    sargs = ''
    skwargs = ''
    #args_1251 = format(obj=args_new, add_utf_str=True, add_unicode_str=True) #already in this coding
    #kwargs_1251 = format(obj=kwargs_new, add_utf_str=True, add_unicode_str=True)

    #args
    #del self-links
    #if is_class or is_nested:
    if len(args_new):
        for i in range(len(args_new)):
            if isinstance(args_new[i], BasePage):
                del args_new[i]
                break

    #args
    for arg in args_new:
        sargs += '%s, ' % iif(arg is None, 'null', objtostr(arg).replace('"', '\\"'))
    if sargs:
        sargs = '"args": [%s]' % sargs[:-2]

    #kwargs
    for name, val in list(kwargs_new.items()):
        skwargs += '%s: %s, ' % (objtostr(name).replace('"', '\\"'),
                                 iif(val is None, 'null', objtostr(val).replace('"', '\\"')))
    if skwargs:
        skwargs = '"kwargs": {%s}' % skwargs[:-2]

    #sallargs = '; '.join((sargs, skwargs)) #ne katit
    #sallargs = str(sargs + skwargs).strip()
    sallargs = sargs
    if sallargs:
        if skwargs:
            sallargs += ', ' + skwargs
    else:
        sallargs = skwargs
    sallargs = '{%s}' % sallargs

    #table_name = logGetTableName(cls)
    className = realClassName(cls)
    conv_f_doc = convDocString(f_doc)

    db.dbExec(sql='execute procedure prepare_metadata(?)', params=[str_cls], fetch='none', id_system=log_system)
    db.dbExec(sql='execute procedure log_insert(?,?,?,?,?,?,?,?,?,?)',
        params=(
            str_cls,  # str(cls), #str(args[0].__class__), #.split('.')[-1],
            id_system,
            system_name,
            className,
            f_name,  #f.__name__ для wrapped-функций возвращает имя wrapped-функции
            code[:20],
            conv_f_doc,
            iif(cpu.getUserVar('uid'), cpu.getUserVar('uid'), '-1'),
            iif(cpu.getUserVar('userfio'), cpu.getUserVar('userfio'), 'SYSTEM'),  #cpu.getUserVar('userfio')
            sallargs
        ), fetch='none', id_system=log_system)

