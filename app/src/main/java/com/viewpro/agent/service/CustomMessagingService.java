package com.viewpro.agent.service;

import static com.viewpro.agent.utils.Utils.INCOMING_CALL_CHANNEL_DESCRIPTION;
import static com.viewpro.agent.utils.Utils.INCOMING_CALL_CHANNEL_ID;
import static com.viewpro.agent.utils.Utils.INCOMING_CALL_CHANNEL_NAME;
import static com.viewpro.agent.utils.Utils.NOTIFICATION_ID;
import static com.viewpro.agent.utils.Utils.getUsername;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.viewpro.agent.IncomingCallActivity;
import com.viewpro.agent.MainActivity;
import com.viewpro.agent.R;
import com.viewpro.agent.utils.FCMTokenManager;

import java.util.Map;

public class CustomMessagingService extends FirebaseMessagingService {
    private static final String TAG = "CustomMessagingService";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public void onDestroy() {
        RingtoneService.cleanup();
        cancelNotification();
        super.onDestroy();
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        sendRegistrationToServer(token);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.d(TAG, "Received new message from: " + remoteMessage.getFrom());

        Map<String, String> data = remoteMessage.getData();
        String type = data.get("type");
        String roomName = data.get("roomName");

        if (type != null) {
            switch (type) {
                case "request_call":
                case "invite_call": {
                    Log.d(TAG, "Call Request: roomName=" + roomName);

                    String callerName = data.get("callerName");

                    Intent intent = new Intent(this, IncomingCallActivity.class)
                            .putExtra("callerName", callerName)
                            .putExtra("roomName", roomName)
                            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

                    PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                            this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

                    NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, INCOMING_CALL_CHANNEL_ID)
                            .setSmallIcon(android.R.drawable.sym_call_incoming)
                            .setContentTitle(INCOMING_CALL_CHANNEL_NAME)
                            .setContentText("Call from " + (callerName != null ? callerName : R.string.client))
                            .setPriority(NotificationCompat.PRIORITY_MAX)
                            .setCategory(NotificationCompat.CATEGORY_CALL)
                            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                            .setFullScreenIntent(fullScreenPendingIntent, true)
                            .setSound(null)
                            .setOngoing(true);

                    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                    if (notificationManager != null) {
                        notificationManager.notify(NOTIFICATION_ID, notificationBuilder.build());
                    }

                    try {
                        RingtoneService.initialize(getApplicationContext());
                        RingtoneService.startRinging();
                    } catch (Exception e) {
                        Log.e(TAG, "Error starting ringing: ", e);
                    }

                    wakeUpDevice();
                    startActivity(intent);

                    break;
                }

                case "accept_call":
                case "cancel_call": {
                    Log.d(TAG, "Close Call Request: roomName=" + roomName);

                    try {
                        RingtoneService.stopRinging();
                    } catch (Exception e) {
                        Log.e(TAG, "Error stopping ringing", e);
                    }

                    cancelNotification();

                    Intent intent = new Intent(this, MainActivity.class)
                            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(intent);

                    break;
                }

                default: {
                    break;
                }
            }
        }
    }

    private void createNotificationChannel() {
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            NotificationChannel channel = new NotificationChannel(
                    INCOMING_CALL_CHANNEL_ID,
                    INCOMING_CALL_CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription(INCOMING_CALL_CHANNEL_DESCRIPTION);
            channel.setSound(null, null);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private void cancelNotification() {
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.cancel(NOTIFICATION_ID);
        }
    }

    private void wakeUpDevice() {
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            // Check if device is interactive (screen is on)
            if (!powerManager.isInteractive()) {
                PowerManager.WakeLock wakeLock = powerManager.newWakeLock(
                        PowerManager.ACQUIRE_CAUSES_WAKEUP |
                                PowerManager.ON_AFTER_RELEASE,
                        "viewpro:incoming_call");
                wakeLock.acquire(5000);

                // Release wake lock after a delay
                new Handler(Looper.getMainLooper()).postDelayed(() -> {
                    if (wakeLock.isHeld()) {
                        wakeLock.release();
                    }
                }, 5000);
            }
        }
    }

    private void sendRegistrationToServer(String token) {
        String username = getUsername(this);
        if (!username.isEmpty()) {
            try {
                FCMTokenManager
                        .getInstance()
                        .updateFCMToken(
                                username,
                                token,
                                new FCMTokenManager.TokenUpdateCallback() {
                                    @Override
                                    public void onSuccess() {
                                        Log.d(TAG, "FCM token successfully updated on server");
                                    }

                                    @Override
                                    public void onError(String error) {
                                        Log.e(TAG, "Failed to update FCM token on server: " + error);
                                    }
                                });
            } catch (Exception e) {
                Log.e(TAG, "Exception while sending FCM token to server", e);
            }
        }
    }
}
