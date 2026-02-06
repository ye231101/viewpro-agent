package com.viewpro.agent.utils;

import static com.viewpro.agent.utils.Utils.getApiService;

import android.util.Log;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessaging;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FCMTokenManager {
    private static final String TAG = "FCMTokenManager";

    public static FCMTokenManager getInstance() {
        return new FCMTokenManager();
    }

    public void getFCMToken(TokenCallback callback) {
        FirebaseMessaging
                .getInstance()
                .getToken()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        String token = task.getResult();
                        callback.onTokenReceived(token);
                    } else {
                        Log.e(TAG, "Failed to get FCM token", task.getException());
                    }
                });
    }

    public void updateFCMToken(String username, String token, TokenUpdateCallback callback) {
        getApiService().updateFCMToken(username, token).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call, @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    callback.onSuccess();
                } else {
                    Log.e(TAG, "Failed to update FCM token");
                    callback.onError("Failed to update FCM token");
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e(TAG, "Failed to update FCM token: " + t.getMessage());
                callback.onError(t.getMessage());
            }
        });
    }

    public interface TokenCallback {
        void onTokenReceived(String token);
    }

    public interface TokenUpdateCallback {
        void onSuccess();

        void onError(String error);
    }
}