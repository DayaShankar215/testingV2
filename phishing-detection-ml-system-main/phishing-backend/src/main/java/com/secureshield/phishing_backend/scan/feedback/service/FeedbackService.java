package com.secureshield.phishing_backend.scan.feedback.service;

import com.secureshield.backend.model.AccuracyFeedbackRequest;
import com.secureshield.backend.model.AccuracyFeedbackResponse;
import com.secureshield.backend.model.FeedbackRequest;
import com.secureshield.backend.model.FeedbackResponse;

import java.util.List;
import java.util.UUID;

public interface FeedbackService {
    FeedbackResponse createFeedback(FeedbackRequest request, UUID userId);

    List<FeedbackResponse> getFeedback(UUID userId);

    AccuracyFeedbackResponse submitAccuracyFeedback(AccuracyFeedbackRequest request, UUID userId);
}
