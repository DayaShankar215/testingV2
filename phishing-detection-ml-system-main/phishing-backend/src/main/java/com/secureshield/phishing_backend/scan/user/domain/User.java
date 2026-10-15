package com.secureshield.phishing_backend.scan.user.domain;

import com.secureshield.backend.model.UserRole;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class User {

    private UUID id;

    private String firstName;

    private String lastName;

    private String email;

    private String password;

    private UserRole role;

    private OffsetDateTime createdAt;
}
