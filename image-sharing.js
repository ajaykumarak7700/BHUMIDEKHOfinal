// Image/File Sharing System for Chat - IMPROVED VERSION

// Upload Image to Firebase Storage and Send in Chat
window.uploadAndSendImage = async (file, chatId) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, GIF, and PDF files are allowed!');
        return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('File size must be less than 5MB!');
        return;
    }

    try {
        showGlobalLoader('Uploading file...');

        // Check if Firebase Storage is available
        if (!firebase.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        // Create a unique filename
        const timestamp = Date.now();
        const fileName = `chat_${chatId}_${timestamp}_${file.name}`;
        const storageRef = firebase.storage().ref(`chat-files/${fileName}`);

        console.log('📤 Uploading file:', fileName);

        // Upload file
        const uploadTask = await storageRef.put(file);

        console.log('✅ Upload complete, getting URL...');

        // Get download URL
        const downloadURL = await uploadTask.ref.getDownloadURL();

        console.log('✅ Download URL:', downloadURL);

        // Determine sender
        let senderName = 'Guest';
        if (State.user) {
            senderName = State.user.name;
        } else if (State.view === 'admin') {
            senderName = 'Admin';
        }

        // Create message object
        const message = {
            sender: senderName,
            text: file.type.startsWith('image/') ? '📷 Photo' : '📄 ' + file.name,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            timestamp: timestamp,
            seen: false,
            delivered: true,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            fileUrl: downloadURL,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        };

        // Add to messages
        if (!State.messages[chatId]) {
            State.messages[chatId] = [];
        }
        State.messages[chatId].push(message);

        // Save to Firebase
        saveToFirebase();

        // Re-render chat
        renderChatMessages(chatId);

        // Check for notifications
        checkUnseenMessages();

        hideGlobalLoader();

        // Show success message
        alert('✅ File uploaded successfully!');

        console.log('✅ File uploaded and message sent successfully');

    } catch (error) {
        console.error('❌ Error uploading file:', error);
        console.error('Error details:', error.message);
        console.error('Error code:', error.code);

        hideGlobalLoader();

        // Better error messages
        let errorMessage = 'Failed to upload file. ';

        if (error.code === 'storage/unauthorized') {
            errorMessage += 'Firebase Storage rules not configured. Please contact admin.';
        } else if (error.code === 'storage/canceled') {
            errorMessage += 'Upload was cancelled.';
        } else if (error.code === 'storage/unknown') {
            errorMessage += 'Unknown error occurred. Check Firebase configuration.';
        } else if (error.message.includes('not initialized')) {
            errorMessage += 'Firebase Storage not initialized. Please check Firebase setup.';
        } else {
            errorMessage += 'Please try again or contact support.';
        }

        alert(errorMessage);

        // Log detailed error for debugging
        console.log('🔍 Debugging info:');
        console.log('- Firebase available:', typeof firebase !== 'undefined');
        console.log('- Storage available:', typeof firebase.storage !== 'undefined');
        console.log('- Chat ID:', chatId);
        console.log('- File:', file.name, file.type, file.size);
    }
};

// Trigger file upload dialog
window.openFileUpload = (chatId) => {
    if (!chatId) {
        alert('Please select a user first!');
        return;
    }

    console.log('📎 Opening file upload for chat:', chatId);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif,application/pdf';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('📁 File selected:', file.name, file.type, file.size);
            uploadAndSendImage(file, chatId);
        } else {
            console.log('❌ No file selected');
        }
    };

    input.click();
};

// Download file
window.downloadFile = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
