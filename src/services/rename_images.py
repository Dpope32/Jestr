import os

# Adjust the path to point to the correct location of the 'memes' folder
folder_path = os.path.join(os.path.dirname(__file__), '../assets/memes')

# List all files in the folder and filter for .jpg or .jpeg files
files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg'))]

# Sort files to ensure sequential order
files.sort()

# Iterate over the sorted files and rename them sequentially
for index, filename in enumerate(files, start=1):
    # Create the new filename with sequential numbering
    new_filename = f"{index}.jpeg"
    
    # Construct full file paths
    old_file = os.path.join(folder_path, filename)
    new_file = os.path.join(folder_path, new_filename)
    
    # Rename the file
    os.rename(old_file, new_file)

print("Files have been renamed successfully!")
