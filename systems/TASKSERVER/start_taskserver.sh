#!/bin/bash
[[ `ps -efww | grep runserver.py | grep -v grep` ]] || (python3 -u ./runserver.py  >> ./log/stdout.log &)