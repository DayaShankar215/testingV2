// services/pdfGenerator.js
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Generate a professional PDF report for a scan
 * @param {Object} scanData - The scan data from the API
 * @param {string} type - 'url' or 'message'
 * @returns {jsPDF} - The generated PDF document
 */
export const generatePDFReport = (scanData, type) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // ==================== HEADER ====================
  // Gradient Header
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Add decorative circle in header
  doc.setFillColor(255, 255, 255, 0.08);
  doc.circle(pageWidth - 30, -10, 60, 'F');
  doc.setFillColor(255, 255, 255, 0.05);
  doc.circle(30, 55, 50, 'F');

  // Logo / Icon
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('🛡️', margin, 30);

  // Title
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('SecureShield', margin + 12, 28);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 230, 255);
  doc.text('AI-Powered Security Report', margin + 12, 36);

  // Report ID
  doc.setFontSize(9);
  doc.setTextColor(200, 215, 255);
  doc.text(`Report ID: ${scanData.reference || 'N/A'}`, pageWidth - margin - 50, 20);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 50, 28);

  y = 55;

  // ==================== DIVIDER LINE ====================
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ==================== SCAN SUMMARY ====================
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 60);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 Scan Summary', margin, y);
  y += 10;

  // Risk Score with Color
  const riskScore = scanData.riskScore || 50;
  let riskColor = [16, 185, 129]; // Green
  let riskLabel = 'LOW RISK';
  let riskBg = [209, 250, 229];

  if (riskScore > 70) {
    riskColor = [239, 68, 68]; // Red
    riskLabel = 'HIGH RISK';
    riskBg = [254, 226, 226];
  } else if (riskScore > 30) {
    riskColor = [245, 158, 11]; // Yellow
    riskLabel = 'MEDIUM RISK';
    riskBg = [254, 243, 199];
  }

  // Risk Score Card
  const cardX = margin;
  const cardY = y;
  const cardWidth = contentWidth;
  const cardHeight = 40;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, 'F');
  doc.setDrawColor(220, 220, 240);
  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, 'S');

  // Risk Score Value
  doc.setFontSize(36);
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`${Math.round(riskScore)}%`, margin + 15, cardY + 28);

  // Risk Label
  doc.setFontSize(14);
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(riskLabel, margin + 50, cardY + 22);

  // Prediction
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prediction: ${scanData.prediction || 'N/A'}`, margin + 50, cardY + 34);

  // Risk bar
  const barX = margin + 120;
  const barY = cardY + 12;
  const barWidth = contentWidth - 130;
  const barHeight = 6;

  doc.setFillColor(230, 230, 240);
  doc.roundedRect(barX, barY, barWidth, barHeight, 3, 3, 'F');

  const fillWidth = (riskScore / 100) * barWidth;
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(barX, barY, fillWidth, barHeight, 3, 3, 'F');

  // Risk labels
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 170);
  doc.setFont('helvetica', 'normal');
  doc.text('Low', barX, barY + barHeight + 5);
  doc.text('Medium', barX + barWidth / 2 - 10, barY + barHeight + 5);
  doc.text('High', barX + barWidth - 10, barY + barHeight + 5);

  y = cardY + cardHeight + 12;

  // ==================== SCAN DETAILS TABLE ====================
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 60);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 Scan Details', margin, y);
  y += 8;

  const detailsData = [
    ['Reference', scanData.reference || 'N/A'],
    ['Type', type === 'url' ? 'URL Scan' : 'Message Scan'],
    ['Content', scanData.url || scanData.message || 'N/A'],
    ['Scanned At', new Date(scanData.scannedAt || Date.now()).toLocaleString()],
  ];

  doc.autoTable({
    startY: y,
    head: [['Field', 'Value']],
    body: detailsData,
    theme: 'striped',
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 6,
      lineColor: [200, 200, 220],
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold', textColor: [60, 60, 80] },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ==================== CONCLUSION ====================
  if (scanData.conclusion) {
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 60);
    doc.setFont('helvetica', 'bold');
    doc.text('📝 Analysis Conclusion', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 80);
    doc.setFont('helvetica', 'normal');
    const conclusionLines = doc.splitTextToSize(scanData.conclusion, contentWidth);
    doc.text(conclusionLines, margin, y);
    y += conclusionLines.length * 5 + 10;
  }

  // ==================== PHISHING REASONS ====================
  if (scanData.phishingReasons && scanData.phishingReasons.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('🚨 Phishing Indicators', margin, y);
    y += 8;

    const phishingData = scanData.phishingReasons.map((reason, i) => [
      i + 1,
      reason
    ]);

    doc.autoTable({
      startY: y,
      head: [['#', 'Reason']],
      body: phishingData,
      theme: 'striped',
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        lineColor: [200, 200, 220],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ==================== LEGITIMATE REASONS ====================
  if (scanData.legitimateReasons && scanData.legitimateReasons.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('✅ Legitimate Indicators', margin, y);
    y += 8;

    const legitData = scanData.legitimateReasons.map((reason, i) => [
      i + 1,
      reason
    ]);

    doc.autoTable({
      startY: y,
      head: [['#', 'Reason']],
      body: legitData,
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        lineColor: [200, 200, 220],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ==================== RECOMMENDATION ====================
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 60);
  doc.setFont('helvetica', 'bold');
  doc.text('🛡️ Security Recommendation', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 80);
  doc.setFont('helvetica', 'normal');

  let recommendation = '';
  if (riskScore > 70) {
    recommendation = '🚫 DO NOT proceed to this website. Report this URL to security authorities immediately. This is a confirmed phishing attempt designed to steal your credentials.';
  } else if (riskScore > 30) {
    recommendation = '⚠️ Exercise extreme caution. Verify the website\'s authenticity through official channels before entering any personal information or credentials.';
  } else {
    recommendation = '✅ You can safely proceed. However, always verify the URL matches the official website before entering sensitive information.';
  }

  const recLines = doc.splitTextToSize(recommendation, contentWidth);
  doc.text(recLines, margin, y);
  y += recLines.length * 5 + 10;

  // ==================== FOOTER ====================
  // Add footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    // Footer text
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 170);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount} • Generated by SecureShield AI Security • ${new Date().getFullYear()}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );

    // Footer logo
    doc.setFontSize(6);
    doc.setTextColor(180, 180, 200);
    doc.text('🔒 SecureShield', margin, pageHeight - 8);
  }

  return doc;
};

/**
 * Download the PDF report
 * @param {Object} scanData - The scan data from the API
 * @param {string} type - 'url' or 'message'
 */
export const downloadPDF = (scanData, type) => {
  const doc = generatePDFReport(scanData, type);
  const fileName = `security_report_${scanData.reference || Date.now()}.pdf`;
  doc.save(fileName);
};

/**
 * Get PDF as blob for sharing
 * @param {Object} scanData - The scan data from the API
 * @param {string} type - 'url' or 'message'
 * @returns {Blob} - The PDF as a Blob
 */
export const getPDFBlob = (scanData, type) => {
  const doc = generatePDFReport(scanData, type);
  return doc.output('blob');
};