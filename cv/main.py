# main.py
from driver.driverCV import driverCV
from driver.video import download_video
from dotenv import load_dotenv
import os
import mysql.connector
import sys
from datetime import datetime

from road.roadCV import run_road_cv
from sensor.speed_limit import get_speed_violations

load_dotenv()

def calculate_driver_score(eyes_closed_count, head_turn_count, proximity_warnings_vehicles, 
                           proximity_warnings_pedestrians, speed_violations, traffic_violations):
    base_score = 100
    score = base_score


    penalty_eyes = 0
    if eyes_closed_count > 0:
        for i in range(1, eyes_closed_count + 1):
            if i <= 3:
                penalty_eyes += 4
            elif i <= 6:
                penalty_eyes += 5
            else:
                penalty_eyes += 6

   
    penalty_head = 0
    if head_turn_count > 0:
        for i in range(1, head_turn_count + 1):
            if i % 2 == 0:
                penalty_head += 3
            else:
                penalty_head += 2

  
    penalty_proximity_vehicles = proximity_warnings_vehicles * 4
    penalty_proximity_pedestrians = proximity_warnings_pedestrians * 6


    penalty_speed = 0
    for i in range(speed_violations):
        penalty_speed += 7 + (i * 2)

   
    penalty_traffic = traffic_violations * 10

 
    total_penalty = (penalty_eyes + penalty_head + penalty_proximity_vehicles +
                     penalty_proximity_pedestrians + penalty_speed + penalty_traffic)

  
    final_score = base_score - total_penalty
    if final_score < 0:
        final_score = 0


    if (eyes_closed_count == 0 and head_turn_count == 0 and 
        proximity_warnings_vehicles == 0 and proximity_warnings_pedestrians == 0 and 
        speed_violations == 0 and traffic_violations == 0):
        final_score += 5


    if total_penalty > 50:
        reduction = int(total_penalty * 0.1)
        final_score -= reduction
        if final_score < 0:
            final_score = 0

    final_score = int(round(final_score))
    print(final_score)

    breakdown = {
        "base_score": base_score,
        "penalty_eyes": penalty_eyes,
        "penalty_head": penalty_head,
        "penalty_proximity_vehicles": penalty_proximity_vehicles,
        "penalty_proximity_pedestrians": penalty_proximity_pedestrians,
        "penalty_speed": penalty_speed,
        "penalty_traffic": penalty_traffic,
        "total_penalty": total_penalty,
        "final_score": final_score
    }

    # Simulate an external factor adjustment
    external_factor = 1.05
    final_score = int(final_score * external_factor)
    if final_score > base_score:
        final_score = base_score

    return final_score, breakdown

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

    # Constants for other violations
    proximity_warnings_vehicles = run_road_cv()
    proximity_warnings_pedestrians = 3
    speed_violations = get_speed_violations()  
    traffic_violations = 1

    print(f"\nRoad CV - Close car count: {proximity_warnings_vehicles}")

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
        
  
        new_current_score, breakdown = calculate_driver_score(
            eyes_closed_count, 
            head_turn_count, 
            proximity_warnings_vehicles, 
            proximity_warnings_pedestrians, 
            speed_violations, 
            traffic_violations
        )

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


    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
