package com.secureshield.phishing_backend.scan.user.service;

import com.secureshield.backend.model.AuthResponse;
import com.secureshield.backend.model.LoginRequest;
import com.secureshield.backend.model.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void logout();
}