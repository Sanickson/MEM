# -*- coding: utf-8 -*-
# proper 02.04.2014
# version 0.0.2.0

"""
    класс импорта складов
"""

import plugins.impdata.object.impobject as imp_object
from rbsqutils import str_to_bool_int


class Warehouses(imp_object.Obj):
    """
        Класс импорта складов
    """

    def __init__(self, parent_class, flag_work, obj=None):
        """
            Инициализация переменных из XML
            если obj=None, то переменные нужно заполнять вручную
        """

        self.parent_class = parent_class
        self.child_class = type(self).__name__

        if obj is not None:
            self.code = self.xml_get_value(obj, 'code')
            self.name = self.xml_get_value(obj, 'name')
            self.parent = self.xml_get_value(obj, 'parent')
            self.parentcode = self.xml_get_value(obj, 'parentcode', flag='N')
            self.realcode = self.xml_get_value(obj, 'realcode', flag='N')
            self.isdelete = self.xml_get_value(obj, 'deletemarker')
            self.isdelete = str_to_bool_int(self.isdelete)
            self.parentgroup = self.xml_get_value(obj, 'parentgroup')
            self.parentgroup = str_to_bool_int(self.parentgroup)

            ''' Используется для Хабаровска АЗ
                так как используется подчинение склада подразделению '''
            self.highercode = self.xml_get_value(obj, 'departmentcode', flag='N')
            self.highername = self.xml_get_value(obj, 'departmentname', flag='N')
            self.highertype = 'D'
            if self.highercode == '0':
                self.highercode = None

            if parent_class.xml_name_external_id:
                self.external_id = self.xml_get_value(obj, parent_class.xml_name_external_id, flag='N')
                self.parent_id = self.xml_get_value(obj, parent_class.xml_name_external_id + 'parent', flag='N')

        self.flag_work = flag_work
        self.type_object = 'W'