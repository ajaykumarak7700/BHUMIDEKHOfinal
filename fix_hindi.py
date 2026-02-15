
import os

file_path = r'c:\Users\HP\Desktop\BHUMI2\app.js'

with open(file_path, 'rb') as f:
    content = f.read()

# The corrupted text is likely UTF-8 bytes interpreted as Windows-1252/Latin-1
# Example: 'खेती योग्य जमीन' in UTF-8 is b'\xe0\xa4\x96\xe0\xa5\x87\xe0\xa4\xa4\xe0\xa5\x80 \xe0\xa4\xaf\xe0\xa5\x8b\xe0\xa4\x97\xe0\xa5\x8d\xe0\xa4\xaf \xe0\xa4\x9c\xe0\xa4\xae\xe0\xa5\x80\xe0\xa4\xa8'
# When viewed as Latin-1, this looks like 'à¤–à¥‡à¤¤à¥€ à¤¯à¥‹à¤—à¥ à¤¯ à¤œà¤®à¥€à¤¨'

corrupted_1 = 'à¤–à¥‡à¤¤à¥€ à¤¯à¥‹à¤—à¥ à¤¯ à¤œà¤®à¥€à¤¨'.encode('latin-1')
fixed_1 = 'खेती योग्य जमीन'.encode('utf-8')

corrupted_2 = 'à¤¯à¤¹ à¤œà¤®à¥€à¤¨ à¤¶à¤¹à¤° à¤¸à¥‡ 5 à¤•à¤¿à¤²à¥‹à¤®à¥€à¤Ÿà¤° à¤¦à¥‚à¤° à¤¸à¥ à¤¥à¤¿à¤¤ à¤¹à¥ˆà¥¤ à¤‡à¤¸à¤•à¥‡ à¤†à¤¸à¤ªà¤¾à¤¸ à¤¸à¥ à¤•à¥‚à¤² à¤”à¤° à¤…à¤¸à¥ à¤ªà¤¤à¤¾à¤² à¤‰à¤ªà¤²à¤¬à¥ à¤§ à¤¹à¥ˆà¤‚à¥¤'.encode('latin-1')
fixed_2 = 'यह जमीन शहर से 5 किलोमीटर दूर स्थित है। इसके आसपास स्कूल और अस्पताल उपलब्ध हैं।'.encode('utf-8')

new_content = content.replace(corrupted_1, fixed_1)
new_content = new_content.replace(corrupted_2, fixed_2)

if new_content != content:
    with open(file_path, 'wb') as f:
        f.write(new_content)
    print("Successfully fixed Hindi text.")
else:
    print("Could not find corrupted text with exact byte match. Trying alternative...")
    # Maybe it's already UTF-8 but the tool is displaying it weirdly?
    # No, the user said it's converted to another language.
