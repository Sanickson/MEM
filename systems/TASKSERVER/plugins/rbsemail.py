# -*- coding: utf-8 -*-
"""
    swat 17.01.2014
    version 0.0.2.0
    класс работы с почтой
"""

import BasePlugin as BP
import rbssendemail as e


class Plugin(BP.BasePlugin):
    """
        класс работы с почтой
    """

    def run(self):
        """
            отправка почты
        """
        toaddress = self.ParserXML(self.queueparamsxml, 'toaddress')
        if toaddress is None:
            toaddress = self.ParserXML(self.taskparamsxml, 'to_address')
        subject = self.ParserXML(self.queueparamsxml, 'subject')
        if subject is None:
            subject = self.ParserXML(self.taskparamsxml, 'subject')
        a = e.Email(self,
                    smtp_server=self.ParserXML(self.taskparamsxml, 'smtpserver'),
                    port=self.ParserXML(self.taskparamsxml, 'port'),
                    username=self.ParserXML(self.taskparamsxml, 'username'),
                    password=self.ParserXML(self.taskparamsxml, 'password'),
                    from_address=self.ParserXML(self.taskparamsxml, 'fromaddress'),
                    use_tls=self.ParserXML(self.taskparamsxml, 'usetls'),
                    to_address=toaddress,
                    subject=subject,
                    message=self.ParserXML(self.queueparamsxml, 'message').replace('#1', '\n'))
        a.send_email()
