import boto3 # type: ignore
import random
from botocore.exceptions import ClientError # type: ignore

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-2')
table = dynamodb.Table('Memes')

# List of caption types and examples
caption_types = [
    [],  # Empty caption
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
     "When your Wi-Fi stops working mid-stream...", "When you’re waiting for Friday like...", 
     "Me after hitting snooze for the 7th time...", "When you find out you were right all along...", 
     "Me trying to remember what day it is...", "When someone eats your leftovers...", 
     "That awkward moment when you say 'you too'...", "When you’re too tired to function but have to adult...", 
     "Me realizing I spent all weekend doing nothing productive...", "When the weekend goes by too fast...", 
     "Me trying to understand adulting...", "When you realize you need to pay bills again...", 
     "When you’re late but stop for coffee anyway...", "When you have to go back to work after a vacation...", 
     "Me pretending to care about things I don’t...", "When you tell yourself ‘just one more episode’...", 
     "When your phone battery dies at the worst time...", "When you realize you left your headphones at home...", 
     "Me trying to wake up in the morning...", "When someone calls you instead of texting...", 
     "When you finally get home and take off your shoes...", "When you see your ex with someone else...", 
     "Me realizing I have to be an adult today...", "When your friend cancels plans last minute...", 
     "When you’re waiting for your Amazon package...", "Me after one productive day...", 
     "When you realize the weekend is over..."],  # Relatable phrases

    ["#meme #funny #lol #humor #relatable", "#comedy #jokes #memesdaily #funnyaf #trending", 
     "#lmao #rofl #memeoftheday #haha #mood", "#bestoftheday #dailyhumor #relatabledaily #haha #hilarious", 
     "#funnymemes #memegram #instamemes #lolz #viral", "#memelord #dailymemes #chuckle #instagood #explore", 
     "#memedaily #humorgram #funnyvideos #trendymemes #memehumor", "#funnyposts #memelife #instahumor #memeoftheweek #memejunkie", 
     "#memeinspo #dailyjokes #memeaddict #instajoke #laughs", "#funnytext #funnyquotes #dailyfunnyposts #lolhumor #memehub", 
     "#hahahahaha #relatablestuff #memeexplosion #instamemehub #memebase", "#funnymoments #viralhumor #memeuniverse #memecomedy #lmaoquotes", 
     "#memeclub #memecommunity #memevibes #hahaha #funnydaily"],  # Hashtags

    ["Have you ever noticed how [insert observation]? It's like the universe is trolling us!", 
     "Why is it that whenever you’re late, every red light is out to get you?", 
     "Is it just me, or does everything taste better when someone else makes it?", 
     "Why is adulting so hard? Asking for a friend.", 
     "Ever wonder if cats secretly judge us? Because they definitely do.", 
     "Why does it always rain right after you wash your car?", 
     "Have you ever had one of those days where everything just feels off?", 
     "Why does coffee never taste as good at home as it does at a café?", 
     "Have you ever had a random memory from 10 years ago suddenly pop up out of nowhere?", 
     "Is it just me, or do Monday mornings come way too quickly?", 
     "Why do the days before vacation feel longer than the vacation itself?", 
     "Have you ever noticed how your best ideas come when you’re about to fall asleep?", 
     "Why do we always remember things we forgot after we’re already out the door?", 
     "Isn’t it funny how we only crave certain foods when they’re not in the house?", 
     "Why do the things we need to do the most always seem the hardest to start?", 
     "Why do we say ‘be right back’ when we know it’ll be hours?", 
     "Have you ever wondered why time seems to fly when you’re having fun?", 
     "Why do we always wake up early on the weekends but struggle on weekdays?", 
     "Isn’t it weird how we remember the most random things at the strangest times?", 
     "Why is it that the best TV shows always get canceled?", 
     "Why does the Wi-Fi always seem to act up at the worst possible moment?", 
     "Isn’t it strange how you can never find the remote when you need it?", 
     "Have you ever noticed how one chore always leads to another?", 
     "Why does every grocery store trip always cost more than you planned?", 
     "Isn’t it funny how time slows down when you’re in a hurry?", 
     "Have you ever noticed how the longest line always seems to move the slowest?", 
     "Why do we always say ‘one more episode’ and end up watching three?", 
     "Why does the weekend always feel shorter than it really is?", 
     "Is it just me, or do the best ideas always come in the shower?", 
     "Why does everything look better after a good night's sleep?"],  # Questions

    ["This meme is brought to you by the committee of people who can't adult properly. We meet on Tuesdays, or whenever we remember.",
     "If memes could pay bills, we'd all be rich. But alas, here we are, just surviving on humor.",
     "The only thing keeping me going is knowing that somewhere, someone is laughing at this meme too.",
     "In a world full of chaos, memes are the only thing that make sense. At least to me, anyway.",
     "This meme was handcrafted with 100% organic, free-range humor. No artificial laughs added.",
     "If laughter is the best medicine, then this meme is basically a prescription for happiness.",
     "This meme brought to you by the ‘I need a break from adulting’ club. Meetings are held at random intervals.",
     "They say laughter is contagious. So if you laugh at this, you’re legally required to share it.",
     "The only exercise I get is running away from responsibilities and laughing at memes.",
     "If memes were currency, I'd be a millionaire. But until that day, I’ll just keep laughing for free.",
     "This meme is your reminder that you’re doing great, even if adulting is hard sometimes.",
     "The official sponsor of my sanity is this meme. Because, let's face it, life is crazy.",
     "This meme is brought to you by the Department of Humor, where nothing makes sense, but everything is funny.",
     "Welcome to the meme zone, where the jokes are bad, but the laughs are real.",
     "In a perfect world, memes would be mandatory for everyone. But until then, enjoy this one.",
     "This meme was carefully curated for your entertainment. No refunds, all sales final.",
     "Laughing at memes is my cardio. Who needs the gym when you have humor like this?",
     "This meme is brought to you by the ‘Procrastination Society’. We’ll get to our tasks eventually.",
     "If life gives you lemons, make lemonade. But if life gives you memes, laugh like there's no tomorrow.",
     "This meme is my way of saying ‘I relate’ without actually saying anything."],  # Long sentences
]


# Function to generate a random caption
def generate_caption():
    caption_type = random.choice(caption_types)
    if not caption_type:
        return ""
    elif isinstance(caption_type[0], str):
        return random.choice(caption_type)
    else:
        return " ".join(random.sample(caption_type, random.randint(1, len(caption_type))))

# Function to update meme captions
def update_meme_captions():
    try:
        response = table.scan()
        items = response['Items']
        
        for item in items:
            meme_id = item['MemeID']
            new_caption = generate_caption()
            
            try:
                table.update_item(
                    Key={'MemeID': meme_id},
                    UpdateExpression="set Caption = :c",
                    ExpressionAttributeValues={':c': new_caption},
                    ReturnValues="UPDATED_NEW"
                )
                print(f"Updated MemeID: {meme_id} with caption: {new_caption}")
            except ClientError as e:
                print(f"Couldn't update item {meme_id}. Here's why: {e.response['Error']['Message']}")
        
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items = response['Items']
            
            for item in items:
                meme_id = item['MemeID']
                new_caption = generate_caption()
                
                try:
                    table.update_item(
                        Key={'MemeID': meme_id},
                        UpdateExpression="set Caption = :c",
                        ExpressionAttributeValues={':c': new_caption},
                        ReturnValues="UPDATED_NEW"
                    )
                    print(f"Updated MemeID: {meme_id} with caption: {new_caption}")
                except ClientError as e:
                    print(f"Couldn't update item {meme_id}. Here's why: {e.response['Error']['Message']}")
    
    except ClientError as e:
        print(f"Couldn't scan table. Here's why: {e.response['Error']['Message']}")

# Run the update function
update_meme_captions()