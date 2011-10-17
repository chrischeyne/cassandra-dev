#!/opt/python2.7.2/bin/python


import logging
import sys
import json
import bottle as bot
sys.path.append('/opt/cassandra-dev/cluster_config')

from CLUSTER_ENVIRONMENT import *

# taken from https://github.com/derwiki/scripts/blob/master/server.py
bot.debug(True)
log = logging.getLogger('servlet')
log.setLevel(logging.DEBUG)

# Example route:
#@route('/play')
#def play():
#    encoded_path = request.GET.get('path', '')
#    path = urllib.pathname2url(encoded_path)
#    if not os.path.exists(path): # False on empty string
#        return dict(success=False, reason="Path %s does not exist" % path)
#    return dict(success=True)


port = sys.argv[1] if len(sys.argv) > 1 else 8080
bot.run(host='0.0.0.0', port=port)
