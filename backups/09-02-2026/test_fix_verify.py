
try:
    with open('c:/Users/HP/.gemini/antigravity/scratch/BHUMIDEKHOfinal/app.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for correct modal implementation
    if 'window.editExploreCard = function(index)' in content and 'safeTitle' in content:
        print("editExploreCard looks patched.")
    else:
        print("editExploreCard NOT patched.")

    if 'window.saveExploreCard = function(index)' in content and 'length <= index' in content:
        print("saveExploreCard looks present.")
    else:
        print("saveExploreCard NOT patched.")
        
except Exception as e:
    print(f"Error: {e}")
