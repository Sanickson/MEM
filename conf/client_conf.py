# -*- coding: UTF-8 -*-

CLIENT_CODE = 'UHW'

pallet_length = 120
pallet_width = 80

selgroup = {
    'tabs': {'reference': 'Справочник', 'neighborhood': 'Соседство', 'waresnoselgroup': 'Товары без ГО'},
    'tabsort': ('reference', 'neighborhood', 'waresnoselgroup')
}

# MAIL.RU
# smtp_server = "smtp.mail.ru"
# smtp_port = "465"
# smtp_username = "you@mail.ru"
# smtp_password = "your password"
# smtp_ssl = True
# smtp_from = "you@mail.ru"

smtp_server = ""
smtp_port = ""
smtp_username = ""
smtp_password = ""
smtp_from = ""
smtp_ssl = False

tsd_planload= []
routelist= []

trade_secret = ""

agree_trsecret = ""

pickInHands = 'Выдать в руки' # Отборка в руки 'Списать товар' - False

planLoadEditPermission = False

incomeTaskWaresMode = 'ReadOnly' # Какой режим при нажатии на Товар в задании интерфейса приемка
incomeTaskWaresChkSelGroup = True # Проверять ли настоойку групп отборки при приемке

selectTaskWaresDiffMails = None # [] Список адресов для получения рассылки о расхождения в отборке
selCtrlTaskWaresDiffMails = None # [] Список адресов для получения рассылки о расхождения в контроле отборки

#Адреса для рассылки изменений ед.измер. в справочниках товаров
waresunitLogMails = ''