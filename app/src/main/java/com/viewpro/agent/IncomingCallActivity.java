package com.viewpro.agent;

import static com.viewpro.agent.utils.Utils.NOTIFICATION_ID;

import android.app.NotificationManager;
import android.content.Context;
import android.os.Bundle;
import android.widget.SeekBar;
import android.widget.TextView;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.viewpro.agent.service.RingtoneService;

public class IncomingCallActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_incoming_call);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.incoming_call), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.cancel(NOTIFICATION_ID);
        }

        setShowWhenLocked(true);
        setTurnScreenOn(true);

        String callerName = getIntent().getStringExtra("callerName");

        TextView nameView = findViewById(R.id.caller_name);
        nameView.setText(callerName != null ? callerName : getString(R.string.client));

        SeekBar slideToAnswer = findViewById(R.id.slide_to_answer);
        slideToAnswer.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                // Optional: Provide feedback as user slides
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                // Optional: Handle start of slide
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                if (seekBar.getProgress() > 50) {
                    RingtoneService.stopRinging();
                }
                seekBar.setProgress(0);
            }
        });

        // Disable back navigation while on the incoming call screen
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                // Intentionally no-op to block back navigation
            }
        });
    }

    @Override
    protected void onDestroy() {
        RingtoneService.stopRinging();
        super.onDestroy();
    }
}
