package com.viewpro.agent;

import static com.viewpro.agent.utils.Utils.KEY_AVATAR;
import static com.viewpro.agent.utils.Utils.KEY_STATUS;
import static com.viewpro.agent.utils.Utils.KEY_USERNAME;
import static com.viewpro.agent.utils.Utils.getApiService;
import static com.viewpro.agent.utils.Utils.getUsername;
import static com.viewpro.agent.utils.Utils.setAvatar;
import static com.viewpro.agent.utils.Utils.setStatus;
import static com.viewpro.agent.utils.Utils.setUsername;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.viewpro.agent.api.ApiService;

import java.util.Map;
import java.util.Objects;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private static final String TAG = "LoginActivity";

    private TextInputLayout usernameLayout;
    private TextInputEditText usernameEditText;
    private TextInputLayout passwordLayout;
    private TextInputEditText passwordEditText;
    private Button loginButton;
    private ProgressBar loginProgress;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.login), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        String username = getUsername(this);
        if (!username.isEmpty()) {
            Intent intent = new Intent(LoginActivity.this, MainActivity.class)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
            return;
        }

        usernameLayout = findViewById(R.id.username_layout);
        usernameEditText = findViewById(R.id.username);
        passwordLayout = findViewById(R.id.password_layout);
        passwordEditText = findViewById(R.id.password);
        loginButton = findViewById(R.id.login);
        loginProgress = findViewById(R.id.loading);

        loginButton.setOnClickListener(v -> login());

        usernameEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                usernameLayout.setError(null);
            }

            @Override
            public void afterTextChanged(Editable s) {
            }
        });

        passwordEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                passwordLayout.setError(null);
            }

            @Override
            public void afterTextChanged(Editable s) {
            }
        });
    }

    private void login() {
        String username = Objects.requireNonNull(usernameEditText.getText()).toString().trim();
        String password = Objects.requireNonNull(passwordEditText.getText()).toString().trim();

        boolean hasError = false;
        if (username.isEmpty()) {
            usernameLayout.setError("The Username is required");
            hasError = true;
        } else {
            usernameLayout.setError(null);
        }

        if (password.isEmpty()) {
            passwordLayout.setError("The password is required");
            hasError = true;
        } else {
            passwordLayout.setError(null);
        }

        if (hasError) {
            return;
        }

        showLoading(true);

        getApiService().login(username, password).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<ApiService.Response> call, @NonNull Response<ApiService.Response> response) {
                showLoading(false);
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(LoginActivity.this, getString(R.string.success_login), Toast.LENGTH_SHORT).show();
                    Object data = response.body().getData();
                    if (data instanceof Map<?, ?> dataMap) {
                        Object user = dataMap.get("user");
                        if (user instanceof Map<?, ?> userMap) {
                            setUsername(LoginActivity.this, String.valueOf(userMap.get(KEY_USERNAME)));
                            setStatus(LoginActivity.this, String.valueOf(userMap.get(KEY_STATUS)));
                            setAvatar(LoginActivity.this, String.valueOf(userMap.get(KEY_AVATAR)));

                            Intent intent = new Intent(LoginActivity.this, MainActivity.class)
                                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                            startActivity(intent);
                            finish();
                        }
                    }
                } else {
                    if (response.code() == 401) {
                        Toast.makeText(LoginActivity.this, getString(R.string.error_invalid_credentials), Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(LoginActivity.this, getString(R.string.internal_server_error), Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiService.Response> call, @NonNull Throwable t) {
                showLoading(false);
                Log.e(TAG, "Failed to login: " + t.getMessage());
                Toast.makeText(LoginActivity.this, "Failed to login: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showLoading(boolean isLoading) {
        loginButton.setEnabled(!isLoading);
        if (isLoading) {
            loginButton.setText("");
            loginProgress.setVisibility(View.VISIBLE);
        } else {
            loginButton.setText(R.string.sign_in);
            loginProgress.setVisibility(View.GONE);
        }
    }
}
