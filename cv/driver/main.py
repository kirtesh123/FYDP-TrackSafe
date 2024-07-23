import cv2
import numpy as np
import time

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

def track_features(cap, face_cascade, eye_cascade):
    eyes_closed_times = []
    long_head_turn_times = []
    start_time = time.time()
    face_visible = False
    face_disappeared_time = start_time  # Initialize at the start to prevent UnboundLocalError
    eyes_last_closed_time = None  

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        current_time = time.time() - start_time
        if len(faces) == 0:
            if face_visible:
                face_visible = False
                face_disappeared_time = time.time()
            elif not face_visible and time.time() - face_disappeared_time > 5:
                long_head_turn_times.append(format_time(current_time))
                print(f"Long head turn detected at {format_time(current_time)}")
                face_disappeared_time = time.time()
        else:
            if not face_visible:
                face_visible = True

            eyes_detected = False
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                face_roi = gray[y:y+h, x:x+w]
                eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.05, minNeighbors=8, minSize=(20, 20))

                for (ex, ey, ew, eh) in eyes:
                    cv2.rectangle(frame, (x + ex, y + ey), (x + ex + ew, y + ey + eh), (0, 255, 0), 2)
                    eyes_detected = True

            if not eyes_detected and face_visible:
                if not eyes_last_closed_time:
                    eyes_last_closed_time = time.time()
                elif time.time() - eyes_last_closed_time > 3:
                    eyes_closed_times.append(format_time(current_time))
                    print(f"Eyes closed detected at {format_time(current_time)}")
                    eyes_last_closed_time = None  # Reset after logging
            elif eyes_detected:
                eyes_last_closed_time = None  # Reset when eyes are detected

        cv2.imshow('Face and Eye Detection', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return {'eyes_closed_times': eyes_closed_times, 'long_head_turn_times': long_head_turn_times}

def main():
    face_cascade, eye_cascade = initialize_cascades()
    print("Choose the mode: \n1. Webcam \n2. Video File")
    choice = input("Enter your choice (1 or 2): ")

    if choice == '1':
        cap = configure_camera(0)  # Webcam
    elif choice == '2':
        video_file = input("Enter the path to your video file: ")
        cap = configure_camera(video_file)
    else:
        print("Invalid choice.")
        return

    session_data = track_features(cap, face_cascade, eye_cascade)
    print(f"Session Data: {session_data}")

if __name__ == '__main__':
    main()
