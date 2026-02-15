// Message Delete & History Clean Functions

// Delete individual message
window.deleteMessage = (chatId, messageIndex) => {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }

    if (!State.messages[chatId] || !State.messages[chatId][messageIndex]) {
        alert('Message not found!');
        return;
    }

    // Remove message from array
    State.messages[chatId].splice(messageIndex, 1);

    // Save to Firebase
    saveToFirebase();

    // Re-render chat
    renderChatMessages(chatId);

    // Show success
    showToast('Message deleted successfully!');

    console.log('✅ Message deleted:', chatId, messageIndex);
};

// Clear entire chat history
window.clearChatHistory = (chatId) => {
    // Find user name
    let userName = 'this user';
    const customer = (State.customers || []).find(c => c.id == chatId);
    const agent = (State.agents || []).find(a => a.id == chatId);

    if (customer) {
        userName = customer.name;
    } else if (agent) {
        userName = agent.name;
    }

    if (!confirm(`Are you sure you want to delete ALL messages with ${userName}?\n\nThis action cannot be undone!`)) {
        return;
    }

    // Double confirmation for safety
    if (!confirm('Final confirmation: Delete entire chat history?')) {
        return;
    }

    // Clear all messages
    State.messages[chatId] = [];

    // Save to Firebase
    saveToFirebase();

    // Re-render chat
    renderChatMessages(chatId);

    // Show success
    showToast('Chat history cleared successfully!');

    console.log('✅ Chat history cleared:', chatId);
};

// Show toast notification
window.showToast = (message, duration = 3000) => {
    // Remove existing toast if any
    const existingToast = document.getElementById('custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #138808, #28a745);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        font-size: 0.95rem;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
};
