from driver.driverCV import driverCV
from driver.video import download_video
from dotenv import load_dotenv
import os
import mysql.connector
import sys

load_dotenv()

def main():
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

    length_eyes_closed = len(driver_data['eyes_closed_times'])
    length_head_turns = len(driver_data['long_head_turn_times'])

    key_id = driver_data["key_id"]
    session_id = driver_data["session_id"]
    time_started = driver_data["time_start"]
    time_ended = driver_data["time_end"]


    proximity_warnings_vehicles = 5  
    proximity_warnings_pedestrians = 3 
    speed_violations = 2  
    traffic_violations = 1  

    # 1. Insert into Sessions table
    insert_query_sessions = """
    INSERT INTO Sessions (KeyID, sessionID, time_started, time_ended,
                          proximity_warnings_vehicles, proximity_warnings_pedestrians,
                          speed_violations, eyes_closed_count, traffic_violations, long_head_turn_count)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    try:
        cursor.execute(
            insert_query_sessions, 
            (
                key_id, 
                session_id, 
                time_started, 
                time_ended,
                proximity_warnings_vehicles, 
                proximity_warnings_pedestrians,
                speed_violations, 
                length_eyes_closed, 
                traffic_violations, 
                length_head_turns
            )
        )
        conn.commit()
        print("Data inserted into Sessions successfully.")
    except mysql.connector.Error as err:
        print(f"Failed to insert data into Sessions: {err}")


    dummy_name = "John Doe"
    dummy_password = "testpassword"
    dummy_email = "john.doe@example.com"
    dummy_phone = "1234567890"
    dummy_region = "Region A"
    dummy_car_model = "Toyota Corolla"
    dummy_current_score = 85   # Dummy current score
    dummy_previous_score = 80  # Dummy previous score

    insert_query_drivers = """
    INSERT INTO Drivers (KeyID, name, password, email, phoneNumber, region, carModel, currentScore, previousScore)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    try:
        cursor.execute(
            insert_query_drivers, 
            (
                key_id, 
                dummy_name, 
                dummy_password, 
                dummy_email, 
                dummy_phone, 
                dummy_region, 
                dummy_car_model, 
                dummy_current_score, 
                dummy_previous_score
            )
        )
        conn.commit()
        print("Data inserted into Drivers successfully.")
    except mysql.connector.Error as err:
        print(f"Failed to insert data into Drivers: {err}")

    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
