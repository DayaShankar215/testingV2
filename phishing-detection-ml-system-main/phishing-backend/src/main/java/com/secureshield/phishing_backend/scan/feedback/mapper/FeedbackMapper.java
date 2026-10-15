package com.secureshield.phishing_backend.scan.feedback.mapper;

import com.secureshield.backend.model.AccuracyFeedbackResponse;
import com.secureshield.backend.model.FeedbackResponse;
import com.secureshield.phishing_backend.scan.feedback.domain.Feedback;
import com.secureshield.phishing_backend.scan.feedback.entity.FeedbackEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    @Mapping(
            target = "reply",
            expression = "java(\"Thank you for your valuable feedback!\")"
    )
    FeedbackResponse toResponse(Feedback feedback);

    @Mapping(target = "reference", ignore = true)
    @Mapping(
            target = "reply",
            expression = "java(\"Thank you for helping improve SecureShield!\")"
    )
    AccuracyFeedbackResponse toAccuracyResponse(Feedback feedback);

    FeedbackEntity toEntity(Feedback feedback);

    Feedback toDomain(FeedbackEntity entity);
}
