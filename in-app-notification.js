// In-App Notification Banner (WhatsApp Style)

window.showInAppNotification = (senderName, messageText, messageTime) => {
    // Remove existing notification if any
    const existing = document.getElementById('in-app-notification');
    if (existing) {
        existing.remove();
    }

    // Create notification banner
    const notification = document.createElement('div');
    notification.id = 'in-app-notification';
    notification.style.cssText = `
        position: fixed;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 400px;
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        border-radius: 12px;
        padding: 15px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;

    // Notification content
    notification.innerHTML = `
        <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #FF9933, #138808); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fas fa-comment-dots" style="color: white; font-size: 1.2rem;"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 0.95rem; color: #1a2a3a; margin-bottom: 2px;">
                ${senderName}
            </div>
            <div style="font-size: 0.85rem; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${messageText}
            </div>
        </div>
        <div style="font-size: 0.7rem; color: #999; flex-shrink: 0;">
            ${messageTime || 'Now'}
        </div>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Slide down animation
    setTimeout(() => {
        notification.style.top = '20px';
    }, 100);

    // Touch/Swipe support
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    notification.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
        notification.style.transition = 'none';
    });

    notification.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff < 0) { // Swipe up
            notification.style.top = (20 + diff) + 'px';
        }
    });

    notification.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;

        const diff = currentY - startY;
        notification.style.transition = 'all 0.3s ease';

        if (diff < -50) { // Swiped up enough
            notification.style.top = '-100px';
            setTimeout(() => notification.remove(), 300);
        } else {
            notification.style.top = '20px';
        }
    });

    // Click to open chat
    notification.addEventListener('click', (e) => {
        // Don't dismiss if swiping
        if (isDragging) return;

        notification.style.top = '-100px';
        setTimeout(() => notification.remove(), 300);

        // Open messenger/chat
        if (State.user) {
            State.view = 'home';
            render();
            setTimeout(() => {
                const messengerBtn = document.querySelector('[onclick*="openMessenger"]');
                if (messengerBtn) {
                    messengerBtn.click();
                    console.log('📱 Opening chat from notification');
                }
            }, 100);
        }
    });

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.top = '-100px';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);

    console.log('📱 In-app notification shown');
};
