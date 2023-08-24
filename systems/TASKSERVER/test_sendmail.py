# -*- coding: utf-8 -*-

import plugins.rbssendemail as e

print(e)
"""
   <path value="D:/work/repo/taskserver-source/examples/bank/"/>
    <smtp_server value="smtp.yandex.ru"/>
    <port value="465"/>
    <username_ value="billing@litebox.ru"/>
    <username value="s.katasonov@litebox.ru"/>
    <password_ value="1q2w3e4R"/>
    <password value="1q2w3e4R"/>
    <from_address value="billing@litebox.ru"/>
    <use_tls value="1"/>
    <to_address value="s.katasonov@litebox.ru"/>
"""


class EmSend():
    def __init__(self):
        try:
            a = e.Email(self,
                        smtp_server='smtp.yandex.ru',
                        port='465',
                        username='s.katasonov@litebox.ru',
                        password='1q2w3e4R',
                        from_address='s.katasonov@litebox.ru',
                        use_tls='1',
                        to_address='katasonov.stas@gmail.com',
                        subject='Тема письма',
                        message='test mes')
            print('1')
            print(a)
            print('2')
            if not a.send_email():
                print('3')
                print('not send')
            else:
                print('4')
                print('send')
        except Exception as exc:
            print('5')
            print(exc)


if __name__ == "__main__":
    es = EmSend()
