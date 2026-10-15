package com.secureshield.phishing_backend.scan.flask;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlaskPredictionRequest {
    private String url;
}
