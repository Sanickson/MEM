# -*- coding: utf-8 -*-

# урлы, на которые не нужны права и не проверяется сессия
grantAccessRefs =  [
    '', # стартовая
    '/index', # стартовая
    '/login', # логин
    '/login_ajax', # ajax-логин
    '/login_term', # терминальный логин
    '/download', # скачивание файлов
    '/exception', # страница ошибки
    '/get_pwd_complexity_status',
    '/login_change_passwd', # изменение пароля при первом входе
    '/PROFILE/theme', # страница тем оформления профиля
    '/PROFILE/passwd', # страница смены пароля профиля
    '/PROFILE/changepasswd', # страница смены пароля профиля
    '/PROFILE/ajaxBarcodeGen', # генерация ШК и QR-кода
    '/PROFILE/ajaxBarcodeHTML', # печать ШК и QR-кода
    '/PROFILE/get_pwd_complexity_status', # страница проверки надежности пароля
    '/PROFILE/saveprofileaddon', # сохранинеи доп. параметров профиля
    '/PROFILE/info', # страница информации профиля
    '/PROFILE/ajaxChangeTheme', # смена темы
    '/ACCOUNT', # страница регистрации
    '/ACCOUNT/createaccount', # создание аккаунта
    '/ACCOUNT/recovery', # забыли пароль
    '/ACCOUNT/verifyuser', # проверка пользователя
    '/ACCOUNT/rp', # урл сброса пароля
    '/ACCOUNT/rp_drop', # сброс пароля
    '/ACCOUNT/get_pwd_complexity_status', # проверка надежности пароля при регистрации
    '/exit', # выход
    '/set_lang',
    '/custom_changezone_set_zone'
    ]

# список урлов, права на которые даются автоматически при регистрации
autoGrantRefs = [
    # '/SYSTEM/SUBSYSTEM', '/OTHERSYSTEM/OTHERSUBSYSTEM'
]

# список урлов, права на которые даются при регистрации пользователя владельцем слоя
# только при использовании слоёв
autoGrantRefsFromOwner= [
    # '/SYSTEM/SUBSYSTEM', '/OTHERSYSTEM/OTHERSUBSYSTEM'
]

# ключи ReCaptcha
reCaptchaPublicKey = ''
reCaptchaPrivateKey = ''

# регулярное выражение для определения статических ресурсов
filterStaticString = r"^.*\.(jpg|jpeg|gif|png|ico|css|zip|tgz|gz|rar|bz2|doc|xls|exe|pdf|ppt|txt|tar|mid|midi|wav|bmp|rtf|js|htm|html|swf|woff|eot|ttf|ogg|mp3|json)$"
