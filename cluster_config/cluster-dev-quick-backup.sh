#!/usr/bin/env bash
# BACKUP BUBBLE FOR QUICK SHELL BACKUPS



CASSANDRA_HOME=/opt/cassandra-dev
cd $CASSANDRA_HOME


tar -cpvzf BACKUP/cassandra-dev-ALL-`date '+%d-%B-%Y'`.tar.gz \
    --exclude ${CASSANDRA_HOME}/cassandra-dev-data \
    --exclude ${CASSANDRA_HOME}/cassandra-dev-backup \
    --exclude ${CASSANDRA_HOME}/SCRATCH \
    --exclude ${CASSANDRA_HOME}/SOFTWARE \
    --exclude ${CASSANDRA_HOME}/temp \
    --exclude ${CASSANDRA_HOME}/log \
    --exclude ${CASSANDRA_HOME}/run $CASSANDRA_HOME 



