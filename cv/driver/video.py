import os
import boto3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def download_video(bucket_name, file_name, local_directory):
    s3 = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION')
    )

    
    if not os.path.exists(local_directory):
        os.makedirs(local_directory)


    local_path = os.path.join(local_directory, file_name)
    print(f"Downloading {file_name} to {local_path}...")

  
    s3.download_file(bucket_name, file_name, local_path)
    print(f"Downloaded {file_name}")

def main():
    bucket_name = 'fydp-videos'
    file_name = 'test_video.mp4'
    local_directory = './'
    download_video(bucket_name, file_name, local_directory)

if __name__ == '__main__':
    main()
