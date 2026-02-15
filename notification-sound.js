// Notification Sound System

// Play notification sound
window.playNotificationSound = () => {
    try {
        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set frequency (notification tone)
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        // Set volume
        gainNode.gain.value = 0.3;

        // Play for 200ms
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);

        console.log('🔔 Notification sound played');
    } catch (error) {
        console.error('❌ Error playing sound:', error);
    }
};
