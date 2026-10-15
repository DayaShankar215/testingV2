package com.secureshield.phishing_backend.scan.feedback.repository;

import com.secureshield.phishing_backend.scan.feedback.entity.FeedbackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntity, UUID> {
    List<FeedbackEntity> findByUserId(UUID userId);

    Optional<FeedbackEntity> findByUserIdAndScanId(UUID userId, UUID scanId);

}
