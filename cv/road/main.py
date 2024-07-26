import cv2
import numpy as np
import boto3
import io
import tempfile
import os
from dotenv import load_dotenv

load_dotenv()

def get_video_from_s3():
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    response = s3_client.get_object(Bucket='road-cam-footage', Key='cv_test.mp4')
    return response['Body'].read()


# Load YOLOv3 weights and configuration
net = cv2.dnn.readNet('yolov3-tiny.weights', 'yolov3-tiny.cfg')

# Load COCO class names
with open('coco.names', 'r') as f:
    classes = [line.strip() for line in f.readlines()]

# Get the output layer names
layer_names = net.getLayerNames()
try:
    output_layers = [layer_names[i[0] - 1] for i in net.getUnconnectedOutLayers()]
except IndexError:
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

# Function to estimate distance based on bounding box size
def estimate_distance(bbox, frame_width, frame_height):
    x, y, w, h = bbox
    bbox_height = h
    # Assume an arbitrary height for a pedestrian/car at 5 meters distance
    reference_height = frame_height / 3
    estimated_distance = (reference_height / bbox_height) * 5  # Scaling factor for 5 meters
    return estimated_distance

def process_video(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    close_object_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        frame_height, frame_width = frame.shape[:2]

        # Define regions for front and beside detection
        front_region = (frame_width // 3, 2 * frame_width // 3)  # Middle third of the frame
        left_region = (0, frame_width // 3)                      # Left third of the frame
        right_region = (2 * frame_width // 3, frame_width)       # Right third of the frame

        # Prepare the frame for YOLOv3
        blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
        net.setInput(blob)
        outs = net.forward(output_layers)

        class_ids = []
        confidences = []
        boxes = []

        # Process YOLOv3 output
        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > 0.5 and classes[class_id] == 'car':
                    center_x = int(detection[0] * frame_width)
                    center_y = int(detection[1] * frame_height)
                    w = int(detection[2] * frame_width)
                    h = int(detection[3] * frame_height)
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)

        # Apply non-max suppression
        indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)

        for i in range(len(boxes)):
            if i in indexes:
                x, y, w, h = boxes[i]
                label = str(classes[class_ids[i]])
                distance = estimate_distance([x, y, w, h], frame_width, frame_height)

                # Check if the car is in the front region within 5 meters
                if front_region[0] <= x <= front_region[1] and distance <= 25:
                    print("Car infront too close", close_object_count)
                    close_object_count += 1
                    # Draw a red line from the camera to the car
                    center_x = x + w // 2
                    center_y = y + h // 2
                    cv2.line(frame, (frame_width // 2, frame_height), (center_x, center_y), (0, 0, 255), 2)
                
                # Check if the car is in the side regions within 15 meters
                elif (left_region[0] <= x <= left_region[1] or right_region[0] <= x <= right_region[1]) and distance <= 15:
                    print("Car beside too close", close_object_count)
                    close_object_count += 1
                    # Draw a red line from the camera to the car
                    center_x = x + w // 2
                    center_y = y + h // 2
                    cv2.line(frame, (frame_width // 2, frame_height), (center_x, center_y), (0, 0, 255), 2)

                # Draw bounding box
                color = (255, 0, 0)
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, f'{label} {distance:.2f}m', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # Display the frame
        cv2.imshow('Frame', frame)

        # Break the loop on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return close_object_count

video_data = get_video_from_s3()
temp_video_path = ""
# Write video data to a temporary file
with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
    temp_video.write(video_data)
    temp_video_path = temp_video.name
video_path = 'video.mp4'

close_count = process_video(temp_video_path)
# print(f'Number of times a car was within 5 meters in front or 15 meters beside: {close_count}')

