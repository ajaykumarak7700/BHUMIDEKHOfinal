with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep only first 1706 lines (0-1705)
clean_lines = lines[:1706]

with open('app.js', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print("File cleaned successfully!")
