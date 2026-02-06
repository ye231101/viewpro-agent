package com.viewpro.agent;

import static com.viewpro.agent.utils.Utils.getApiService;
import static com.viewpro.agent.utils.Utils.getStatus;
import static com.viewpro.agent.utils.Utils.getUsername;
import static com.viewpro.agent.utils.Utils.setAvatar;
import static com.viewpro.agent.utils.Utils.setStatus;
import static com.viewpro.agent.utils.Utils.setUsername;

import android.content.Intent;
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
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.viewpro.agent.api.ApiService;

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

        statusSwitch = findViewById(R.id.status_switch);
        statusLabel = findViewById(R.id.status_label);
        logoutButton = findViewById(R.id.logout);
        logoutProgress = findViewById(R.id.logout_progress);

        username = getUsername(this);

        String status = getStatus(this);
        boolean isOnline = "online".equals(status);
        statusSwitch.setChecked(isOnline);
        statusLabel.setText(isOnline ? R.string.online : R.string.offline);

        statusSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            statusLabel.setText(isChecked ? R.string.online : R.string.offline);
            updateStatus(isChecked ? "online" : "offline");
        });

        logoutButton.setOnClickListener(v -> logout());
    }

    private void updateStatus(String status) {
        getApiService().updateStatus(username, status).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<ApiService.Response> call, @NonNull Response<ApiService.Response> response) {
                if (response.isSuccessful() && response.body() != null) {
                    setStatus(MainActivity.this, status);
                } else {
                    Toast.makeText(MainActivity.this, getString(R.string.internal_server_error), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiService.Response> call, @NonNull Throwable t) {
                Log.e(TAG, "Failed to update status: " + t.getMessage());
                Toast.makeText(MainActivity.this, "Failed to update status: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
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
