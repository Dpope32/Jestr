import boto3
import uuid
import random
from datetime import datetime, timezone

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Memes')

BUCKET_NAME = 'jestr-meme-uploads'
S3_PREFIX = 'Memes/'
EMAIL = 'pope.dawson@gmail.com'

# Caption generation logic (simplified version of what you provided)
def generate_caption():
    captions = [
        ["Lol", "Hahahahaha", "Bruh", "Mood", "Same", "Yikes", "Oof", "Nice", "Cool", "Wow", 
         "Epic", "Lit", "Savage", "Facts", "Yas", "OK", "Chill", "Sweet", "Damn", "Word", 
         "Sure", "Fire", "Bet", "Flex", "Sus", "Vibes", "Dope", "Slay", "Jk", "Fam"],  # One word

        ["No way!", "So true!", "I can't even", "Why though?", "Not again!", "Just perfect", "Totally me", 
         "For real?", "Is this real?", "What a mood", "Can't believe", "So accurate", "How though?", 
         "It's true!", "You know it", "Pure chaos", "It me", "Too funny", "What a vibe", "On point", 
         "Why me?", "So done", "Big mood", "Who relates?", "So random", "In shock", "Out of words", 
         "Total win", "This slaps", "Love it"],  # Two words

        ["😂", "🤣", "😅", "😆", "🙃", "😎", "🤔", "🤷‍♂️", "🤦‍♀️", "🙈", 
         "😜", "😝", "😇", "🥳", "🤪", "🤡", "🤯", "💀", "👀", "😤", 
         "🔥", "💯", "😏", "😳", "👻", "🤨", "😱", "😲", "😴", "🙄"],  # Emojis

        ["This is hilarious!", "I'm dying right now!", "Who made this?", "Tag someone who relates!", "Can't stop laughing!", 
         "OMG this!", "Literally me!", "This is gold!", "So much truth!", "I'm screaming!", 
         "I needed this!", "This just made my day!", "Rolling on the floor!", "How do you come up with these?", 
         "The best thing ever!", "This is everything!", "Can't unsee this!", "Laughing so hard!", 
         "Someone tag me in this!", "Why is this so accurate?", "Crying of laughter!", "This is too good!", 
         "This right here!", "My sides hurt!", "Pure comedy!", "This never gets old!", 
         "How is this so relatable?", "Can't even breathe!", "Best meme today!", "This is genius!"],  # Short sentences

        ["When you realize it's only Tuesday...", "That moment when you forget your phone...", "Me trying to adult like...", 
         "When your Wi-Fi stops working mid-stream...", "When you're waiting for Friday like...", 
         "Me after hitting snooze for the 7th time...", "When you find out you were right all along...", 
         "Me trying to remember what day it is...", "When someone eats your leftovers...", 
         "That awkward moment when you say 'you too'...", "When you're too tired to function but have to adult...", 
         "Me realizing I spent all weekend doing nothing productive...", "When the weekend goes by too fast...", 
         "Me trying to understand adulting...", "When you realize you need to pay bills again...", 
         "When you're late but stop for coffee anyway...", "When you have to go back to work after a vacation...", 
         "Me pretending to care about things I don't...", "When you tell yourself 'just one more episode'...", 
         "When your phone battery dies at the worst time...", "When you realize you left your headphones at home...", 
         "Me trying to wake up in the morning...", "When someone calls you instead of texting...", 
         "When you finally get home and take off your shoes...", "When you see your ex with someone else...", 
         "Me realizing I have to be an adult today...", "When your friend cancels plans last minute...", 
         "When you're waiting for your Amazon package...", "Me after one productive day...", 
         "When you realize the weekend is over..."],  # Relatable phrases

        ["#meme #funny #lol #humor #relatable", "#comedy #jokes #memesdaily #funnyaf #trending", 
         "#lmao #rofl #memeoftheday #haha #mood", "#bestoftheday #dailyhumor #relatabledaily #haha #hilarious", 
         "#funnymemes #memegram #instamemes #lolz #viral", "#memelord #dailymemes #chuckle #instagood #explore", 
         "#memedaily #humorgram #funnyvideos #trendymemes #memehumor", "#funnyposts #memelife #instahumor #memeoftheweek #memejunkie", 
         "#memeinspo #dailyjokes #memeaddict #instajoke #laughs", "#funnytext #funnyquotes #dailyfunnyposts #lolhumor #memehub", 
         "#hahahahaha #relatablestuff #memeexplosion #instamemehub #memebase", "#funnymoments #viralhumor #memeuniverse #memecomedy #lmaoquotes", 
         "#memeclub #memecommunity #memevibes #hahaha #funnydaily"],  # Hashtags

        ["Have you ever noticed how [insert observation]? It's like the universe is trolling us!", 
         "Why is it that whenever you're late, every red light is out to get you?", 
         "Is it just me, or does everything taste better when someone else makes it?", 
         "Why is adulting so hard? Asking for a friend.", 
         "Ever wonder if cats secretly judge us? Because they definitely do.", 
         "Why does it always rain right after you wash your car?", 
         "Have you ever had one of those days where everything just feels off?", 
         "Why does coffee never taste as good at home as it does at a café?", 
         "Have you ever had a random memory from 10 years ago suddenly pop up out of nowhere?", 
         "Is it just me, or do Monday mornings come way too quickly?", 
         "Why do the days before vacation feel longer than the vacation itself?", 
         "Have you ever noticed how your best ideas come when you're about to fall asleep?", 
         "Why do we always remember things we forgot after we're already out the door?", 
         "Isn't it funny how we only crave certain foods when they're not in the house?", 
         "Why do the things we need to do the most always seem the hardest to start?", 
         "Why do we say 'be right back' when we know it'll be hours?", 
         "Have you ever wondered why time seems to fly when you're having fun?", 
         "Why do we always wake up early on the weekends but struggle on weekdays?", 
         "Isn't it weird how we remember the most random things at the strangest times?", 
         "Why is it that the best TV shows always get canceled?", 
         "Why does the Wi-Fi always seem to act up at the worst possible moment?", 
         "Isn't it strange how you can never find the remote when you need it?", 
         "Have you ever noticed how one chore always leads to another?", 
         "Why does every grocery store trip always cost more than you planned?", 
         "Isn't it funny how time slows down when you're in a hurry?", 
         "Have you ever noticed how the longest line always seems to move the slowest?", 
         "Why do we always say 'one more episode' and end up watching three?", 
         "Why does the weekend always feel shorter than it really is?", 
         "Is it just me, or do the best ideas always come in the shower?", 
         "Why does everything look better after a good night's sleep?"],  # Questions

        ["This meme is brought to you by the committee of people who can't adult properly. We meet on Tuesdays, or whenever we remember.",
         "If memes could pay bills, we'd all be rich. But alas, here we are, just surviving on humor.",
         "The only thing keeping me going is knowing that somewhere, someone is laughing at this meme too.",
         "In a world full of chaos, memes are the only thing that make sense. At least to me, anyway.",
         "This meme was handcrafted with 100% organic, free-range humor. No artificial laughs added.",
         "If laughter is the best medicine, then this meme is basically a prescription for happiness.",
         "This meme brought to you by the 'I need a break from adulting' club. Meetings are held at random intervals.",
         "They say laughter is contagious. So if you laugh at this, you're legally required to share it.",
         "The only exercise I get is running away from responsibilities and laughing at memes.",
         "If memes were currency, I'd be a millionaire. But until that day, I'll just keep laughing for free.",
         "This meme is your reminder that you're doing great, even if adulting is hard sometimes.",
         "The official sponsor of my sanity is this meme. Because, let's face it, life is crazy.",
         "This meme is brought to you by the Department of Humor, where nothing makes sense, but everything is funny.",
         "Welcome to the meme zone, where the jokes are bad, but the laughs are real.",
         "In a perfect world, memes would be mandatory for everyone. But until then, enjoy this one.",
         "This meme was carefully curated for your entertainment. No refunds, all sales final.",
         "Laughing at memes is my cardio. Who needs the gym when you have humor like this?",
         "This meme is brought to you by the 'Procrastination Society'. We'll get to our tasks eventually.",
         "If life gives you lemons, make lemonade. But if life gives you memes, laugh like there's no tomorrow.",
         "This meme is my way of saying 'I relate' without actually saying anything."],  # Long sentences
    ]
    return random.choice(random.choice(captions))

def process_memes():
    paginator = s3.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=BUCKET_NAME, Prefix=S3_PREFIX):
        for obj in page.get('Contents', []):
            if obj['Key'].lower().endswith('.mp4'):
                old_key = obj['Key']
                new_key = f"{S3_PREFIX}{EMAIL}-meme-{str(uuid.uuid4())}.mp4"
                
                # Rename the file in S3
                s3.copy_object(Bucket=BUCKET_NAME, CopySource=f"{BUCKET_NAME}/{old_key}", Key=new_key)
                s3.delete_object(Bucket=BUCKET_NAME, Key=old_key)
                
                # Check if entry exists in DynamoDB
                response = table.get_item(Key={'MemeID': new_key.split('/')[-1]})
                if 'Item' not in response:
                    # Create new entry in DynamoDB
                    new_item = {
                        'MemeID': new_key.split('/')[-1],
                        'Caption': generate_caption(),
                        'CommentCount': 0,
                        'DownloadCount': random.randint(23, 211),
                        'Email': EMAIL,
                        'LikeCount': random.randint(401, 30000),
                        'MediaType': 'video',
                        'MemeURL': f"https://{BUCKET_NAME}.s3.amazonaws.com/{new_key}",
                        'ProfilePicUrl': 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/pope.dawson@gmail.com-profilePic-1719862276108.jpg',
                        'ShareCount': random.randint(29, 3225),
                        'Status': 'active',
                        'Tags': [
                            {'S': 'Dank'}, 
                            {'S': 'Admin'}, 
                            {'S': 'Video'}, 
                            {'S': 'VideoMeme'}, 
                            {'S': 'ShortVideo'}, 
                            {'S': 'TT'}
                        ],
                        'UploadTimestamp': '2024-09-10T05:00:00.000Z',
                        'Username': 'Admin'
                    }
                    table.put_item(Item=new_item)
                
                print(f"Processed: {old_key} -> {new_key}")

if __name__ == "__main__":
    process_memes()