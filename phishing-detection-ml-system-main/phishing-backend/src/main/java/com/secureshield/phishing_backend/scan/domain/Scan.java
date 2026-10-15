package com.secureshield.phishing_backend.scan.domain;


import com.secureshield.backend.model.Prediction;
import com.secureshield.backend.model.ScanType;
import com.secureshield.backend.model.UrlAnalysis;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class Scan {

    private UUID id;
    private String reference;
    private ScanType scanType;
    private String url;
    private String message;
    private Prediction overallPrediction;
    private Prediction messagePrediction;
    private String conclusion;
    private String formattedExplanation;
    private List<String> phishingReasons;
    private List<String> legitimateReasons;
    private List<String> messagePhishingReasons;
    private List<String> messageLegitimateReasons;
    private List<String> urlsFound;
    private List<UrlAnalysis> urlResults;
    private OffsetDateTime scannedAt;
}



