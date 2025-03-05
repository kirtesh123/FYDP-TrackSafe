import os
import cv2
import numpy as np
import boto3
import io
import tempfile
from dotenv import load_dotenv

load_dotenv()


base_dir = os.path.dirname(os.path.abspath(__file__))

weights_path = os.path.join(base_dir, 'yolov3-tiny.weights')
config_path = os.path.join(base_dir, 'yolov3-tiny.cfg')
names_path = os.path.join(base_dir, 'coco.names')

net = cv2.dnn.readNet(weights_path, config_path)

with open(names_path, 'r') as f:
    classes = [line.strip() for line in f.readlines()]

layer_names = net.getLayerNames()
try:
    output_layers = [layer_names[i[0] - 1] for i in net.getUnconnectedOutLayers()]
except Exception:
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

def get_video_from_s3():
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    response = s3_client.get_object(Bucket='road-cam-footage', Key='cv_test.mp4')
    return response['Body'].read()

def estimate_distance(bbox, frame_width, frame_height):
    """
    Estimate distance based on bounding box size.
    (This is approximate and depends on camera calibration!)
    """
    x, y, w, h = bbox
    bbox_height = h

    reference_height = frame_height / 3
    estimated_distance = (reference_height / bbox_height) * 5
    return estimated_distance


def within_pixel_distance(x1, y1, x2, y2, threshold=50):
    """
    Returns True if the Euclidean distance between (x1, y1) and (x2, y2)
    is less than 'threshold' pixels.
    """
    dist = ((x1 - x2)**2 + (y1 - y2)**2) ** 0.5
    return dist < threshold

def process_video(video_path):
    cap = cv2.VideoCapture(video_path)
    

    front_left_x_ratio = 0.25
    front_right_x_ratio = 0.75


    front_distance_threshold = 20.0

    close_object_count = 0


    recent_detections = []  # List of (center_x, center_y, frame_idx)
    frame_index = 0
    retention_frames = 30  

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame_index += 1

        frame_height, frame_width = frame.shape[:2]

      
        front_left_x = int(front_left_x_ratio * frame_width)
        front_right_x = int(front_right_x_ratio * frame_width)


        recent_detections = [
            (cx, cy, fi)
            for (cx, cy, fi) in recent_detections
            if fi > frame_index - retention_frames
        ]


        blob = cv2.dnn.blobFromImage(
            frame, scalefactor=0.00392, size=(416, 416),
            mean=(0, 0, 0), swapRB=True, crop=False
        )
        net.setInput(blob)
        outs = net.forward(output_layers)

        class_ids = []
        confidences = []
        boxes = []

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
                    x = int(center_x - w // 2)
                    y = int(center_y - h // 2)
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)

       
        indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)

        for i in range(len(boxes)):
            if i not in indexes:
                continue

            x, y, w, h = boxes[i]
            distance = estimate_distance([x, y, w, h], frame_width, frame_height)

         
            center_x_obj = x + w // 2
            center_y_obj = y + h // 2

           
            if front_left_x <= x <= front_right_x and distance <= front_distance_threshold:
          
                already_counted = any(
                    within_pixel_distance(center_x_obj, center_y_obj, rx, ry, 50)
                    for (rx, ry, fi) in recent_detections
                )
                if not already_counted:
                    close_object_count += 1
                    print(f"Car in front too close (distance ~ {distance:.1f}m). Count={close_object_count}")
                 
                    recent_detections.append((center_x_obj, center_y_obj, frame_index))


                    cv2.line(
                        frame,
                        (frame_width // 2, frame_height),
                        (center_x_obj, center_y_obj),
                        (0, 0, 255), 2
                    )

    
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
            cv2.putText(
                frame, f"Car {distance:.1f}m",
                (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX,
                0.5, (255, 0, 0), 2
            )

        cv2.imshow('Frame', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return close_object_count

def run_road_cv():
    video_data = get_video_from_s3()
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
        temp_video.write(video_data)
        temp_video_path = temp_video.name

    close_count = process_video(temp_video_path)

    # Remove the temp video after processing if desired.
    os.remove(temp_video_path)
    return close_count

if __name__ == '__main__':
    run_road_cv()
