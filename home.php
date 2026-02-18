<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BhumiDekho - Home</title>
    <link rel="stylesheet" href="css/style.css">
    <!-- Ionicons for Icons -->
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
</head>
<body>
    <!-- Top Header -->
    <div class="header">
        <h1>BhumiDekho</h1>
        <div class="header-actions">
            <ion-icon name="chatbubble-ellipses-outline" style="font-size: 24px;"></ion-icon>
        </div>
    </div>

    <!-- Search & Filter -->
    <div style="padding: 15px; background: white; border-bottom: 1px solid #eee;">
        <div style="display: flex; gap: 10px;">
            <input type="text" id="search-input" placeholder="Search by location..." style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
            <button onclick="loadFeed(true)" class="btn-primary" style="width: auto; padding: 0 15px; border-radius: 8px;">
                <ion-icon name="search-outline"></ion-icon>
            </button>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 10px; overflow-x: auto; white-space: nowrap; padding-bottom: 5px;">
            <button class="btn-sm btn-outline" onclick="filterFeed('Residential')">Residential</button>
            <button class="btn-sm btn-outline" onclick="filterFeed('Commercial')">Commercial</button>
            <button class="btn-sm btn-outline" onclick="filterFeed('Agriculture')">Agriculture</button>
        </div>
    </div>

    <!-- Feed Container -->
    <div id="feed-container" class="container" style="padding-top: 20px;">
        <!-- Properties will be injected here -->
    </div>

    <div id="loader" class="loader">
        <ion-icon name="refresh-outline" class="spin"></ion-icon> Loading...
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
        <div class="nav-item active" onclick="location.href='home.php'">
            <ion-icon name="home" class="nav-icon"></ion-icon>
            <span>Home</span>
        </div>
        <?php if ($_SESSION['role'] === 'agent' || $_SESSION['role'] === 'user'): ?>
        <div class="nav-item" onclick="checkWalletAndOpen()">
            <ion-icon name="add-circle" class="nav-icon"></ion-icon>
            <span>Add</span>
        </div>
        <?php endif; ?>
        <div class="nav-item">
            <ion-icon name="heart-outline" class="nav-icon"></ion-icon>
            <span>Saved</span>
        </div>
        <div class="nav-item" onclick="handleLogout()">
            <ion-icon name="person-circle-outline" class="nav-icon"></ion-icon>
            <span>Profile</span>
        </div>
    </div>

    <!-- Property Details Modal -->
    <div id="prop-modal" class="modal-overlay">
        <div class="modal-sheet">
            <div class="modal-header">
                <h3 id="modal-title">Property Title</h3>
                <span onclick="closeModal()" style="font-size: 24px; cursor: pointer;">&times;</span>
            </div>
            <div class="modal-body">
                <img id="modal-img" src="" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">
                <h2 id="modal-price" style="color: var(--primary);">₹ 0</h2>
                <p id="modal-location" style="color: var(--text-light); margin-bottom: 15px;"></p>
                
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button class="btn-sm btn-outline">Video</button>
                    <button class="btn-sm btn-outline">Map</button>
                </div>

                <div style="background: var(--gray); padding: 15px; border-radius: 8px;">
                    <h4>Seller Info</h4>
                    <p id="modal-agent"></p>
                    <button class="btn btn-primary" style="margin-top: 10px;">Chat with Agent</button>
                </div>
            </div>
        </div>
    </div>

    <script src="js/app.js"></script>
    <script>
        // Initialize Feed
        document.addEventListener('DOMContentLoaded', () => {
            loadFeed(true);
            
            // Infinite Scroll
            window.addEventListener('scroll', () => {
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                    loadFeed();
                }
            });
        });

        function checkWalletAndOpen() {
            // Get wallet balance from session
            const balance = <?php echo isset($_SESSION['wallet']) ? $_SESSION['wallet'] : 0; ?>;
            const required = 99;

            if (balance < required) {
                alert(`Insufficient Balance! You need ₹${required} to list a property. Your balance is ₹${balance}. Please add money.`);
                // redirection to wallet/add money page could be added here
                return;
            }

            if (confirm(`Listing a property costs ₹${required}. Amount will be deducted upon submission. Proceed?`)) {
                window.location.href = 'add_prop.php';
            }
        }
    </script>
</body>
</html>
