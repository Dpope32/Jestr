import boto3
from boto3.dynamodb.conditions import Attr
import logging
import random
from datetime import datetime, timedelta
import math

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Memes')

EMAIL = 'pope.dawson@gmail.com'

def generate_caption():
    if random.random() < 0.7:  # 70% chance of blank caption
        return ""
    
    captions = [
        ["Lol", "Hahahahaha", "Bruh", "Mood", "Same", "Yikes", "Oof", "Nice", "Cool", "Wow"],
        ["😂", "🤣", "😅", "😆", "🙃", "😎", "🤔", "🤷‍♂️", "🤦‍♀️", "🙈"],
        ["When you realize it's only Tuesday...", "That moment when you forget your phone...", "Me trying to adult like..."],
        ["#meme #funny #lol #humor #relatable", "#comedy #jokes #memesdaily #funnyaf #trending"],
        ["This meme is brought to you by the committee of people who can't adult properly.",
         "If memes could pay bills, we'd all be rich. But alas, here we are, just surviving on humor."]
    ]
    return random.choice(random.choice(captions))

def generate_random_timestamp():
    start = datetime(2023, 1, 1)
    end = datetime(2025, 3, 31)
    random_date = start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))
    return random_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')

def beta_distribution_int(a, b, scale):
    return math.floor(random.betavariate(a, b) * scale)

def generate_share_count():
    # Using beta distribution to favor lower values, max around 200
    return beta_distribution_int(1.2, 4, 200)

def generate_download_count():
    # Using beta distribution to favor even lower values, max around 100
    return beta_distribution_int(1, 5, 100)

def update_meme(item):
    try:
        update_expression = """
        SET Caption = :caption,
            CommentCount = :comment_count,
            DownloadCount = :download_count,
            Email = :email,
            LikeCount = :like_count,
            ProfilePicUrl = :profile_pic_url,
            ShareCount = :share_count,
            #status_field = :status,
            UploadTimestamp = :upload_timestamp,
            Username = :username
        """
        
        expression_attribute_names = {
            '#status_field': 'Status'
        }
        
        expression_values = {
            ':caption': generate_caption(),
            ':comment_count': 0,
            ':download_count': generate_download_count(),
            ':email': EMAIL,
            ':like_count': random.randint(0, 1337),
            ':profile_pic_url': 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/pope.dawson@gmail.com-profilePic-1719862276108.jpg',
            ':share_count': generate_share_count(),
            ':status': 'active',
            ':upload_timestamp': generate_random_timestamp(),
            ':username': 'Anon'
        }
        
        table.update_item(
            Key={'MemeID': item['MemeID']},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_values
        )
        logger.info(f"Updated MemeID: {item['MemeID']}")
        return True
    except Exception as e:
        logger.error(f"Error updating MemeID {item['MemeID']}: {str(e)}")
        return False

def update_memes():
    # Scan for items with blank email
    scan_kwargs = {
        'FilterExpression': Attr('Email').eq('') | Attr('Email').not_exists(),
        'ProjectionExpression': 'MemeID'
    }
    
    response = table.scan(**scan_kwargs)
    items = response.get('Items', [])
    
    if not items:
        logger.info("No memes found with blank email.")
        return
    
    # Update the first item
    first_item = items[0]
    success = update_meme(first_item)
    
    if not success:
        logger.error("Failed to update the first meme. Exiting.")
        return
    
    # Ask for confirmation to continue
    user_input = input("Do you want to update the rest of the memes? (yes/no): ").lower()
    if user_input != 'yes':
        logger.info("Update process stopped after the first meme.")
        return
    
    # Update the rest of the items
    updated_count = 1  # We've already updated one
    for item in items[1:]:
        if update_meme(item):
            updated_count += 1
    
    logger.info(f"Total memes updated: {updated_count}")

if __name__ == "__main__":
    logger.info("Starting update process for memes with blank email")
    update_memes()
    logger.info("Update process completed")