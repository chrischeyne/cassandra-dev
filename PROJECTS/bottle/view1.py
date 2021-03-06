#!/opt/python2.7.2/bin/python


import logging
import sys
import json
import bottle as bot
sys.path.append('/opt/cassandra-dev/cluster_config')
import sqlite3

from CLUSTER_ENVIRONMENT import *

# taken from https://github.com/derwiki/scripts/blob/master/server.py
bot.debug(True)
log = logging.getLogger('servlet')
log.setLevel(logging.DEBUG)

@route('/todo')
def todo_list():
    conn = sqlite3.connect('todo.db')
    c = conn.cursor()
    c.execute("select id,task from todo where status like '1'")
    result = c.fetchall()
    return str(result)



port = sys.argv[1] if len(sys.argv) > 1 else 8080
bot.run(host='0.0.0.0', port=port)
