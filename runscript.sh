#!/bin/bash
####################################
#
# START FLASK SERVER ON PYTHON
#
####################################
export FLASK_APP=app.py
export FLASK_ENV=debug

IPTRIMMED=$(hostname -I | cut -d' ' -f1)
flask run --host=$IPTRIMMED