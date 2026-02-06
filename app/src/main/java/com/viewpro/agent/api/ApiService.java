package com.viewpro.agent.api;

import retrofit2.Call;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.POST;
import retrofit2.http.PUT;

public interface ApiService {
    @FormUrlEncoded
    @POST("auth/login")
    Call<Response> login(@Field("username") String username, @Field("password") String password);

    @FormUrlEncoded
    @POST("auth/logout")
    Call<Void> logout(@Field("username") String username);

    @FormUrlEncoded
    @PUT("user/status")
    Call<Void> updateStatus(@Field("username") String username, @Field("status") String status);

    @FormUrlEncoded
    @PUT("user/fcm-token")
    Call<Void> updateFCMToken(@Field("username") String username, @Field("fcmToken") String fcmToken);

    class Response {
        private int code;
        private String message;
        private Object data;

        public int getCode() {
            return code;
        }

        public String getMessage() {
            return message;
        }

        public Object getData() {
            return data;
        }
    }
}
