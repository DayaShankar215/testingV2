package com.secureshield.phishing_backend.scan.user.service;

import com.secureshield.backend.model.AuthResponse;
import com.secureshield.backend.model.LoginRequest;
import com.secureshield.backend.model.RegisterRequest;
import com.secureshield.backend.model.UserRole;
import com.secureshield.phishing_backend.scan.user.domain.User;
import com.secureshield.phishing_backend.scan.user.entity.UserEntity;
import com.secureshield.phishing_backend.scan.user.mapper.AuthMapper;
import com.secureshield.phishing_backend.scan.user.repository.JpaUserRepository;
import com.secureshield.phishing_backend.scan.user.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JpaUserRepository userRepository;
    private final AuthMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists.");
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .createdAt(OffsetDateTime.now())
                .build();

        UserEntity entity = mapper.toEntity(user);

        userRepository.save(entity);

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse()
                .accessToken(token)
                .user(mapper.toResponse(user));
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        UserEntity entity = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials."));

        User user = mapper.toDomain(entity);

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse()
                .accessToken(token)
                .user(mapper.toResponse(user));
    }

    @Override
    public void logout() {
    }
}