<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saved Properties - BhumiDekho</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <style>body { font-family: 'Outfit', sans-serif; }</style>
</head>
<body>
    <div class="header">
        <div style="display: flex; align-items: center; gap: 10px;">
            <ion-icon name="arrow-back" style="font-size: 24px;" onclick="location.href='index.php'"></ion-icon>
            <h1>Saved Properties</h1>
        </div>
    </div>

    <div id="feed-container" class="container" style="padding-top: 20px;">
        <!-- Properties will be loaded here using js -->
    </div>

    <script src="js/app.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const container = document.getElementById('feed-container');
            container.innerHTML = '<div class="loader" style="display:block">Loading...</div>';
            
            try {
                const res = await fetch('api/property.php?action=get_likes');
                const data = await res.json();
                
                container.innerHTML = '';
                
                if (data.status === 'success' && data.data.length > 0) {
                    // Reuse renderProperties from app.js
                    renderProperties(data.data);
                } else {
                    container.innerHTML = '<div style="text-align:center; margin-top:50px; color:#999;">No saved properties.</div>';
                }
            } catch(e) {
                console.error(e);
                container.innerHTML = 'Error loading properties.';
            }
        });
    </script>
</body>
</html>
