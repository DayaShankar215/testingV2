package com.secureshield.phishing_backend.scan.repository;

import com.secureshield.backend.model.ScanType;
import com.secureshield.phishing_backend.scan.persistence.entity.ScanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaScanRepository extends JpaRepository<ScanEntity, UUID> {

    Optional<ScanEntity> findByReference(String reference);

    List<ScanEntity> findByUserEmail(String email);

    List<ScanEntity> findByUserEmailAndScanType(String email, ScanType scanType);
}
