<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'agent') {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Property - BhumiDekho</title>
    <link rel="stylesheet" href="css/style.css">
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
</head>
<body>
    <div class="header">
        <h1 onclick="location.href='index.php'" style="cursor:pointer;">BhumiDekho</h1>
        <div class="header-actions">
            <button onclick="location.href='index.php'" class="btn-sm btn-outline">Cancel</button>
        </div>
    </div>

    <div class="container" style="padding-bottom:100px;">
        <h2 style="margin-bottom:20px;">Add New Property</h2>
        <div id="add-alert" class="alert hide"></div>

        <form onsubmit="handleAddProperty(event)" class="auth-box" style="margin-top:0;">
            
            <div class="form-group">
                <label>Property Title</label>
                <input type="text" id="prop-title" required placeholder="e.g. 3BHK Flat in Jaipur">
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea id="prop-desc" rows="4" placeholder="Detailed description..."></textarea>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                 <div class="form-group">
                    <label>Price (₹)</label>
                    <input type="number" id="prop-price" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="prop-type">
                        <option value="Plot">Plot</option>
                        <option value="House">House</option>
                        <option value="Flat">Flat</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Agriculture">Agriculture</option>
                    </select>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div class="form-group">
                    <label>City</label>
                    <input type="text" id="prop-city" required placeholder="e.g. Jaipur">
                </div>
                <div class="form-group">
                    <label>Area (sq ft/yards)</label>
                    <input type="text" id="prop-area" required placeholder="e.g. 1200 sqft">
                </div>
            </div>

            <div class="form-group">
                <label>Location (Area/Colony)</label>
                <input type="text" id="prop-location" required placeholder="e.g. Vaishali Nagar">
            </div>

            <div class="form-group">
                <label>Full Address</label>
                <textarea id="prop-address" rows="2" placeholder="Exact address for verification"></textarea>
            </div>

            <div class="form-group">
                <label>Video Link (YouTube)</label>
                <input type="url" id="prop-video" placeholder="https://youtu.be/...">
            </div>

            <div class="form-group">
                <label>Google Map Link</label>
                <input type="url" id="prop-map" placeholder="https://maps.google.com/...">
            </div>

            <div class="form-group">
                <label>Upload Image</label>
                <input type="file" id="prop-image" accept="image/*" required onchange="previewImage(this)">
                <div id="preview-container"></div>
            </div>

            <button type="submit" class="btn btn-primary">Submit Property</button>
        </form>
    </div>

    <script src="js/app.js"></script>
    <script>
        function previewImage(input) {
            const container = document.getElementById('preview-container');
            container.innerHTML = '';
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    container.appendChild(img);
                }
                reader.readAsDataURL(input.files[0]);
            }
        }
    </script>
</body>
</html>
