package com.viewpro.agent.service;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;

public class RingtoneService {
    private static final String TAG = "RingtoneService";

    private static MediaPlayer mediaPlayer;
    private static Vibrator vibrator;

    public static void initialize(Context context) {
        try {
            AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            if (audioManager != null) {
                int maxRingVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_RING);
                audioManager.setStreamVolume(AudioManager.STREAM_RING, maxRingVolume, AudioManager.FLAG_PLAY_SOUND);
            }

            Uri ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            if (ringtoneUri == null) {
                ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setDataSource(context, ringtoneUri);
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                    .build());
            mediaPlayer.setLooping(true);
            mediaPlayer.prepare();

            vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        } catch (Exception e) {
            Log.e(TAG, "Error initializing ringtone: ", e);
            cleanup();
        }
    }

    public static void startRinging() {
        if (mediaPlayer != null && !mediaPlayer.isPlaying()) {
            try {
                mediaPlayer.start();
            } catch (Exception e) {
                Log.e(TAG, "Ringtone error: ", e);
            }
        }

        if (vibrator != null && vibrator.hasVibrator()) {
            try {
                long[] pattern = {0, 1000, 500, 1000, 500, 1000};
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
            } catch (Exception e) {
                Log.e(TAG, "Vibration error: ", e);
            }
        }
    }

    public static void stopRinging() {
        if (mediaPlayer != null && mediaPlayer.isPlaying()) {
            try {
                mediaPlayer.pause();
                mediaPlayer.seekTo(0);
            } catch (Exception e) {
                Log.e(TAG, "Stop ringtone error: ", e);
            }
        }

        if (vibrator != null) {
            try {
                vibrator.cancel();
            } catch (Exception e) {
                Log.e(TAG, "Stop vibration error: ", e);
            }
        }
    }

    public static void cleanup() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
                mediaPlayer = null;
            } catch (Exception e) {
                Log.e(TAG, "Cleanup MediaPlayer error: ", e);
            }
        }

        if (vibrator != null) {
            try {
                vibrator.cancel();
                vibrator = null;
            } catch (Exception e) {
                Log.e(TAG, "Cleanup Vibrator error: ", e);
            }
        }
    }
}