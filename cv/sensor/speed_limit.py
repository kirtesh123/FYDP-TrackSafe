import overpy
import pandas as pd
import numpy as np
from geopy.distance import geodesic

RADIUS = 600

def get_speed_limit(radius, lat, lon):
    api = overpy.Overpass()
    query = f"""
    [out:json];
    way(around:{radius}, {lat}, {lon}) ["maxspeed"];
    out body;
    """
    result = api.query(query)
    
    if result.ways:
        speed_limit = result.ways[0].tags.get("maxspeed", "No speed limit found")
        return speed_limit
    else:
        return "No speed limit found in the vicinity."


import pandas as pd
import numpy as np
from geopy.distance import geodesic

def compute_speeds(csv_filename):
    df = pd.read_csv(csv_filename)
    
    df = df.sort_values(by='timestamp')
    
    speeds_with_midpoints = []
    
    for i in range(len(df) - 1):
        row1, row2 = df.iloc[i], df.iloc[i + 1]
        
        coord1 = (row1['latitude'], row1['longitude'])
        coord2 = (row2['latitude'], row2['longitude'])
        distance_km = geodesic(coord1, coord2).km
        
        time_diff_hours = (row2['timestamp'] - row1['timestamp']) / 3600.0
        
        speed_kmh = distance_km / time_diff_hours if time_diff_hours > 0 else 0
        
        mid_latitude = (row1['latitude'] + row2['latitude']) / 2
        mid_longitude = (row1['longitude'] + row2['longitude']) / 2
        midpoint = (mid_latitude, mid_longitude)
        
        speeds_with_midpoints.append((speed_kmh, midpoint))
    
    return speeds_with_midpoints


def get_speed_violations():
    speeds = compute_speeds("sensor/data.csv")
    violations = 0
    for speed in speeds:
        curr_speed = speed[0]
        max_speed = int(get_speed_limit(RADIUS, speed[1][0], speed[1][1]))
        if curr_speed > max_speed:
            print(f"Speed Violation at lat:{speed[1][0]} lon:{speed[1][1]}. Current Speed: {curr_speed}, Maximum Speed: {max_speed}")
            violations += 1
    return violations

