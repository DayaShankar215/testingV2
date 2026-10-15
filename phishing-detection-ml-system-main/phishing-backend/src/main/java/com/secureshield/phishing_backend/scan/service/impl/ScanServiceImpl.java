package com.secureshield.phishing_backend.scan.service.impl;

import com.secureshield.backend.model.*;
import com.secureshield.phishing_backend.scan.domain.Scan;
import com.secureshield.phishing_backend.scan.flask.FlaskClient;
import com.secureshield.phishing_backend.scan.flask.FlaskMessagePredictionResponse;
import com.secureshield.phishing_backend.scan.flask.FlaskPredictionResponse;
import com.secureshield.phishing_backend.scan.mapper.ScanMapper;
import com.secureshield.phishing_backend.scan.persistence.entity.ScanEntity;
import com.secureshield.phishing_backend.scan.report.CsvReportGenerator;
import com.secureshield.phishing_backend.scan.repository.JpaScanRepository;
import com.secureshield.phishing_backend.scan.user.entity.UserEntity;
import com.secureshield.phishing_backend.scan.user.repository.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScanServiceImpl implements ScanService {

    private final JpaUserRepository userRepository;
    private final CsvReportGenerator csvReportGenerator;
    private final FlaskClient flaskClient;
    private final JpaScanRepository scanRepository;
    private final ScanMapper scanMapper;


    @Override
    public ScanResponse scan(ScanRequest request) {


        FlaskPredictionResponse flaskResponse =
                flaskClient.predict(request.getUrl());


        Scan scan =
                scanMapper.fromFlaskResponse(
                        flaskResponse,
                        request.getUrl()
                );

        scan.setReference(generateReference());

        scan.setScannedAt(
                OffsetDateTime.now()
        );


        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {


            String email = authentication.getName();


            UserEntity user =
                    userRepository.findByEmail(email)
                            .orElseThrow();


            ScanEntity entity =
                    scanMapper.toEntity(scan);


            entity.setUser(user);


            ScanEntity saved =
                    scanRepository.save(entity);


            return scanMapper.toScanResponse(
                    scanMapper.toDomain(saved)
            );
        }


        return scanMapper.toScanResponse(scan);
    }


    @Override
    public MessageScanResponse scanMessage(MessageScanRequest request) {

        FlaskMessagePredictionResponse flaskResponse =
                flaskClient.predictMessage(request.getMessage());

        Scan scan = scanMapper.fromMessageFlaskResponse(
                flaskResponse,
                request.getMessage()
        );

        scan.setReference(generateReference());
        scan.setScanType(ScanType.MESSAGE);
        scan.setScannedAt(OffsetDateTime.now());


        if (scan.getUrlsFound() == null || scan.getUrlsFound().isEmpty()) {

            scan.setConclusion(
                    "Message classified as "
                            + scan.getOverallPrediction()
                            + ". No URLs were detected."
            );

        } else {

            scan.setConclusion(
                    String.format(
                            "Message classified as %s. %d URL(s) were detected and analyzed. View the details for URL-specific explanations.",
                            scan.getOverallPrediction(),
                            scan.getUrlsFound().size()
                    )
            );
        }

        scan.setFormattedExplanation(null);
        scan.setLegitimateReasons(List.of());
        scan.setPhishingReasons(List.of());

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {

            String email = authentication.getName();

            UserEntity user =
                    userRepository.findByEmail(email)
                            .orElseThrow();

            ScanEntity entity = scanMapper.toEntity(scan);
            entity.setUser(user);

            ScanEntity saved = scanRepository.save(entity);

            return scanMapper.toMessageScanResponse(
                    scanMapper.toDomain(saved)
            );
        }

        return scanMapper.toMessageScanResponse(scan);
    }


    @Override
    public ScanReportResponse getScanByReference(String reference) {

        ScanEntity entity =
                scanRepository.findByReference(reference)
                        .orElseThrow();

        Scan scan = scanMapper.toDomain(entity);

        if (scan.getScanType() == ScanType.URL) {

            return scanMapper.toUrlScanReportResponse(scan);
        }

        return scanMapper.toMessageScanReportResponse(scan);
    }

    private String generateReference() {

        return "SCAN-" + UUID.randomUUID();

    }

    @Override
    public ScanHistoryResponse getAllScans(String email, ScanType type) {

        List<ScanEntity> entities;

        if (type == null) {
            entities = scanRepository.findByUserEmail(email);
        } else {
            entities = scanRepository.findByUserEmailAndScanType(email, type);
        }

        List<ScanHistoryItem> scans = entities.stream()
                .map(scanMapper::toDomain)
                .map(scanMapper::toScanHistoryItem)
                .toList();

        ScanHistoryResponse response = new ScanHistoryResponse();
        response.setScans(scans);

        return response;
    }

    @Override
    public void deleteScan(String reference) {

        ScanEntity entity = scanRepository.findByReference(reference)
                .orElseThrow(() -> new RuntimeException("Scan not found"));

        scanRepository.delete(entity);
    }

    @Override
    public byte[] downloadScanReport(String reference) {

        ScanEntity entity = scanRepository.findByReference(reference)
                .orElseThrow(() -> new RuntimeException("Scan not found"));

        Scan scan = scanMapper.toDomain(entity);

        return csvReportGenerator.generate(scan);
    }


}
