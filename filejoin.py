# -*- coding: utf-8 -*-
"""
Created on Tue Feb 14 11:54:49 2017
Combine the monthly files from http://www.transtats.bts.gov/DL_SelectFields.asp?Table_ID=236
Note: the downloads have trailing comma delimiter. This is to be removed before combining back


@author: Raju
"""
import pandas as pd

year = "2016"

file_in = ["data/"+year+"_01.csv", "data/"+year+"_02.csv", "data/"+year+"_03.csv",
           "data/"+year+"_04.csv", "data/"+year+"_05.csv", "data/"+year+"_06.csv",
           "data/"+year+"_07.csv", "data/"+year+"_08.csv", "data/"+year+"_09.csv",
           "data/"+year+"_10.csv", "data/"+year+"_11.csv", "data/"+year+"_12.csv"]

#Step 1: Remvoe the addl. CSV comma delimiter

for f_in in file_in:
    print("Removing trailing csv comma delimiter " + f_in)
    with open(f_in, 'r') as f:
        df = pd.read_csv(f)
    with open(f_in, 'w') as f:
        df[['YEAR','MONTH','ORIGIN','DEP_DELAY']].to_csv(f_in, index=False)
        
#Step 2: Join all files into singe year file
file_out = "data/"+year+".csv"
header = "Year,Month,Orign,DepDelay"

with open(file_out, 'w') as f_out:
    f_out.write(header+"\n")
with open(file_out, 'a') as f_out:
    for f_in in file_in:
        with open(f_in, 'r') as f:
            print(f.readline())
            f_out.write(f.read())