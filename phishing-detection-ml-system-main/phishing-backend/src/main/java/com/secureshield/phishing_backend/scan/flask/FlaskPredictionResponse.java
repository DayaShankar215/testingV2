package com.secureshield.phishing_backend.scan.flask;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class FlaskPredictionResponse {

    private String prediction;

    private String conclusion;

    @JsonProperty("formatted_explanation")
    private String formattedExplanation;

    @JsonProperty("phishing_reasons")
    private List<String> phishingReasons;

    @JsonProperty("legitimate_reasons")
    private List<String> legitimateReasons;

}
