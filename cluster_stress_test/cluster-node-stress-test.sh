#!/bin/bash

# BUBBLE FOR STRESS TESTING




# Mon Oct 17 09:53:14 BST 2011
# FIXME: source ../CLUSTER_ENVIRONMENT.sh

export PYTHONHOME=/opt/python2.7.2
export JAVA_HOME=/opt/jdk1.6.0_27
CASSHOME="/opt/cassandra-dev"
STRESSHOME="$CASSHOME/cluster_stress_test"
STRESSBIN="$CASSHOME/SOFTWARE/apache-cassandra-0.8.6-src/tools/stress/bin/stress"
MYIP=`ifconfig eth1 | sed -n '/dr:/{;s/.*dr://;s/ .*//;p}'`
HOST=`hostname -f`
DATE=`date +%d%m%Y__:%H%M`
FILE=$STRESSHOME+$HOST+$DATE

echo $STRESSBIN
echo $STRESSHOME
echo $FILE
echo "Stress testing $MYIP..."
exec $STRESSBIN -k -d ${MYIP} -p 9159 | tee $FILE
echo "..DONE"




