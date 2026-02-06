package com.viewpro.agent;

import static com.viewpro.agent.utils.Utils.PERMISSION_REQUEST_CODE;
import static com.viewpro.agent.utils.Utils.getApiService;
import static com.viewpro.agent.utils.Utils.getStatus;
import static com.viewpro.agent.utils.Utils.getUsername;
import static com.viewpro.agent.utils.Utils.setAvatar;
import static com.viewpro.agent.utils.Utils.setStatus;
import static com.viewpro.agent.utils.Utils.setUsername;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SwitchCompat;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.viewpro.agent.api.ApiService;
import com.viewpro.agent.utils.FCMTokenManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";

    private static String username;

    private SwitchCompat statusSwitch;
    private TextView statusLabel;
    private Button logoutButton;
    private ProgressBar logoutProgress;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        updateFCMToken();

        if (!checkPermissions()) {
            requestPermissions();
        }

        statusSwitch = findViewById(R.id.status_switch);
        statusLabel = findViewById(R.id.status_label);
        logoutButton = findViewById(R.id.logout_button);
        logoutProgress = findViewById(R.id.logout_progress);

        username = getUsername(this);

        String status = getStatus(this);
        boolean isOnline = "online".equals(status);
        statusSwitch.setChecked(isOnline);
        statusLabel.setText(isOnline ? R.string.online : R.string.offline);

        statusSwitch.setOnClickListener((v) -> {
            boolean isChecked = statusSwitch.isChecked();
            statusLabel.setText(isChecked ? R.string.online : R.string.offline);
            updateStatus(isChecked ? "online" : "offline");
        });

        logoutButton.setOnClickListener(v -> logout());
    }

    private boolean checkPermissions() {
        boolean hasBasicPermissions = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return hasBasicPermissions && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }

        return hasBasicPermissions;
    }

    private void requestPermissions() {
        String[] permissionsList;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsList = new String[]{
                    Manifest.permission.CAMERA,
                    Manifest.permission.RECORD_AUDIO,
                    Manifest.permission.BLUETOOTH_CONNECT,
                    Manifest.permission.POST_NOTIFICATIONS
            };
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            permissionsList = new String[]{
                    Manifest.permission.CAMERA,
                    Manifest.permission.RECORD_AUDIO,
                    Manifest.permission.BLUETOOTH_CONNECT
            };
        } else {
            permissionsList = new String[]{
                    Manifest.permission.CAMERA,
                    Manifest.permission.RECORD_AUDIO
            };
        }
        ActivityCompat.requestPermissions(this, permissionsList, PERMISSION_REQUEST_CODE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allPermissionsGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allPermissionsGranted = false;
                    break;
                }
            }
            if (!allPermissionsGranted) {
                String message = "The app needs camera and microphone permissions for video calls";
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    message += ", and notification permission for alerts";
                }
                Toast.makeText(this, message, Toast.LENGTH_LONG).show();
            }
        }
    }

    private void updateStatus(String status) {
        getApiService().updateStatus(username, status).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call, @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    setStatus(MainActivity.this, status);
                } else {
                    Toast.makeText(MainActivity.this, getString(R.string.internal_server_error), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e(TAG, "Failed to update status: " + t.getMessage());
                Toast.makeText(MainActivity.this, "Failed to update status: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateFCMToken() {
        FCMTokenManager fcmTokenManager = FCMTokenManager.getInstance();
        fcmTokenManager.getFCMToken(token -> fcmTokenManager.updateFCMToken(username, token, new FCMTokenManager.TokenUpdateCallback() {
            @Override
            public void onSuccess() {
                Log.d(TAG, "FCM token updated successfully");
            }

            @Override
            public void onError(String error) {
                Log.e(TAG, "Failed to update FCM token: " + error);
            }
        }));
    }

    private void logout() {
        showLoading(true);

        getApiService().logout(username).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<ApiService.Response> call, @NonNull Response<ApiService.Response> response) {
                showLoading(false);
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(MainActivity.this, getString(R.string.success_logout), Toast.LENGTH_SHORT).show();

                    setUsername(MainActivity.this, null);
                    setStatus(MainActivity.this, null);
                    setAvatar(MainActivity.this, null);

                    Intent intent = new Intent(MainActivity.this, LoginActivity.class)
                            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(intent);
                    finish();
                } else {
                    Toast.makeText(MainActivity.this, getString(R.string.internal_server_error), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiService.Response> call, @NonNull Throwable t) {
                showLoading(false);
                Log.e(TAG, "Failed to logout: " + t.getMessage());
                Toast.makeText(MainActivity.this, "Failed to logout: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showLoading(boolean isLoading) {
        logoutButton.setEnabled(!isLoading);
        if (isLoading) {
            logoutButton.setText("");
            logoutProgress.setVisibility(View.VISIBLE);
        } else {
            logoutButton.setText(R.string.sign_out);
            logoutProgress.setVisibility(View.GONE);
        }
    }
}
