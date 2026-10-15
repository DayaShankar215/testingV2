package com.secureshield.phishing_backend.scan.report.impl;

import com.secureshield.backend.model.ScanType;
import com.secureshield.backend.model.UrlAnalysis;
import com.secureshield.phishing_backend.scan.domain.Scan;
import com.secureshield.phishing_backend.scan.report.CsvReportGenerator;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class CsvReportGeneratorImpl implements CsvReportGenerator {

    @Override
    public byte[] generate(Scan scan) {

        if (scan.getScanType() == ScanType.URL) {
            return generateUrlReport(scan);
        }

        return generateMessageReport(scan);
    }

    private byte[] generateUrlReport(Scan scan) {

        StringBuilder csv = new StringBuilder();

        csv.append("Field,Value\n");
        csv.append("Reference,")
                .append(scan.getReference())
                .append("\n");
        csv.append("URL,")
                .append(scan.getUrl())
                .append("\n");
        csv.append("Prediction,")
                .append(scan.getOverallPrediction())
                .append("\n");

        csv.append("\n");
        csv.append("Phishing Reasons\n");
        csv.append("Number,Reason\n");
        int i = 1;
        for (String reason : scan.getPhishingReasons()) {
            csv.append(i++)
                    .append(",\"")
                    .append(reason)
                    .append("\"\n");
        }

        csv.append("\n");
        csv.append("Legitimate Reasons\n");
        csv.append("Number,Reason\n");

        i = 1;
        for (String reason : scan.getLegitimateReasons()) {
            csv.append(i++)
                    .append(",\"")
                    .append(reason)
                    .append("\"\n");
        }

        csv.append("\n");
        csv.append("Conclusion,\"")
                .append(scan.getConclusion())
                .append("\"\n");

        csv.append("Scanned At,")
                .append(scan.getScannedAt())
                .append("\n\n");

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private byte[] generateMessageReport(Scan scan) {

        StringBuilder csv = new StringBuilder();

        csv.append("Field,Value\n");

        csv.append("Reference,")
                .append(scan.getReference())
                .append("\n");

        csv.append("Scan Type,")
                .append(scan.getScanType())
                .append("\n");

        csv.append("Overall Prediction,")
                .append(scan.getOverallPrediction())
                .append("\n");

        csv.append("Message Prediction,")
                .append(scan.getMessagePrediction())
                .append("\n");

        csv.append("Message,\"")
                .append(scan.getMessage())
                .append("\"\n");

        csv.append("Scanned At,")
                .append(scan.getScannedAt())
                .append("\n");

        int i;

        if (scan.getMessageLegitimateReasons() != null
                && !scan.getMessageLegitimateReasons().isEmpty()) {

            csv.append("Message Legitimate Reasons\n");
            csv.append("Number,Reason\n");

            i = 1;
            for (String reason : scan.getMessageLegitimateReasons()) {
                csv.append(i++)
                        .append(",\"")
                        .append(reason)
                        .append("\"\n");
            }

            csv.append("\n");
        }

        if (scan.getMessagePhishingReasons() != null
                && !scan.getMessagePhishingReasons().isEmpty()) {

            csv.append("Message Phishing Reasons\n");
            csv.append("Number,Reason\n");

            i = 1;
            for (String reason : scan.getMessagePhishingReasons()) {
                csv.append(i++)
                        .append(",\"")
                        .append(reason)
                        .append("\"\n");
            }

            csv.append("\n");
        }

        int urlCount = scan.getUrlsFound() == null ? 0 : scan.getUrlsFound().size();

        csv.append("URLs Detected,")
                .append(urlCount)
                .append("\n\n");

        if (urlCount > 0 && scan.getUrlResults() != null) {

            for (int index = 0; index < scan.getUrlResults().size(); index++) {

                UrlAnalysis url = scan.getUrlResults().get(index);

                csv.append("====================================\n");
                csv.append("URL #")
                        .append(index + 1)
                        .append("\n");
                csv.append("====================================\n");

                if (index < scan.getUrlsFound().size()) {
                    csv.append("URL,\"")
                            .append(scan.getUrlsFound().get(index))
                            .append("\"\n");
                }

                csv.append("Prediction,")
                        .append(url.getPrediction())
                        .append("\n");

                csv.append("Conclusion,\"")
                        .append(url.getConclusion())
                        .append("\"\n\n");

                csv.append("Legitimate Reasons\n");
                csv.append("Number,Reason\n");

                int j = 1;
                for (String reason : url.getLegitimateReasons()) {
                    csv.append(j++)
                            .append(",\"")
                            .append(reason)
                            .append("\"\n");
                }

                csv.append("\n");

                csv.append("Phishing Reasons\n");
                csv.append("Number,Reason\n");

                j = 1;
                for (String reason : url.getPhishingReasons()) {
                    csv.append(j++)
                            .append(",\"")
                            .append(reason)
                            .append("\"\n");
                }

                csv.append("\n");

                csv.append("Explanation,\"")
                        .append(url.getFormattedExplanation())
                        .append("\"\n\n");
            }
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}
