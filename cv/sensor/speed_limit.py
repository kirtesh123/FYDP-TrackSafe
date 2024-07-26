import overpy

def get_speed_limit(radius, lat, lon):
    api = overpy.Overpass()
    query = f"""
    [out:json];
    way(around:{radius}, {lat}, {lon}) ["maxspeed"];
    out body;
    """
    result = api.query(query)
    
    if result.ways:
        # Get the first way's speed limit
        speed_limit = result.ways[0].tags.get("maxspeed", "No speed limit found")
        return speed_limit
    else:
        return "No speed limit found in the vicinity."

radius = 600
latitude = 43.881750  # Replace with actual latitude
longitude = -79.052206  # Replace with actual longitude
speed_limit = get_speed_limit(radius, latitude, longitude)
print(f"The speed limit at the given location is: {speed_limit}")

