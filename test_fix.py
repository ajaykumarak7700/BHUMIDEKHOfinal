
try:
    # The garbage string from app.js line 1
    bad_text = "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥ à¤°à¤¤à¥€à¤•à¥ à¤·à¤¾ à¤•à¤°à¥‡à¤‚..."
    # Attempt to fix
    fixed_text = bad_text.encode('cp1252').decode('utf-8')
    print(f"Original: {bad_text}")
    print(f"Fixed:    {fixed_text}")
except Exception as e:
    print(f"Error: {e}")
