package com.secureshield.phishing_backend.scan.feedback.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    private UUID id;

    private UUID userId;

    private UUID scanId;

    private String message;

    private boolean accurate;

    private OffsetDateTime createdAt;
}
