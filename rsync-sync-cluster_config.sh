#!/usr/bin/env bash
echo "RSYNC for cluster_config directory in progress..."

for i in 40 43 50
do
    echo "Syncing cluster_config to 10.10.1.$i"
    rsync -avz --progress -e ssh /opt/cassandra-dev/cluster_config/ \
        root@10.10.1.$i:/opt/cassandra-dev/cluster_config/

    rsync -avz --progress -e ssh /opt/cassandra-dev/cluster_stress_test/ \
            root@10.10.1.$i:/opt/cassandra-dev/cluster_stress_test/






done


