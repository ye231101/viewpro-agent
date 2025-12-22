import InCallManager from 'react-native-incall-manager';

class RingtoneManager {
  private isPlaying = false;

  async play() {
    if (this.isPlaying) {
      return;
    }

    try {
      // Set volume to maximum before playing
      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.setKeepScreenOn(true);

      // Start ringtone with vibration
      // 'default' uses the system default ringtone
      // _BUNDLE_ uses bundled ringtone (requires audio file in bundle)
      InCallManager.start({
        media: 'audio',
        ringback: '_DEFAULT_', // Use system default ringback tone
      });

      // Start playing ringtone with vibration infinitely
      // Parameters: (ringtoneName, vibratePattern, ios_category, seconds)
      // Setting seconds to 0 or negative value makes it play infinitely
      InCallManager.startRingtone('_DEFAULT_', [1000, 1000], 'default', 0);

      this.isPlaying = true;
      console.log('Ringtone and vibration started');
    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  }

  stop() {
    if (this.isPlaying) {
      try {
        // Stop ringtone
        InCallManager.stopRingtone();

        // Stop call manager
        InCallManager.stop();

        this.isPlaying = false;
        console.log('Ringtone and vibration stopped');
      } catch (error) {
        console.error('Error stopping ringtone:', error);
      }
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

// Export a singleton instance
export const ringtone = new RingtoneManager();
