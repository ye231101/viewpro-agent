package com.viewpro.agent.utils;

import android.content.Context;
import android.content.SharedPreferences;

import com.viewpro.agent.BuildConfig;
import com.viewpro.agent.api.ApiClient;
import com.viewpro.agent.api.ApiService;

public class Utils {
    public static final String SERVER_URL = BuildConfig.SERVER_URL;
    public static final String BASE_URL = SERVER_URL + "/api/";

    public static final String PREF_NAME = "ViewProPrefs";
    public static final String KEY_USERNAME = "username";
    public static final String KEY_STATUS = "status";
    public static final String KEY_AVATAR = "avatar";

    public static final int PERMISSION_REQUEST_CODE = 1;

    public static final int NOTIFICATION_ID = 1001;
    public static final String INCOMING_CALL_CHANNEL_ID = "INCOMING_CALL";
    public static final String INCOMING_CALL_CHANNEL_NAME = "Incoming Call";
    public static final String INCOMING_CALL_CHANNEL_DESCRIPTION = "Incoming Call Notification";

    public static ApiService apiService;

    private static SharedPreferences getSharedPreferences(Context context) {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static String getUsername(Context context) {
        return getSharedPreferences(context).getString(KEY_USERNAME, "");
    }

    public static void setUsername(Context context, String username) {
        SharedPreferences.Editor editor = getSharedPreferences(context).edit();
        editor.putString(KEY_USERNAME, username);
        editor.apply();
    }

    public static String getStatus(Context context) {
        return getSharedPreferences(context).getString(KEY_STATUS, "");
    }

    public static void setStatus(Context context, String status) {
        SharedPreferences.Editor editor = getSharedPreferences(context).edit();
        editor.putString(KEY_STATUS, status);
        editor.apply();
    }

    public static String getAvatar(Context context) {
        return getSharedPreferences(context).getString(KEY_AVATAR, "");
    }

    public static void setAvatar(Context context, String avatar) {
        SharedPreferences.Editor editor = getSharedPreferences(context).edit();
        editor.putString(KEY_AVATAR, avatar);
        editor.apply();
    }

    public static ApiService getApiService() {
        if (apiService == null) {
            apiService = ApiClient.getApiClient().create(ApiService.class);
        }
        return apiService;
    }
}
