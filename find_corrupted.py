import re

file_path = r'c:\Users\PC\Desktop\BHUMI2\app.js'
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.readlines()

for i, line in enumerate(content):
    if '???' in line:
        print(f"Line {i+1}: {line.strip()}")
