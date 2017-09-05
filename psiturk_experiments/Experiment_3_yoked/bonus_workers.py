from __future__ import division
import pandas as pd
import sqlite3
from collections import defaultdict
import operator
import json
from joblib import Memory
import numpy as np
import statsmodels as smo
import statsmodels.api as sm
import statsmodels.formula.api as smf
import seaborn as sns
from glob import glob

def bonus(g):
    data_file = g 
    conn = sqlite3.connect(data_file)
    c = conn.cursor()
    c.execute("SELECT workerid, assignmentid, datastring FROM active_physics WHERE status == 4 AND datastring IS NOT NULL AND codeversion = 'experiment_3'")
    players = []
    for row in c.fetchall():
        worker_id = str(row[0])
        assignment_id = str(row[1])
        questiondata = json.loads(row[2])['questiondata']
        winnings = questiondata['winnings']
        yield worker_id, assignment_id, winnings

# done
# files =  ["participants.db"]

message = 'Bonus for MIT Active Physics Learning task. Thank you'
out = ''
total = 0
for f in files:
    for wid, aid, w in bonus(f):
        if w <= 1:
            continue
        m = './grantBonus.sh -workerid ' + wid + ' -amount ' + str(w/100) + ' -assignment ' + aid + ' -reason "' + message + '"\n'
        m += "echo ' --done bonusing participant number " + str(wid) + "' \n"
        out += m
        total += w

print total
outfile = open('bonusscript.sh', "w")
outfile.write("#!/usr/bin/env sh\npushd " + "'/Users/tobi/Dropbox (MIT)/work/projects/active_physics_learning/code/java/Experiment_3/aws-mturk-clt-1.3.1/bin'\n" + out + "popd")
outfile.close()
        