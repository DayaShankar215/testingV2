package com.secureshield.phishing_backend.scan.feedback.service;

import com.secureshield.backend.model.AccuracyFeedbackRequest;
import com.secureshield.backend.model.AccuracyFeedbackResponse;
import com.secureshield.backend.model.FeedbackRequest;
import com.secureshield.backend.model.FeedbackResponse;
import com.secureshield.phishing_backend.scan.feedback.domain.Feedback;
import com.secureshield.phishing_backend.scan.feedback.entity.FeedbackEntity;
import com.secureshield.phishing_backend.scan.feedback.mapper.FeedbackMapper;
import com.secureshield.phishing_backend.scan.feedback.repository.FeedbackRepository;
import com.secureshield.phishing_backend.scan.persistence.entity.ScanEntity;
import com.secureshield.phishing_backend.scan.repository.JpaScanRepository;
import com.secureshield.phishing_backend.scan.user.entity.UserEntity;
import com.secureshield.phishing_backend.scan.user.repository.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {


    private final FeedbackRepository feedbackRepository;
    private final JpaScanRepository scanRepository;
    private final JpaUserRepository userRepository;
    private final FeedbackMapper mapper;


    @Override
    public FeedbackResponse createFeedback(
            FeedbackRequest request,
            UUID userId) {


        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        ScanEntity scan = null;


        if (request.getReference() != null) {
            scan = scanRepository.findByReference(request.getReference())
                    .orElseThrow(() ->
                            new RuntimeException("Scan not found"));

            if (!scan.getUser().getId().equals(userId)) {
                throw new RuntimeException("Not your scan");
            }
        }

        FeedbackEntity entity = FeedbackEntity.builder()
                .user(user)
                .scan(scan)
                .message(request.getMessage())
                .createdAt(OffsetDateTime.now())
                .build();

        FeedbackEntity savedEntity =
                feedbackRepository.save(entity);

        Feedback saved =
                mapper.toDomain(savedEntity);

        return mapper.toResponse(saved);
    }


    @Override
    public List<FeedbackResponse> getFeedback(UUID userId) {


        return feedbackRepository.findByUserId(userId)
                .stream()
                .map(mapper::toDomain)
                .map(mapper::toResponse)
                .toList();

    }

    @Override
    public AccuracyFeedbackResponse submitAccuracyFeedback(
            AccuracyFeedbackRequest request,
            UUID userId) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        ScanEntity scan = scanRepository.findByReference(request.getReference())
                .orElseThrow(() ->
                        new RuntimeException("Scan not found"));

        if (!scan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not your scan");
        }

        FeedbackEntity entity = feedbackRepository
                .findByUserIdAndScanId(userId, scan.getId())
                .orElseGet(() -> {

                    FeedbackEntity feedback = new FeedbackEntity();

                    feedback.setUser(user);
                    feedback.setScan(scan);

                    return feedback;
                });

        entity.setAccurate(request.getAccurate());

        entity.setMessage(null);

        FeedbackEntity savedEntity =
                feedbackRepository.save(entity);

        Feedback saved =
                mapper.toDomain(savedEntity);

        AccuracyFeedbackResponse response =
                mapper.toAccuracyResponse(saved);

        response.setReference(scan.getReference());

        return response;
    }


}