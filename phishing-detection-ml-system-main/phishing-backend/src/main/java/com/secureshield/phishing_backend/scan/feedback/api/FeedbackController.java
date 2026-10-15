package com.secureshield.phishing_backend.scan.feedback.api;

import com.secureshield.backend.api.FeedbackApi;
import com.secureshield.backend.model.AccuracyFeedbackRequest;
import com.secureshield.backend.model.AccuracyFeedbackResponse;
import com.secureshield.backend.model.FeedbackRequest;
import com.secureshield.backend.model.FeedbackResponse;
import com.secureshield.phishing_backend.scan.feedback.CurrentUser;
import com.secureshield.phishing_backend.scan.feedback.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class FeedbackController implements FeedbackApi {

    private final FeedbackService feedbackService;
    private final CurrentUser currentUser;

    @Override
    public ResponseEntity<FeedbackResponse> submitFeedback(FeedbackRequest request) {
        UUID userId = currentUser.getUserId();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        feedbackService.createFeedback(
                                request,
                                userId
                        )
                );
    }

    @Override
    public ResponseEntity<List<FeedbackResponse>> getFeedback() {

        UUID userId = currentUser.getUserId();

        return ResponseEntity.ok(
                feedbackService.getFeedback(userId)
        );
    }

    @Override
    public ResponseEntity<AccuracyFeedbackResponse> submitAccuracyFeedback(
            AccuracyFeedbackRequest request) {

        UUID userId = currentUser.getUserId();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        feedbackService.submitAccuracyFeedback(
                                request,
                                userId
                        )
                );
    }
}
