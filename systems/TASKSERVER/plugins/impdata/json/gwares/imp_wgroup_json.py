# -*- coding: utf-8 -*-

"""
    модуль импорта товарных групп из json
"""

import plugins.impdata.impwgroup_base as w
import plugins.impdata.imp_base as i_base

__author__ = 'swat'
VERSION = '0.0.3.0'
DATE_VERSION = '09.07.2015'


class WGroupJson(w.BaseWGroup, i_base.ImpBase):
    """
        Класс  импорта групп товаров из json
    """

    obj = None

    def __init__(self, parent_class, obj, encode=True):
        """
            Инициализация переменных из json
        """

        self.parent_class = parent_class
        self.obj = obj
        self.encode = encode

        self.external_id = self.json_get_value('guid')
        self.name = self.json_get_value('name')
        self.group_id = self.json_get_value('higher')
        self.delete_marker = self.json_get_value('is_delete')
        if self.delete_marker == '0':
            self.delete_marker = '1'
        elif self.delete_marker == '1':
            self.delete_marker = '0'
