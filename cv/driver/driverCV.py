import cv2
import numpy as np
import time
import os
import uuid
from driver.video import download_video


def initialize_cascades():
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    if face_cascade.empty() or eye_cascade.empty():
        raise IOError("Failed to load cascade files")
    return face_cascade, eye_cascade


def configure_camera(source):
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise IOError(f"Cannot open source {source}")
    return cap


def format_time(timestamp):
    """Converts a timestamp to a formatted string in minutes and seconds."""
    minutes = int(timestamp / 60)
    seconds = int(timestamp % 60)
    return f"{minutes}:{seconds:02}"


def convert_to_seconds(timestr):
    """Converts a time string 'mm:ss' to total seconds."""
    minutes, seconds = map(int, timestr.split(':'))
    return minutes * 60 + seconds


'''
def track_features_webcam(cap, face_cascade, eye_cascade):
    eyes_closed_times = []
    long_head_turn_times = []
    start_time = time.time()
    face_visible = False
    face_disappeared_time = start_time
    eyes_last_closed_time = None
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30), flags=cv2.CASCADE_SCALE_IMAGE)
        current_time = time.time() - start_time

        if len(faces) == 0:
            if face_visible:
                face_visible = False
                face_disappeared_time = time.time()
        else:
            x, y, w, h = faces[0]  # Consider only the largest face
            face_visible = True
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            face_roi = gray[y:y+int(h*0.5), x:x+w]
            eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=8, minSize=(20, 20))

            eyes_detected = False
            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(frame, (x + ex, y + ey), (x + ex + ew, y + ey + eh), (0, 255, 0), 2)
                eyes_detected = True

            if not eyes_detected and face_visible:
                if not eyes_last_closed_time:
                    eyes_last_closed_time = time.time()
                elif time.time() - eyes_last_closed_time > 3:
                    eyes_closed_times.append(format_time(current_time))
                    print(f"Eyes closed detected at {format_time(current_time)}")
                    eyes_last_closed_time = None
            elif eyes_detected:
                eyes_last_closed_time = None

        cv2.imshow('Face and Eye Detection', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return {'eyes_closed_times': eyes_closed_times, 'long_head_turn_times': long_head_turn_times}
'''


def track_features_video(cap, face_cascade, eye_cascade):
    eyes_closed_times = []
    long_head_turn_times = []
    quit_pressed = False  # Flag to indicate if user pressed "q" to quit.
   
    start_time = time.time()
    eyes_last_closed_time = None
    last_face_seen_time = time.time()  
    head_turn_started = False

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Finished")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced_gray = clahe.apply(gray)

        
        faces = face_cascade.detectMultiScale(enhanced_gray, scaleFactor=1.1, minNeighbors=7, minSize=(50, 50))
        current_time = time.time() - start_time

       
        if len(faces) == 0:
            if not head_turn_started:
                head_turn_started = time.time()
        else:
            if head_turn_started and (time.time() - head_turn_started > 2):
                long_head_turn_times.append(format_time(current_time))
                print(f"Long head turn detected at {format_time(current_time)}")
            head_turn_started = False  

        
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)

            face_roi = enhanced_gray[y:y+int(h*0.5), x:x+w]
            eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.05, minNeighbors=10, minSize=(20, 20))

            valid_eyes = []
            for (ex, ey, ew, eh) in eyes:
                aspect_ratio = ew / eh
                if 0.75 < aspect_ratio < 1.25:
                    valid_eyes.append((ex, ey, ew, eh))
                    cv2.rectangle(frame, (x + ex, y + ey), (x + ex + ew, y + ey + eh), (0, 255, 0), 2)

         
            if len(valid_eyes) < 2:
                if not eyes_last_closed_time:
                    eyes_last_closed_time = time.time()
                elif time.time() - eyes_last_closed_time > 2:
                    eyes_closed_times.append(format_time(current_time))
                    print(f"Eyes closed detected at {format_time(current_time)}")
                    eyes_last_closed_time = None
            else:
                eyes_last_closed_time = None

        cv2.imshow('Face and Eye Detection', frame)
  
        if cv2.waitKey(int(1000/30)) & 0xFF == ord('q'):
            quit_pressed = True
            break

    cap.release()
    cv2.destroyAllWindows()

  
    cleaned_times = []
    if eyes_closed_times:
        last_time = convert_to_seconds(eyes_closed_times[0])
        cleaned_times.append(eyes_closed_times[0])
        for time_str in eyes_closed_times[1:]:
            current_sec = convert_to_seconds(time_str)
            if current_sec - last_time >= 3.1:
                cleaned_times.append(time_str)
                last_time = current_sec

    return {
        'eyes_closed_times': cleaned_times,
        'long_head_turn_times': long_head_turn_times
    }


def driverCV():
    face_cascade, eye_cascade = initialize_cascades()

    bucket_name = 'driver-cam-footage'
    file_name = 'Kevin_driver_cam_2025-03-04_22-34-25.mp4'


    if not file_name.endswith('.mp4'):
        print("Please enter a filename with a .mp4 extension.")
    else:
        local_directory = './'
        # Download video.
        download_video(bucket_name, file_name, local_directory)
        video_path = os.path.join(local_directory, file_name)

     
        if os.path.exists(video_path):
            cap = configure_camera(video_path)
            processing_start = time.time()  
            session_data = track_features_video(cap, face_cascade, eye_cascade)
            processing_end = time.time()   
    
            # Clean up video file 
            os.remove(video_path)
            print("Video file has been deleted after processing.")
        else:
            print("Failed to download the video file.")
            if os.path.exists(video_path):
                os.remove(video_path)
            return None


    session_data["time_start"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(processing_start))
    session_data["time_end"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(processing_end))
    

    driver_name = file_name.split('_')[0]
    session_data["driver_name"] = driver_name

    print(f"Session Data (with metadata): {session_data}")
    return session_data

if __name__ == '__main__':
    driverCV()

'''
face_cascade, eye_cascade = initialize_cascades()
print("Choose the mode: \n1. Webcam \n2. Video File")
choice = input("Enter your choice (1 or 2): ")

if choice == '1':
    cap = configure_camera(0)  # Webcam
    session_data = track_features_webcam(cap, face_cascade, eye_cascade)
elif choice == '2':
    bucket_name = 'fydp-videos'
    file_name = input("Please enter the filename: ")
    local_directory = './'
    
    # Download video file
    download_video(bucket_name, file_name, local_directory)
    video_path = os.path.join(local_directory, file_name)

    # Check  download 
    if os.path.exists(video_path):
        cap = configure_camera(video_path)
        session_data = track_features_video(cap, face_cascade, eye_cascade)
        
        # Clean up
        os.remove(video_path)
        print("Video file has been deleted after processing.")
    else:
        print("Failed to download the video file.")
else:
    print("Invalid choice.")
    return

print(f"Session Data: {session_data}")
'''
