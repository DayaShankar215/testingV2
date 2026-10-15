package com.secureshield.phishing_backend.scan.mapper;

import com.secureshield.backend.model.*;
import com.secureshield.phishing_backend.scan.domain.Scan;
import com.secureshield.phishing_backend.scan.flask.FlaskMessagePredictionResponse;
import com.secureshield.phishing_backend.scan.flask.FlaskPredictionResponse;
import com.secureshield.phishing_backend.scan.flask.FlaskUrlAnalysis;
import com.secureshield.phishing_backend.scan.persistence.entity.ScanEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ScanMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    ScanEntity toEntity(Scan scan);

    Scan toDomain(ScanEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "scannedAt", ignore = true)
    @Mapping(target = "reference", ignore = true)
    @Mapping(target = "scanType", constant = "URL")
    @Mapping(target = "url", source = "url")
    @Mapping(target = "overallPrediction", source = "response.prediction")
    @Mapping(target = "message", ignore = true)
    @Mapping(target = "messagePrediction", ignore = true)
    @Mapping(target = "messagePhishingReasons", ignore = true)
    @Mapping(target = "messageLegitimateReasons", ignore = true)
    @Mapping(target = "urlsFound", ignore = true)
    @Mapping(target = "urlResults", ignore = true)
    Scan fromFlaskResponse(
            FlaskPredictionResponse response,
            String url
    );

    default Prediction map(String prediction) {
        return prediction == null ? null : Prediction.valueOf(prediction);
    }

    ScanHistoryItem toScanHistoryItem(Scan scan);

    ScanResponse toScanResponse(Scan scan);

    UrlScanReportResponse toUrlScanReportResponse(Scan scan);

    MessageScanReportResponse toMessageScanReportResponse(Scan scan);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "url", ignore = true)
    @Mapping(target = "reference", ignore = true)
    @Mapping(target = "scannedAt", ignore = true)
    @Mapping(target = "message", source = "message")
    @Mapping(target = "overallPrediction", source = "response.finalPrediction")
    @Mapping(target = "messagePrediction", source = "response.messagePrediction")
    @Mapping(target = "messageLegitimateReasons", source = "response.messageLegitimateReasons")
    @Mapping(target = "messagePhishingReasons", source = "response.messagePhishingReasons")
    @Mapping(target = "urlsFound", source = "response.urlsFound")
    @Mapping(target = "urlResults", source = "response.urlResults")
    @Mapping(target = "scanType", ignore = true)
    @Mapping(target = "formattedExplanation", ignore = true)
    @Mapping(target = "conclusion", ignore = true)
    @Mapping(target = "legitimateReasons", ignore = true)
    @Mapping(target = "phishingReasons", ignore = true)
    Scan fromMessageFlaskResponse(
            FlaskMessagePredictionResponse response,
            String message);

    @Mapping(target = "urlsDetected",
            expression = "java(scan.getUrlsFound() == null ? 0 : scan.getUrlsFound().size())")
    MessageScanResponse toMessageScanResponse(Scan scan);

    UrlAnalysis toUrlAnalysis(FlaskUrlAnalysis analysis);
}
