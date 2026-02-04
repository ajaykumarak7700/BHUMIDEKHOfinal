
import os

file_path = r'c:\Users\HP\Desktop\BHUMI2\app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = [
    '    window.shareProperty = (id) => {\n',
    '        const p = State.properties.find(x => x.id === id);\n',
    '        if (!p) return;\n',
    "        const appName = (State.settings.appName || 'BhumiDekho').replace(/<[^>]*>?/gm, '');\n",
    '        const msg = `🏠 *${p.title}*\\n\\n` +\n',
    '            `💰 Price: ₹ ${p.price}\\n` +\n',
    '            `📍 City: ${p.city}\\n` +\n',
    '            `📐 Area: ${p.area}\\n` +\n',
    '            `🏗️ Type: ${p.category}\\n\\n` +\n',
    '            `📝 *Description:* ${p.description}\\n\\n` +\n',
    "            (p.video ? `🎥 Video: ${p.video}\\n` : '') +\n",
    "            (p.map ? `🗺️ Map: ${p.map}\\n` : '') +\n",
    '            `📞 Contact: ${p.mobile}\\n\\n` +\n',
    '            `Shared via ${appName}`;\n',
    '        \n',
    '        if (navigator.share) {\n',
    '            navigator.share({ title: p.title, text: msg })\n',
    "                .catch(() => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank'));\n",
    '        } else {\n',
    "            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');\n",
    '        }\n',
    '    };\n'
]

# We want to replace lines 1640-1660 (0-indexed 1639 to 1659)
# In my previous view_file, 1640 was 'window.shareProperty = (id) => {'
# Let's find the indices
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if 'window.shareProperty = (id) => {' in line and 1630 < i < 1650:
        start_idx = i
    if start_idx != -1 and '};' in line and i > start_idx:
        # Looking for the closing brace of the share function
        # Based on view_file, it's at line 1660
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    lines[start_idx:end_idx+1] = new_content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f"Successfully replaced rows {start_idx+1} to {end_idx+1}")
else:
    print(f"Failed to find indices: {start_idx=}, {end_idx=}")
