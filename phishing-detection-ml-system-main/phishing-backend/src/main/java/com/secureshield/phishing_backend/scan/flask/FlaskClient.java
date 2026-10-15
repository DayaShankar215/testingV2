package com.secureshield.phishing_backend.scan.flask;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class FlaskClient {

    private final RestClient restClient;

    @Value("${flask.base-url}")
    private String flaskBaseUrl;

    public FlaskPredictionResponse predict(String url) {

        FlaskPredictionRequest request =
                new FlaskPredictionRequest(url);

        try {
            return restClient.post()
                    .uri(flaskBaseUrl + "/predict")
                    .body(request)
                    .retrieve()
                    .body(FlaskPredictionResponse.class);

        } catch (HttpClientErrorException.BadRequest ex) {
            throw new FlaskValidationException(ex.getResponseBodyAsString());
        }

    }

    public FlaskMessagePredictionResponse predictMessage(String message) {

        FlaskMessagePredictionRequest request =
                new FlaskMessagePredictionRequest(message);

        try {

            return restClient.post()
                    .uri(flaskBaseUrl + "/predict/message")
                    .body(request)
                    .retrieve()
                    .body(FlaskMessagePredictionResponse.class);

        } catch (HttpClientErrorException.BadRequest ex) {

            throw new FlaskValidationException(
                    ex.getResponseBodyAsString());

        }

    }
}

