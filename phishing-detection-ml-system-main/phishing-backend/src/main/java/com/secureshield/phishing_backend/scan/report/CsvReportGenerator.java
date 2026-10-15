package com.secureshield.phishing_backend.scan.report;

import com.secureshield.phishing_backend.scan.domain.Scan;

public interface CsvReportGenerator {

    byte[] generate(Scan scan);

}
