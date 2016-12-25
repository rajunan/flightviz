# -*- coding: utf-8 -*-
"""
Created on Sun Dec 11 18:38:27 2016

@author: Raju
"""

### TODO: filter out non USA rows

import pandas as pd
import numpy as np

#write_mode = 'w' #For first pass dont append
write_mode = 'a' #For first pass dont append

#file_in = ["data/2008 sample.csv", "data/2008 sample.csv"]
file_in = [ "data/2008.csv", "data/2007.csv","data/2006.csv","data/2005.csv",
            "data/2004.csv", "data/2003.csv","data/2002.csv","data/2001.csv",
            "data/2000.csv"]

file_out = "data/flights by month.csv"

#Airport to state
with open('data/airports.csv', 'r') as airp_f:
    airp = pd.read_csv(airp_f)[['iata','state','country','lat','long']]
print('airports to state loaded')

#Average DepartureDelay at Origin
for f in file_in:
    with open(f,'r') as csv_f_in:
        df = pd.read_csv(csv_f_in)
        df_by = df.groupby(['Year','Month'])
        result_df = df_by['DepDelay'].agg({
            'MeanDepDelay':np.mean,
            'StdDepDelay':np.std}).reset_index()
        print(result_df.head())        
    print(f +' extraction complete')
    if write_mode == 'w':  
        with open(file_out, mode=write_mode) as csv_f_out:
            result_df.to_csv(csv_f_out, index=False)
        write_mode = 'a'
    else:
        with open(file_out, mode=write_mode) as csv_f_out:
            result_df.to_csv(csv_f_out, header=False, index=False)
        

#TODO For later to show as choropleth map
#avgDepDelays = result_df.join(airp.set_index('iata'),on='Origin')
#print(avgDepDelays.head())
#ArrivalDelay at Dest
