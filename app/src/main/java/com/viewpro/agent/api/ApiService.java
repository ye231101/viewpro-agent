package com.viewpro.agent.api;

import retrofit2.Call;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.POST;

public interface ApiService {
    @FormUrlEncoded
    @POST("auth/login")
    Call<Response> login(@Field("username") String username, @Field("password") String password);

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
