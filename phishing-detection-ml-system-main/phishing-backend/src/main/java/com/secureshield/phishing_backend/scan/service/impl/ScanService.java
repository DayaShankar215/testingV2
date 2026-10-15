package com.secureshield.phishing_backend.scan.service.impl;

import com.secureshield.backend.model.*;

public interface ScanService {

    ScanResponse scan(ScanRequest request);

    ScanReportResponse getScanByReference(String reference);

    ScanHistoryResponse getAllScans(String email, ScanType type);

    void deleteScan(String reference);

    byte[] downloadScanReport(String reference);

    MessageScanResponse scanMessage(MessageScanRequest request);
}
