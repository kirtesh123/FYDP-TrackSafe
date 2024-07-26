from driver.driverCV import driverCV
from driver.video import download_video
from dotenv import load_dotenv
import os
import mysql.connector
import sys

load_dotenv()
def main():
    # Connect to the MySQL database
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            port=os.getenv('DB_PORT')
        )
        cursor = conn.cursor()
        print("Database connection was successful")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        sys.exit(1)  

  
    driver_data = driverCV()
    length_eyes_closed = len(driver_data['eyes_closed_times'])
    length_head_turns = len(driver_data['long_head_turn_times'])

    #dummy data
    key_id = 1 
    session_id = 124
    time_started = '08:00:00' 
    time_ended = '09:00:00'  
    proximity_warnings_vehicles = 5  
    proximity_warnings_pedestrians = 3 
    speed_violations = 2  
    traffic_violations = 1  

  
    insert_query = """
    INSERT INTO Sessions (KeyID, sessionID, time_started, time_ended,
                          proximity_warnings_vehicles, proximity_warnings_pedestrians,
                          speed_violations, eyes_closed_count, traffic_violations, long_head_turn_count)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    try:
        cursor.execute(insert_query, (key_id, session_id, time_started, time_ended,
                                      proximity_warnings_vehicles, proximity_warnings_pedestrians,
                                      speed_violations, length_eyes_closed, traffic_violations, length_head_turns))
        conn.commit()  
        print("Data inserted successfully")
    except mysql.connector.Error as err:
        print(f"Failed to insert data: {err}")

    
    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
