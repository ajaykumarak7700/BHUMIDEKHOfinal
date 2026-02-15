<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BhumiDekho - Login</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; position: relative; }
        .lang-toggle-container { position: absolute; top: 10px; right: 10px; z-index: 100; }
        .lang-btn { background: transparent; border: 1px solid var(--primary); padding: 5px 10px; border-radius: 4px; cursor: pointer; color: var(--primary); font-weight: bold; }
    </style>
</head>
<body>
    <div class="lang-toggle-container">
        <button id="lang-toggle-btn" class="lang-btn" onclick="toggleLanguage()">English</button>
    </div>

    <div class="container">
        <div class="text-center" style="margin-top: 50px;">
            <h1 style="color: var(--primary); font-size: 32px;">BhumiDekho</h1>
            <p data-i18n="real_estate_simple">Real Estate Made Simple</p>
        </div>

        <!-- Login Form -->
        <div id="login-form" class="auth-box">
            <h2 class="text-center" style="margin-bottom: 20px;" data-i18n="login">Login</h2>
            <div id="login-alert" class="alert hide"></div>
            <form onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label data-i18n="mobile_number">Mobile Number</label>
                    <input type="tel" id="login-mobile" required>
                </div>
                <div class="form-group">
                    <label data-i18n="password">Password</label>
                    <input type="password" id="login-pass" required>
                </div>
                <button type="submit" class="btn btn-primary" data-i18n="login">Login</button>
            </form>
            <p class="text-center" style="margin-top: 20px;">
                <span data-i18n="no_account">Don't have an account?</span> <a href="#" onclick="toggleAuth()" style="color: var(--primary);" data-i18n="sign_up">Sign Up</a>
                <br><br>
                <a href="index.php" style="color: #999; font-size: 14px;" data-i18n="skip_home">Skip to Home</a>
            </p>
        </div>

        <!-- Signup Form -->
        <div id="signup-form" class="auth-box hide">
            <h2 class="text-center" style="margin-bottom: 20px;" data-i18n="sign_up">Sign Up</h2>
            <div id="signup-alert" class="alert hide"></div>
            <form onsubmit="handleSignup(event)">
                <div class="form-group">
                    <label data-i18n="full_name">Full Name</label>
                    <input type="text" id="signup-name" required>
                </div>
                <div class="form-group">
                    <label data-i18n="mobile_number">Mobile Number</label>
                    <input type="tel" id="signup-mobile" required>
                </div>
                <div class="form-group">
                    <label data-i18n="password">Password</label>
                    <input type="password" id="signup-pass" required>
                </div>
                <div class="form-group">
                    <label data-i18n="role">Role</label>
                    <select id="signup-role">
                        <option value="customer" data-i18n="role_customer">Customer (Buyer)</option>
                        <option value="agent" data-i18n="role_agent_seller">Agent (Seller)</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary" data-i18n="create_account">Create Account</button>
            </form>
            <p class="text-center" style="margin-top: 20px;">
                <span data-i18n="already_have_account">Already have an account?</span> <a href="#" onclick="toggleAuth()" style="color: var(--primary);" data-i18n="login">Login</a>
            </p>
        </div>
    </div>
    
    <script src="js/translations.js?v=<?php echo time(); ?>"></script>
    <script src="js/app.js?v=<?php echo time(); ?>"></script>
    <script>
        function toggleLanguage() {
            // Logic for toggle (copied from index.php roughly or re-implement)
            // translations.js has setLanguage
            // But we need to toggle
             const newLang = currentLang === 'hi' ? 'en' : 'hi';
             setLanguage(newLang);
        }
    </script>
</body>
</html>
