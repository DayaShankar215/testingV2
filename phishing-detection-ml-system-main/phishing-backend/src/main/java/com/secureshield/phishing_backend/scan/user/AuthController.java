package com.secureshield.phishing_backend.scan.user;

import com.secureshield.backend.api.AuthenticationApi;
import com.secureshield.backend.model.AuthResponse;
import com.secureshield.backend.model.LoginRequest;
import com.secureshield.backend.model.RegisterRequest;
import com.secureshield.phishing_backend.scan.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class AuthController implements AuthenticationApi {

    private final AuthService authService;

    @Override
    public ResponseEntity<AuthResponse> registerUser(RegisterRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @Override
    public ResponseEntity<AuthResponse> loginUser(LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @Override
    public ResponseEntity<Void> logoutUser() {

        authService.logout();

        return ResponseEntity.noContent().build();
    }
}