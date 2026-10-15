package com.secureshield.phishing_backend.scan.flask;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.validation.ConstraintViolationException;


import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @ExceptionHandler(FlaskValidationException.class)
    public ResponseEntity<Map<String, String>> handleFlaskValidationException(FlaskValidationException ex) {
        try {
            JsonNode node = objectMapper.readTree(ex.getMessage());
            String errorMessage = node.get("error").asText();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", errorMessage));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", ex.getMessage()));
        }
    }


    // Handles ConstraintViolationException
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolationException(ConstraintViolationException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(Map.of("error", ex.getMessage() != null ? ex.getMessage() : "Constraint violation"));
    }
}