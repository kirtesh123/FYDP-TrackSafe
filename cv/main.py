# main.py
from driver.driverCV import driverCV
from driver.video import download_video
from dotenv import load_dotenv
import os
import mysql.connector
import sys
from datetime import datetime

from road.roadCV import run_road_cv

load_dotenv()

def main():
    # --- Driver Session Processing ---
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
    if driver_data is None:
        print("No session data generated.")
        sys.exit(1)

    eyes_closed_count = len(driver_data['eyes_closed_times'])
    head_turn_count = len(driver_data['long_head_turn_times'])
    time_started = driver_data["time_start"]
    time_ended = driver_data["time_end"]

    try:
        time_started_obj = datetime.strptime(time_started, "%Y-%m-%d %H:%M:%S")
        time_ended_obj = datetime.strptime(time_ended, "%Y-%m-%d %H:%M:%S")
        time_started_sql = time_started_obj.strftime("%H:%M:%S")
        time_ended_sql = time_ended_obj.strftime("%H:%M:%S")
    except ValueError as e:
        print(f"Time conversion error: {e}")
        sys.exit(1)

    proximity_warnings_vehicles = 5  
    proximity_warnings_pedestrians = 3 
    speed_violations = 2  
    traffic_violations = 1  

    driver_name = driver_data.get("driver_name")
    if not driver_name:
        print("Driver name not found in session data.")
        sys.exit(1)

    cursor.execute("SELECT KeyID, currentScore FROM Drivers WHERE name = %s", (driver_name,))
    result = cursor.fetchone()
    if result is None:
        print(f"Error: Driver with name '{driver_name}' not found!")
        sys.exit(1)
    else:
        driver_id = result[0]
        previous_score = result[1]
        base_score = 100
        penalty = (5 * eyes_closed_count) + (2 * head_turn_count)
        new_current_score = base_score - penalty
        if new_current_score < 0:
            new_current_score = 0

        update_query = """
        UPDATE Drivers 
        SET previousScore = %s, currentScore = %s 
        WHERE KeyID = %s
        """
        try:
            cursor.execute(update_query, (previous_score, new_current_score, driver_id))
            conn.commit()
            print("Driver scores updated successfully.")
        except mysql.connector.Error as err:
            print(f"Failed to update driver data: {err}")
            sys.exit(1)

    insert_query_sessions = """
    INSERT INTO Sessions (KeyID, time_started, time_ended,
                          proximity_warnings_vehicles, proximity_warnings_pedestrians,
                          speed_violations, eyes_closed_count, traffic_violations, long_head_turn_count)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.execute(
            insert_query_sessions, 
            (
                driver_id,
                time_started_sql, 
                time_ended_sql,
                proximity_warnings_vehicles, 
                proximity_warnings_pedestrians,
                speed_violations, 
                eyes_closed_count, 
                traffic_violations, 
                head_turn_count
            )
        )
        conn.commit()
        print("Session data inserted successfully.")
    except mysql.connector.Error as err:
        print(f"Failed to insert data into Sessions: {err}")
        sys.exit(1)

    cursor.execute("SELECT * FROM Drivers WHERE KeyID = %s", (driver_id,))
    updated_driver = cursor.fetchone()
    print("\nUpdated driver record:")
    print(updated_driver)

    cursor.execute("SELECT * FROM Sessions WHERE KeyID = %s", (driver_id,))
    sessions = cursor.fetchall()
    print("\nInserted session data for driver with KeyID {}:".format(driver_id))
    for session in sessions:
        print(session)

    # --- Road CV Processing ---
    # Call your partner's road CV processing function
    close_object_count = run_road_cv()
    print(f"\nRoad CV - Close object count: {close_object_count}")

    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
