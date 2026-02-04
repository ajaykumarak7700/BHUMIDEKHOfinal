
$filePath = "c:\Users\HP\Desktop\BHUMI2\app.js"
$content = Get-Content -Path $filePath -Encoding UTF8
$newContent = @()
$foundStart = $false
$foundEnd = $false
$startIndex = -1
$endIndex = -1

for ($i = 0; $i -lt $content.Length; $i++) {
    if ($content[$i] -like "*window.shareProperty = (id) => {*" -and $i -gt 1630 -and $i -lt 1650) {
        $startIndex = $i
        $foundStart = $true
    }
    if ($foundStart -and $content[$i] -eq "    };" -and $i -gt $startIndex) {
        $endIndex = $i
        $foundEnd = $true
        break
    }
}

if ($foundStart -and $foundEnd) {
    $shareMessage = '    window.shareProperty = (id) => {
        const p = State.properties.find(x => x.id === id);
        if (!p) return;
        const appName = (State.settings.appName || "BhumiDekho").replace(/<[^>]*>?/gm, "");
        const msg = `🏠 *${p.title}*\n\n` +
            `💰 Price: ₹ ${p.price}\n` +
            `📍 City: ${p.city}\n` +
            `📐 Area: ${p.area}\n` +
            `🏗️ Type: ${p.category}\n\n` +
            `📝 *Description:* ${p.description}\n\n` +
            (p.video ? `🎥 Video: ${p.video}\n` : "") +
            (p.map ? `🗺️ Map: ${p.map}\n` : "") +
            `📞 Contact: ${p.mobile}\n\n` +
            `Shared via ${appName}`;
        
        if (navigator.share) {
            navigator.share({ title: p.title, text: msg })
                .catch(() => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank"));
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
        }
    };'
    
    $prefix = $content[0..($startIndex-1)]
    $suffix = $content[($endIndex+1)..($content.Length-1)]
    $final = $prefix + $shareMessage + $suffix
    $final | Set-Content -Path $filePath -Encoding UTF8
    Write-Host "Successfully replaced lines from $startIndex to $endIndex"
} else {
    Write-Host "Failed to find the shareProperty block"
}
