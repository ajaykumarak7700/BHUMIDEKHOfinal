// Add Broadcast Message Button (Floating Button for Admin)
window.showBroadcastButton = () => {
    // Remove existing button if any
    const existing = document.getElementById('broadcast-float-btn');
    if (existing) existing.remove();

    // Only show for admin
    if (State.view !== 'admin') return;

    const btn = document.createElement('button');
    btn.id = 'broadcast-float-btn';
    btn.innerHTML = '📢';
    btn.title = 'Send Broadcast Message to All Users';
    btn.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF9933, #138808);
        color: white;
        border: none;
        font-size: 1.8rem;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(255, 153, 51, 0.4);
        z-index: 1000;
        transition: all 0.3s ease;
    `;

    btn.onclick = () => {
        document.getElementById('broadcast-modal').style.display = 'flex';
        document.getElementById('broadcast-input').focus();
    };

    btn.onmouseenter = () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = '0 8px 25px rgba(255, 153, 51, 0.5)';
    };

    btn.onmouseleave = () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 6px 20px rgba(255, 153, 51, 0.4)';
    };

    document.body.appendChild(btn);
};

// Call this when admin panel loads
if (State.view === 'admin') {
    showBroadcastButton();
}
