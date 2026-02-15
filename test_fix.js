
const bad_text = "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥ à¤°à¤¤à¥€à¤•à¥ à¤·à¤¾ à¤•à¤°à¥‡à¤‚...";
try {
    // Treat the string as binary (latin1) and decode as utf-8
    const buffer = Buffer.from(bad_text, 'latin1');
    const fixed_text = buffer.toString('utf8');
    console.log("Original:", bad_text);
    console.log("Fixed:   ", fixed_text);
} catch (e) {
    console.error(e);
}
