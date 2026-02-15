// Messages Tab Content for Admin Panel - COMPLETE VERSION

function renderMessagesTab() {
    // Get ALL users (customers + agents)
    const allUsers = [];

    // Add all customers
    (State.customers || []).forEach(customer => {
        allUsers.push({
            id: customer.id,
            name: customer.name,
            phone: customer.phone || 'N/A',
            email: customer.email || 'N/A',
            type: 'Customer',
            typeIcon: 'fa-user',
            typeColor: '#138808'
        });
    });

    // Add all agents
    (State.agents || []).forEach(agent => {
        allUsers.push({
            id: agent.id,
            name: agent.name,
            phone: agent.phone || 'N/A',
            email: agent.email || 'N/A',
            type: 'Agent',
            typeIcon: 'fa-user-tie',
            typeColor: '#FF9933'
        });
    });

    // Add message info to users
    const userChats = allUsers.map(user => {
        const messages = State.messages[user.id] || [];
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(m => m.sender !== 'Admin' && !m.seen).length;

        return {
            ...user,
            hasMessages: messages.length > 0,
            lastMessage: lastMessage ? lastMessage.text : 'No messages yet',
            lastTime: lastMessage ? lastMessage.time : '',
            unreadCount,
            timestamp: lastMessage ? lastMessage.timestamp : 0
        };
    }).sort((a, b) => {
        // Sort: users with messages first, then by latest message
        if (a.hasMessages && !b.hasMessages) return -1;
        if (!a.hasMessages && b.hasMessages) return 1;
        return b.timestamp - a.timestamp;
    });

    // Get current chat user details
    const currentUser = userChats.find(u => u.id == State.activeChatId);

    return `
        <div style="display:flex; flex-direction:row; flex-wrap:nowrap; height:calc(100vh - 140px); width:100%; margin:0; background:white; overflow:hidden; border:1px solid #ddd; border-radius:12px;">
            
            <!-- LEFT COLUMN: User List (Always Visible) -->
            <div style="width:320px; min-width:320px; border-right:1px solid #eee; display:flex; flex-direction:column; background:#f8f9fa;">
                
                <!-- Search & Header -->
                <div style="padding:15px; border-bottom:1px solid #ddd; background:white;">
                    <div style="margin-bottom:10px;">
                        <h3 style="margin:0; font-size:1.1rem; color:#1a2a3a;">Messages</h3>
                    </div>
                    <div style="position:relative;">
                        <i class="fas fa-search" style="position:absolute; left:12px; top:10px; color:#999;"></i>
                        <input type="text" 
                               placeholder="Search users..." 
                               oninput="filterUserList(this.value)"
                               style="width:100%; padding:8px 10px 8px 35px; border:1px solid #ddd; border-radius:20px; outline:none; font-size:0.9rem;">
                    </div>
                </div>

                <!-- User List Container -->
                <div id="user-list-container" style="flex:1; overflow-y:auto;">
                    <!-- Broadcast Item -->
                    <div class="user-chat-item" 
                         data-user-name="broadcast"
                         data-user-phone=""
                         onclick="openBroadcastChat()" 
                         style="padding:15px; border-bottom:1px solid #eee; cursor:pointer; background:${State.activeChatId === 'broadcast' ? '#fff3e0' : 'white'}; border-left:${State.activeChatId === 'broadcast' ? '4px solid #FF9933' : '4px solid transparent'};">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:40px; height:40px; background:#e67e22; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white;">
                                <i class="fas fa-bullhorn"></i>
                            </div>
                            <div>
                                <div style="font-weight:700; color:#d35400; font-size:0.9rem;">Broadcast</div>
                                <div style="font-size:0.75rem; color:#666;">Send to all users</div>
                            </div>
                        </div>
                    </div>

                    ${userChats.length === 0 ? `
                        <div style="padding:30px; text-align:center; color:#999;">
                            <div>No conversations found</div>
                        </div>
                    ` : userChats.map(user => `
                        <div class="user-chat-item" 
                             data-user-name="${user.name.toLowerCase()}"
                             data-user-phone="${user.phone}"
                             onclick="openAdminChat('${user.id}')" 
                             style="padding:15px; border-bottom:1px solid #eee; cursor:pointer; background:${State.activeChatId == user.id ? '#e8f5e9' : 'white'}; border-left:${State.activeChatId == user.id ? '4px solid #138808' : '4px solid transparent'}; transition:background 0.2s;">
                            <div style="display:flex; gap:10px;">
                                <div style="width:40px; height:40px; background:#ddd; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#555; overflow:hidden;">
                                    ${user.name.charAt(0)}
                                </div>
                                <div style="flex:1; min-width:0;">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                                        <div style="overflow:hidden;">
                                            <div style="font-weight:600; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#333;">${user.name}</div>
                                            <div style="font-size:0.75rem; color:#138808; display:flex; align-items:center; gap:4px;">
                                                <i class="fas ${user.typeIcon}" style="font-size:0.65rem;"></i> ${user.phone}
                                            </div>
                                        </div>
                                        <div style="font-size:0.7rem; color:#999; flex-shrink:0;">${user.lastTime}</div>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <div style="font-size:0.8rem; color:${user.hasMessages ? '#666' : '#999'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">
                                            ${user.lastMessage}
                                        </div>
                                        ${user.unreadCount > 0 ? `<div style="background:#FF9933; color:white; font-size:0.7rem; padding:1px 6px; border-radius:10px; font-weight:bold;">${user.unreadCount}</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- RIGHT COLUMN: Chat Area (Flex Grow) -->
            <div style="flex:1; display:flex; flex-direction:column; background:white; position:relative;">
                ${State.activeChatId === 'broadcast' ? `
                    <!-- BROADCAST VIEW -->
                     <div style="padding:15px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:10px; background:#fff8e1;">
                        <h3 style="margin:0; font-size:1.1rem; color:#d35400;">
                            <i class="fas fa-bullhorn"></i> Global Broadcast
                        </h3>
                    </div>
                    
                    <div style="flex:1; padding:30px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fffbf2;">
                        <i class="fas fa-bullhorn" style="font-size:4rem; color:#ffcc80; margin-bottom:20px;"></i>
                        <h2 style="color:#d35400; margin-bottom:10px;">Send Announcement</h2>
                        <p style="text-align:center; color:#666; max-width:400px; margin-bottom:30px;">
                            This message will be sent to all <b>${userChats.length}</b> registered users (Customers & Agents) individually.
                        </p>
                        
                        <div style="width:100%; max-width:500px;">
                            <textarea id="broadcast-input" 
                                      placeholder="Write your message here..." 
                                      style="width:100%; height:120px; padding:15px; border:2px solid #ddd; border-radius:10px; outline:none; font-size:1rem; resize:none;"></textarea>
                            <button onclick="sendBroadcastMessage(${userChats.length})" 
                                    style="width:100%; margin-top:15px; padding:15px; background:linear-gradient(135deg, #FF9933, #d35400); color:white; border:none; border-radius:10px; font-weight:bold; font-size:1rem; cursor:pointer; box-shadow:0 4px 10px rgba(211, 84, 0, 0.3);">
                                <i class="fas fa-paper-plane"></i> Send to Everyone
                            </button>
                        </div>
                    </div>

                ` : State.activeChatId && currentUser ? `
                    <!-- CHAT VIEW -->
                    <div style="padding:10px 20px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:white;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <h3 style="margin:0; font-size:1.1rem; color:#1a2a3a;">${currentUser.name}</h3>
                            <span style="font-size:0.75rem; padding:2px 8px; background:#f0f0f0; border-radius:10px; color:#666;">${currentUser.type}</span>
                        </div>
                         <button onclick="deleteConversation(State.activeChatId)" style="color:#D32F2F; background:none; border:none; cursor:pointer;" title="Clear Chat">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>

                    <!-- Messages -->
                    <div id="admin-chat-messages" style="flex:1; overflow-y:auto; padding:20px; background:#f5f7f9; display:flex; flex-direction:column; gap:10px;">
                        <!-- Messages Injected Here -->
                    </div>

                    <!-- Input -->
                    <div style="padding:15px; background:white; border-top:1px solid #eee;">
                        <div style="display:flex; gap:10px; align-items:center; background:#f8f9fa; padding:5px 10px; border-radius:25px; border:1px solid #ddd;">
                            <button onclick="openFileUpload(State.activeChatId)" style="border:none; background:none; color:#666; cursor:pointer; padding:8px;">
                                <i class="fas fa-paperclip"></i>
                            </button>
                            <input type="text" 
                                   id="admin-message-input" 
                                   placeholder="Type a message..." 
                                   style="flex:1; border:none; background:transparent; outline:none; padding:10px; font-size:0.95rem;"
                                   onkeypress="if(event.key==='Enter') sendAdminMessage()">
                            <button onclick="sendAdminMessage()" style="width:35px; height:35px; background:#138808; color:white; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                                <i class="fas fa-paper-plane" style="font-size:0.9rem;"></i>
                            </button>
                        </div>
                    </div>

                ` : `
                    <!-- EMPTY STATE -->
                    <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#ccc;">
                        <i class="fas fa-comments" style="font-size:5rem; margin-bottom:20px; opacity:0.5;"></i>
                        <h3 style="color:#999;">Select a Conversation</h3>
                        <p style="color:#aaa;">Click on a user from the left to start chatting.</p>
                    </div>
                `}
            </div>

        </div>
    `;
}

// Local Render Messages Function to avoid conflicts
function renderAdminTabMessages(userId) {
    const container = document.getElementById('admin-chat-messages');
    if (!container) return;

    const msgs = State.messages[userId] || [];
    if (msgs.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#999; margin-top:20px;">No messages yet. Start the conversation!</div>';
        return;
    }

    container.innerHTML = msgs.map(msg => {
        const isAdmin = msg.sender === 'Admin';
        return `
            <div style="display:flex; justify-content:${isAdmin ? 'flex-end' : 'flex-start'};">
                <div style="max-width:70%; padding:10px 15px; border-radius:${isAdmin ? '15px 15px 0 15px' : '15px 15px 15px 0'}; background:${isAdmin ? '#e8f5e9' : 'white'}; border:${isAdmin ? '1px solid #c8e6c9' : '1px solid #eee'}; position:relative;">
                    <div style="font-size:0.95rem; color:#333;">${msg.text}</div>
                    <div style="font-size:0.7rem; color:#999; text-align:right; margin-top:5px;">
                        ${msg.time} ${isAdmin && msg.seen ? '<i class="fas fa-check-double" style="color:#138808;"></i>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Filter user list by search
window.filterUserList = (searchText) => {
    const items = document.querySelectorAll('.user-chat-item');
    const search = searchText.toLowerCase();

    items.forEach(item => {
        const name = item.getAttribute('data-user-name');
        const phone = item.getAttribute('data-user-phone');

        if (name.includes(search) || phone.includes(search)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
};

// Open chat with a specific user
window.openAdminChat = (userId) => {
    State.activeChatId = userId;
    State.adminTab = 'messages';
    render();

    // Render messages after a short delay
    setTimeout(() => {
        renderAdminTabMessages(userId);
    }, 100);
};

// Send message from admin
window.sendAdminMessage = () => {
    const input = document.getElementById('admin-message-input');
    if (!input || !input.value.trim()) return;

    const chatId = State.activeChatId;
    if (!chatId) return;

    const message = {
        sender: 'Admin',
        text: input.value.trim(),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        seen: false,
        delivered: true
    };

    if (!State.messages[chatId]) {
        State.messages[chatId] = [];
    }

    State.messages[chatId].push(message);
    input.value = '';

    saveToFirebase();
    renderAdminTabMessages(chatId);
};

// Open Broadcast Interface
window.openBroadcastChat = () => {
    State.activeChatId = 'broadcast';
    State.adminTab = 'messages';
    render();
};

// Send Broadcast Message
window.sendBroadcastMessage = (userCount) => {
    const input = document.getElementById('broadcast-input');
    if (!input || !input.value.trim()) {
        alert('Please type a message first!');
        return;
    }

    if (!confirm(`Are you sure you want to send this message to ALL ${userCount} users?`)) {
        return;
    }

    const messageText = input.value.trim();
    const timestamp = Date.now();
    const timeString = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Send to Customers
    (State.customers || []).forEach(user => {
        if (!State.messages[user.id]) State.messages[user.id] = [];
        State.messages[user.id].push({
            sender: 'Admin',
            text: messageText,
            time: timeString,
            timestamp: timestamp,
            seen: false,
            delivered: true
        });
    });

    // Send to Agents
    (State.agents || []).forEach(user => {
        if (!State.messages[user.id]) State.messages[user.id] = [];
        State.messages[user.id].push({
            sender: 'Admin',
            text: messageText,
            time: timeString,
            timestamp: timestamp,
            seen: false,
            delivered: true
        });
    });

    saveToFirebase();
    input.value = '';
    alert(`✅ Sent to all users!`);
};

// Delete Conversation (Clear Chat Helper)
window.deleteConversation = (userId) => {
    if (confirm('Clear all messages for this user?')) {
        State.messages[userId] = [];
        saveToFirebase();
        renderAdminTabMessages(userId);
    }
};
