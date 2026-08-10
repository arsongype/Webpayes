package com.paymentplatform.qrcode.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.paymentplatform.qrcode.dto.QrGenerateRequest;
import com.paymentplatform.qrcode.dto.QrGenerateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QrCodeService {

    private static final int QR_SIZE = 400;
    private static final String QR_PREFIX = "WEBPAY-QR://pay?";

    public QrGenerateResponse generatePaymentQr(QrGenerateRequest request) {
        String reference = "QR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        String qrPayload = String.format(
                "ref=%s&merchant=%s&account=%s&amount=%s&currency=%s&desc=%s",
                reference,
                encode(request.getMerchantName()),
                encode(request.getAccountNumber()),
                request.getAmount() != null ? request.getAmount().toPlainString() : "",
                encode(request.getCurrency() != null ? request.getCurrency() : "MGA"),
                encode(request.getDescription() != null ? request.getDescription() : "")
        );

        String fullQrData = QR_PREFIX + qrPayload;
        String qrDataUrl = generateQrImage(fullQrData);

        return QrGenerateResponse.builder()
                .qrDataUrl(qrDataUrl)
                .paymentReference(reference)
                .merchantName(request.getMerchantName())
                .accountNumber(request.getAccountNumber())
                .amount(request.getAmount() != null ? request.getAmount().toPlainString() : null)
                .currency(request.getCurrency() != null ? request.getCurrency() : "MGA")
                .description(request.getDescription())
                .build();
    }

    public byte[] generatePaymentQrPdf(QrGenerateRequest request) {
        try {
            QrGenerateResponse qrResponse = generatePaymentQr(request);
            String base64Image = qrResponse.getQrDataUrl().split(",")[1];
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            document.add(new Paragraph("QR Code de Paiement"));
            document.add(new Paragraph("Référence: " + qrResponse.getPaymentReference()));
            document.add(new Paragraph("Commerçant: " + qrResponse.getMerchantName()));
            document.add(new Paragraph("Compte: " + qrResponse.getAccountNumber()));
            if (qrResponse.getAmount() != null) {
                document.add(new Paragraph("Montant: " + qrResponse.getAmount() + " " + qrResponse.getCurrency()));
            }
            if (qrResponse.getDescription() != null && !qrResponse.getDescription().isEmpty()) {
                document.add(new Paragraph("Description: " + qrResponse.getDescription()));
            }
            document.add(new Paragraph(" "));

            Image qrImage = Image.getInstance(imageBytes);
            qrImage.scaleToFit(300, 300);
            qrImage.setAlignment(Image.ALIGN_CENTER);
            document.add(qrImage);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de générer le PDF du QR Code", e);
        }
    }

    public String parseQrData(String qrData) {
        if (qrData == null || !qrData.startsWith(QR_PREFIX)) {
            return null;
        }
        return qrData.substring(QR_PREFIX.length());
    }

    private String generateQrImage(String data) {
        try {
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.MARGIN, 2);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            QRCodeWriter qrWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrWriter.encode(data, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);

            BufferedImage qrImage = new BufferedImage(QR_SIZE, QR_SIZE, BufferedImage.TYPE_INT_RGB);
            qrImage.createGraphics();

            Graphics2D graphics = (Graphics2D) qrImage.getGraphics();
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, QR_SIZE, QR_SIZE);
            graphics.setColor(Color.BLACK);

            for (int x = 0; x < QR_SIZE; x++) {
                for (int y = 0; y < QR_SIZE; y++) {
                    if (bitMatrix.get(x, y)) {
                        qrImage.setRGB(x, y, Color.BLACK.getRGB());
                    }
                }
            }
            graphics.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "png", baos);
            String base64 = Base64.getEncoder().encodeToString(baos.toByteArray());
            return "data:image/png;base64," + base64;
        } catch (WriterException | IOException e) {
            throw new IllegalStateException("Impossible de générer le QR Code", e);
        }
    }

    private String encode(String value) {
        if (value == null) return "";
        return value.replace("&", "%26").replace("=", "%3D").replace(" ", "+");
    }
}
