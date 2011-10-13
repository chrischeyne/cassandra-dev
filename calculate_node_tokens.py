#!/usr/bin/env python

# -- GENERATE NODE TOKENS
import sys
    
if (len(sys.argv) > 1):	
	nodes=int(sys.argv[1])
else:
	nodes=int(raw_input("No of nodes? : "))

f = open('NODE_TOKENS.txt','wb')
for i in xrange(nodes):
    data = 'node %d: %d' % (i,2 ** 127 /nodes * i)
    print data
    f.write(data+'\n')

f.close()


