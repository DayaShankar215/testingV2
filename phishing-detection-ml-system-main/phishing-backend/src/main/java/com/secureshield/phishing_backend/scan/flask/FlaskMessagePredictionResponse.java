package com.secureshield.phishing_backend.scan.flask;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class FlaskMessagePredictionResponse {

    @JsonProperty("Final prediction")
    private String finalPrediction;

    @JsonProperty("message_prediction")
    private String messagePrediction;

    @JsonProperty("message_legitimate_reasons")
    private List<String> messageLegitimateReasons;

    @JsonProperty("message_phishing_reasons")
    private List<String> messagePhishingReasons;

    @JsonProperty("prediction_value")
    private Integer predictionValue;

    @JsonProperty("urls_found")
    private List<String> urlsFound;

    @JsonProperty("url_results")
    private List<FlaskUrlAnalysis> urlResults;

}
