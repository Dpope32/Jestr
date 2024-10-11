import boto3
import logging
from botocore.exceptions import ClientError

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize AWS clients
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')

# Constants
S3_BUCKET = 'jestr-meme-uploads'
S3_FOLDER = 'Memes'
DYNAMO_TABLE = 'Memes'
MAX_LABELS = 5

def detect_labels(bucket, key):
    logger.info(f"Detecting labels for image: {key}")
    try:
        response = rekognition.detect_labels(
            Image={'S3Object': {'Bucket': bucket, 'Name': key}},
            MaxLabels=MAX_LABELS,
            MinConfidence=70
        )
        return [label['Name'] for label in response['Labels']]
    except ClientError as e:
        logger.error(f"Error detecting labels: {e}")
        return []

def detect_text(bucket, key):
    logger.info(f"Detecting text for image: {key}")
    try:
        response = rekognition.detect_text(
            Image={'S3Object': {'Bucket': bucket, 'Name': key}}
        )
        detected_text = ' '.join([text['DetectedText'] for text in response['TextDetections'] if text['Type'] == 'LINE'])
        return detected_text[:100] if detected_text else ""
    except ClientError as e:
        logger.error(f"Error detecting text: {e}")
        return ""

def process_image(key):
    tags = detect_labels(S3_BUCKET, key)
    text = detect_text(S3_BUCKET, key)
    
    # Ensure we have exactly 5 tags
    tags = tags[:MAX_LABELS]
    while len(tags) < MAX_LABELS:
        tags.append("Unclassified")
    
    # Create the item for DynamoDB
    item = {
        'MemeID': key,
        'Tags': tags,
        'DetectedText': text
    }
    
    update_dynamo_item(item)

def update_dynamo_item(item):
    logger.info(f"Updating DynamoDB item for image: {item['MemeID']}")
    table = dynamodb.Table(DYNAMO_TABLE)
    try:
        response = table.put_item(Item=item)
        logger.info(f"DynamoDB update successful for image: {item['MemeID']}")
    except ClientError as e:
        logger.error(f"Error updating DynamoDB: {e}")

def main():
    logger.info("Starting meme tagging process")
    
    # Get all images from S3
    s3_objects = s3.list_objects_v2(Bucket=S3_BUCKET, Prefix=S3_FOLDER)
    for obj in s3_objects.get('Contents', []):
        if obj['Key'].lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            process_image(obj['Key'])
    
    logger.info("All meme tagging completed")

if __name__ == "__main__":
    main()