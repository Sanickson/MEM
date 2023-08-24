# -*- coding: utf-8 -*-
owner_name = 'Some company name'
service_name='Глобальное имя системы-сервиса'
owner_href = 'Some company site href'

# ==============Server 1================================
server1 = 'http'  # http, https, False
socket_host1 = '0.0.0.0'  # '0.0.0.0' - позволяет слушать любой активный интерфейс, '127.0.0.1' - слушать лишь себя
socket_port1 = 8099  # порт, прослушиваемый 1-м сервером
socket_timeout1 = 1  # время ожидания сокетов 1-го сервера для принятых соединений
thread_pool = 20  # пул потоков 1-го сервера
ssl_certificate_file1 = 'cert.pem'
ssl_private_key_file1 = 'privkey.pem'

# ==============Server 2================================
server2 = False  # http, https, False
socket_host2 = '0.0.0.0'  # '0.0.0.0' - позволяет слушать любой активный интерфейс, '127.0.0.1' - слушать лишь себя
socket_port2 = 8094  # порт, прослушиваемый 2-м сервером
socket_timeout2 = 1  # время ожидания сокетов 2-го сервера для принятых соединений
thread_pool2 = 20  # пул потоков 2-го сервера
ssl_certificate_file2 = 'cert.pem'
ssl_private_key_file2 = 'privkey.pem'

auto_reload=True #рестарт веб-сервера при изменении замапленных модулей
sessions_storage_type='RAM' #RAM|FILE
sessions_storage_path='C:\engine\session'
sessions_timeout=12*60*60/60. #максимальный период неактивности сессий в минутах
sessions_clean_freq=5 #частота проверки активности пользователей в минутах
sessions_forward_to_last_iface_pc=False #перенаправлять в последний активный интерфейс при входе с PC
sessions_forward_to_last_iface_term=True #перенаправлять в последний активный интерфейс при входе с терминала
sessions_forward_to_last_iface_mob=True #перенаправлять в последний активный интерфейс при входе с мобильного устройства
staticdir_root="static"
staticdir_dir=""
log_to_screen=True #output errors to stdout
show_tracebacks=True #show tracebacks in browser

error_log_file='error.log'
access_log_file='access.log'


db_ip='127.0.0.1/3050'
# строка-путь или, для работы с несколькими ветками репозитория, словарь с ключами - кодами клиентов,
# один из которых соответствует параметру CLIENT_CODE из client_conf.py, и значениями - путями к БД Engine.FDB
# по соответствующему клиенту
db_path='C:\enginePiter\Engine.FDB'
# либо
# db_path = {'Piter': 'C:\enginePiter\Engine.FDB', 'VT': 'C:\engine\EngineVT.FDB', 'SR': 'C:\engine\EngineSR.FDB'}

db_user='SYSDBA'
db_pass='masterkey'
#db_role='SOME_ROLE'
db_role=''
db_charset='WIN1251'

trace_db_input=False
trace_db_output=False
trace_session=False
gzip_on=False

gzip_mime_types=['text/*', 'application/*'] #['text/html', 'text/plain']
fetch_limit=None #example: None, 100
init_url='/index'

#default DateTime format
date_time_format='%d.%m.%y %H:%M:%S'

# Mail params
from_mail_host='mail.example.com'
from_mail_port=26
from_mail_coding='windows-1251' #'koi8-r'
from_mail_addr="user@addr.com"
from_mail_user="user@addr.com"
from_mail_passwd='password'
from_mail_ssl=False  # использовать ли ssl-шифрование для соединения с smtp-сервером
from_mail_debug_level=0

#Whether to send core bug mail (out of entering in systems) to bug_mail_addr
#send_core_bug_mail=1

#default admin bug mail - if no filled in systems
bug_mail_addr='somebody@example.com'
bug_mail_host='example.com'
bug_mail_port=25
bug_mail_debug_level=1
bug_mail_coding='koi8-r'

trace_server_start=False

socket_host1='0.0.0.0'  #'0.0.0.0' - allow to listen any active interface, '127.0.0.1' - listen only itself
socket_host2='0.0.0.0'  #'0.0.0.0' - allow to listen any active interface, '127.0.0.1' - listen only itself

#in sec
sql_wait_min_exec_time=10 #if sql execute time great this, write to log
cgi_wait_min_exec_time=10 #if cgi execute time great this, write to log

upd_conf_location='/cron/devupd/service/upd_conf'
upd_location='/cron/devupd/service/start.sh'  # полный путь к стартовому скрипту апдейтера
upd_ssh_ip='127.0.0.1'  # хост, на котором располагается апдейтер
upd_ssh_port=22  # порт ssh
upd_ssh_user='user1'  # пользователь, которому разрешены беспарольные: доступ по ssh и sudo
upd_logs_dir='/cron/devupd/log'  # путь к папке логов апдейтера для их просмотра
upd_logs_regexps=[r'\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.(?:error|log|small)', r'\d{4}-\d{2}-\d{2}\.skud', r'log-\d{4}(?:-\d{2})?\.7z']  # регулярные выражения для имён файлов логов
upload_path_bids ='C:/engine/files/BIDS/'
hot_conf_location='C:/engine/conf/hot_conf.ini'

options_pattern_location="C:\engine\options\pattern\pattern.xml"
options_instances_subdir="C:\engine\options\instances"

#trace queries to Engine
trace_engine_input=False
trace_engine_output=False

#trace info about connections to dbs
trace_connections=False

#sorting viewed systems in the tree
systems_order=1  #0, None - by fields ORDERBY, SHOW_NAME; 1 - by field SHOW_NAME

#whether to start when map errors occured
start_on_map_errors=False

#global flag to send bug mail
global_send_bug_mail=False

#salt for verify connects from terminals
term_hash_salt='Egkkkijrgf,sdfsdffwegbjlERW$38340dioef'

#terminals
TERMINAL_link = '/KURSSKLAD/KURSTERM'
TERMINAL_LOGOFF_BARCODE = '7500292'
TERMINAL_START_PAGE = 'file:///Application/start.html'
TERMINAL_BARCODE_ASTERISKS = True
TERMINAL_GEN_DATE_TIME_FORMAT='%d.%m.%Y %H:%M'

#mobile
MOBILE_link = '/KURSSKLAD/WMSMOBILE'

#MAJOR DB CODE
MAJOR_DB_CODE = 'KURS'
#Процедура в MAJOR DB, проверяющая возможность закрытия терминалной сессии
MAJOR_DB_USER_SESSION_CLOSE_CHECK = 'K_USER_SESSION_CLOSE_CHECK'

#default Time format
time_format='%H:%M:%S'

# =======Блок загрузки файлов на сервер======================
# путь для загрузки файлов
UPLOAD_PATH = "c:\\UPLOAD"
# макс размер файла (в байтах)
UPLOAD_MAX_SIZE = 10485760
# глобальное ограничение на типы файлов, разрешаемые к загрузке
UPLOAD_FILE_TYPES = ['rar', 'zip', '7z']

# =======Блок настройки аккаунта======================
# поля, обязательные для регистрации
ACCOUNT_REG_REQUIRED_FIELDS = ['fio', 'login', 'passwd', 'passwd2', 'email', 'recaptcha']
# доступность ссылок, связанных с восстановлением пароля
ACCOUNT_PASSWORD_RECOVERY_ENABLED = True
# необходимость переустановить пароль пользователем при первом входе
ACCOUNT_NEED_PASSWORD_RESET = False

# =======Блок проверки юзер-агента=========================
# зависимости: httpagentparser

# разрешенные браузеры (десктоп)
UA_ALLOWED = [
        {
            'user-agent' : 'Microsoft Internet Explorer',
            'showname': 'Internet Explorer',
            'shortname': 'msie',
            'min_ver': '9.0',
            'max_ver': '',
            'recommend': True,
            'basic': False,
            'href': 'http://www.microsoft.com/windows/Internet-explorer/default.aspx'
        },
        {
            'user-agent' : 'Firefox',
            'showname': 'Mozilla Firefox',
            'shortname': 'firefox',
            'min_ver': '3.6.18',
            'max_ver': '',
            'recommend': True,
            'basic': True,
            'href': 'http://www.mozilla.com/firefox/'
        },
        {
            'user-agent' : 'Opera',
            'showname': 'Opera Browser',
            'shortname': 'opera',
            'min_ver': '9.0',
            'max_ver': '',
            'recommend': True,
            'basic': False,
            'href': 'http://www.opera.com/download/'
        },
        {
            'user-agent' : 'Safari',
            'showname': 'Apple Safari',
            'shortname': 'safari',
            'min_ver': '5.0',
            'max_ver': '',
            'recommend': True,
            'basic': False,
            'href': 'http://www.apple.com/safari/download/'
        },
        {
            'user-agent' : 'Chrome',
            'showname': 'Google Chrome',
            'shortname': 'chrome',
            'min_ver': '12.0',
            'max_ver': '',
            'recommend': True,
            'basic': False,
            'href': 'http://www.google.com/chrome'
        }
    ]
# юзер-агент терминального браузера (строка или список строк)
UA_TERMINAL_BROWSER = ['MSIE 6.0; Windows CE', 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)']
# юзер-агент мобильного браузера (строка или список строк)
UA_MOBILE_BROWSER = None
# разрешать ли работать дальше, если браузер не из списка разрешенных
UA_OTHER_ACCESS = True
# светить ли хедер-напоминание смены браузера в течение всей сессии, если браузер не в списке разрешенных
UA_OTHER_REMIND = True

# =======Локализация приложения===============================
# включить локализацию приложения
LOCALE_ON = True
# подключенные модули перевода
LOCALE_ALL = ['ru', 'uk']
# локаль по-умолчанию
LOCALE_DEFAULT = LOCALE_ALL[0]

# ==============СЛОИ========================
# Использовать ли слои при соединении с базами данных
USE_LAYERS = False
# Путь к базам данных слоёв
DBS_STORAGE='C:\engine\databases\storage'

# INFOBOX
INFOBOX_SERVER_PATH = "systems.SOMESYSTEM.INFOBOX"
INFOBOX_STATIC_PATH = "/SOMESYSTEM/INFOBOX"

# ==============Пробросы========================
# "проброс" по этим внутренним URL в порядке следования в зависимости от наличия прав пользователя на них
REDIRECT_LINKS = ['/SOMESYSTEM']
# "проброс" по этим внутренним URL после регистрации в порядке следования в зависимости от наличия прав пользователя на них
REDIRECT_LINKS_AFTER_REG = ['/SOMESYSTEM/SOMESUBSYSTEM']

# ==============Кодировки========================
# Кодировка выходного потока: 'cp1251'(она же 'windows-1251'), 'cp866', 'utf-8'
STDOUT_CODING = 'cp1251'
# Кодировка потока ошибок: 'cp1251'(она же 'windows-1251'), 'cp866', 'utf-8'
STDERR_CODING = 'cp1251'
# Кодировка контента: 'utf-8' или 'windows-1251'
CONTENT_CODING = 'windows-1251'

# ==============Трэкер задач========================
# Префикс для URL задачи трэкера задач
ISSUETRACKER_PREFIX_URL = 'http://redmine.rbsrandl.com:7000/redmine/issues/'
# Регулярное выражение, определяющее валидность номера задачи трэкера задач
ISSUETRACKER_VALID_REGEXP = r'^(|\d+)$'

# ==============Тестовый сервер========================
# Это сообщение, если заполнено (не '' и не None), будет показываться для индикации работы на тестовом/учебном сервере
TEST_MESSAGE = ''

# ==============Системное меню========================
# Появляется ли в системном меню ссылка на родительскую систему самого верхнего уровня
SHOW_TOP_SYSTEM_NAME = True

# ==============СКУД==================================
# Включить проверку СКУД при входе
SKUD_INTEGRATION = False
# Процедура в MAJOR DB, проверяющая возможность входа на основании данных СКУД
SKUD_MAJOR_DB_ACCESS_PROC = 'SKUD_ACCESS'
# Проверять ли доступ по данным СКУД при входе с PC
SKUD_CHECK_PC = False
# Проверять ли доступ по данным СКУД при входе с ТСД
SKUD_CHECK_TSD = True
# Проверять ли доступ по данным СКУД при входе с мобильного устройства
SKUD_CHECK_MOBILE = True

# ==============Аутентификация========================
AUTH_TYPE = 'db'  # 'python' - аутентификация в питоне, 'db' - аутентификация в БД
# Алгоритм вычисления хэша при проверке в python. При проверке в БД всегда md5.
AUTH_ALGORITHM = 'md5'  # md5, sha1, sha224, sha256, sha384, sha512
# Соль, добавляемая к паролю при вычислении хэша
AUTH_SALT = ''

# ==============Прокси================================
# Подменять ли хост и протокол для редиректов из заголовков прокси-сервера X-Forwarded-Host и X-Forwarded-Proto
# при False хост берется из прокси-заголовка Host, а протокол не подменяется
PROXY_HEADERS_REPLACE = False

# ==============Пароли================================
# Минимальная длина пароля
PWD_MIN_LEN = 6
# Оптимальная длина пароля для подсчёта его сложности
PWD_OPT_LEN = 9
# Запрещённые комбинации
PWD_FORBIDDEN_PWS = ['qwerty', 'asdfgh', 'zxcvbn,', '`12345', '`123456', 'ё12345', 'ё123456', 'йцукен', 'фывапр', 'ячсмит']
# Неободимые в пароле виды символов. Список элементов-строк: 'lowers' - символы нижнего регистра, 'uppers' -
# символы верхнего регистра, 'digits' - цифры, 'signs' - знаки. Например, PWD_NEED_SYMBOLS = ['lowers', 'uppers']
PWD_NEED_SYMBOLS = []

# ==============Active Directory======================
# Включить проверку пользователя/пароля в AD вместо движка
AD_INTEGRATION = False
# Путь к AD-серверу по протоколу ldap://
AD_SERVER = 'ldap://192.168.56.1'
# Домен, добавляемый через @ к логину для формирования полного имени пользователя
AD_DOMAIN = 'domain.ru'

# ==============Сообщения=============================
# Использовать дополнительные ajax-запросы для получения сообщений
USE_AJAX_GET_MSG = False
