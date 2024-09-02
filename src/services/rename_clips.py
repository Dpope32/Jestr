import os

# Adjust the path to point to the correct location of the 'memes_clips' folder
folder_path = os.path.join(os.path.dirname(__file__), '../assets/memes_clips')

# List all files in the folder and filter for .mp4 files
files = [f for f in os.listdir(folder_path) if f.lower().endswith('.mp4')]

# Sort files to ensure sequential order
files.sort()

# Use a temporary prefix to avoid conflicts
temp_prefix = "__temp__"

# Step 1: Rename all files to temporary names to avoid conflicts
for index, filename in enumerate(files, start=1):
    # Construct full file paths
    old_file = os.path.join(folder_path, filename)
    temp_file = os.path.join(folder_path, f"{temp_prefix}{index}.mp4")
    
    # Rename the file to a temporary name
    os.rename(old_file, temp_file)

# Step 2: Rename from temporary names to final names with 'd' prefix
for index in range(1, len(files) + 1):
    # Construct full file paths
    temp_file = os.path.join(folder_path, f"{temp_prefix}{index}.mp4")
    new_file = os.path.join(folder_path, f"d{index}.mp4")
    
    # Rename the file to the final desired name
    os.rename(temp_file, new_file)

print("Clips have been renamed successfully without conflicts!")
