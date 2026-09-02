package com.paymentplatform.reconciliation.parser;

import com.paymentplatform.reconciliation.entity.ReconciliationEntry;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Parses ISO 20022 camt.053 (BankToCustomerStatement) XML files.
 * Schema: https://www.iso20022.org/standardsrepository/18810245
 *
 * Uses namespace-aware DOM parsing for full XPath support.
 */
@Component
@Slf4j
public class Camt053Parser {

    private static final String NS = "urn:iso:std:iso:20022:tech:xsd:camt.053.001.02";

    public record ParsedStatement(
        String fileHash,
        String iban,
        Instant statementDate,
        BigDecimal openingBalance,
        BigDecimal closingBalance,
        List<ReconciliationEntry> entries
    ) {}

    public Optional<ParsedStatement> parse(String xmlContent) {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            dbf.setNamespaceAware(true);

            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new InputSource(new StringReader(xmlContent)));

            String iban = getTextByTag(doc, "IBAN");
            String stmtDateStr = getTextByTag(doc, "CreDtTm");
            Instant stmtDate = stmtDateStr != null
                ? Instant.parse(stmtDateStr)
                : Instant.now();

            BigDecimal openingBalance = parseAmount(doc, "OpngBal");
            BigDecimal closingBalance = parseAmount(doc, "ClsgBal");

            List<ReconciliationEntry> entries = parseEntries(doc);

            return Optional.of(new ParsedStatement(
                null, iban, stmtDate, openingBalance, closingBalance, entries
            ));
        } catch (Exception e) {
            log.error("Failed to parse camt.053 statement: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private BigDecimal parseAmount(Document doc, String tag) {
        NodeList nodes = doc.getElementsByTagNameNS(NS, tag);
        if (nodes.getLength() == 0) {
            nodes = doc.getElementsByTagName(tag);
        }
        if (nodes.getLength() == 0) return BigDecimal.ZERO;

        Element bal = (Element) nodes.item(0);
        String amt = getText(bal, "Amt");
        if (amt == null) {
            NodeList amtIn = bal.getElementsByTagNameNS(NS, "Amt");
            if (amtIn.getLength() > 0) amt = amtIn.item(0).getTextContent();
        }
        String ccy = getText(bal, "Ccy");
        if (ccy == null) {
            NodeList ccyIn = bal.getElementsByTagNameNS(NS, "Ccy");
            if (ccyIn.getLength() > 0) ccy = ccyIn.item(0).getTextContent();
        }
        return amt != null ? new BigDecimal(amt) : BigDecimal.ZERO;
    }

    private List<ReconciliationEntry> parseEntries(Document doc) {
        List<ReconciliationEntry> result = new ArrayList<>();
        NodeList txList = doc.getElementsByTagNameNS(NS, "Ntry");
        if (txList.getLength() == 0) {
            txList = doc.getElementsByTagName("Ntry");
        }

        for (int i = 0; i < txList.getLength(); i++) {
            Element ntry = (Element) txList.item(i);
            ReconciliationEntry entry = parseEntry(ntry);
            if (entry != null) result.add(entry);
        }
        return result;
    }

    private ReconciliationEntry parseEntry(Element ntry) {
        String amount = getText(ntry, "Amt");
        String ccy = getText(ntry, "Ccy");
        String valueDateStr = getTextByTag(ntry, "ValDt");
        String bookingDateStr = getTextByTag(ntry, "BookgDt");
        String endToEndId = getText(ntry, "EndToEndId");
        String iban = getText(ntry, "IBAN");
        String name = getText(ntry, "Nm");
        String ref = getText(ntry, "Ustrd");

        Instant valueDate = parseDate(valueDateStr);
        if (valueDate == null) valueDate = parseDate(bookingDateStr);
        if (valueDate == null) valueDate = Instant.now();

        return ReconciliationEntry.builder()
            .endToEndId(endToEndId)
            .amount(amount != null ? new BigDecimal(amount) : BigDecimal.ZERO)
            .currency(ccy != null ? ccy : "EUR")
            .valueDate(valueDate)
            .counterpartyIban(iban)
            .counterpartyName(name)
            .reference(ref)
            .matchStatus(ReconciliationEntry.MatchStatus.PENDING)
            .build();
    }

    private String getText(Element parent, String tag) {
        NodeList nodes = parent.getElementsByTagNameNS(NS, tag);
        if (nodes.getLength() == 0) {
            nodes = parent.getElementsByTagName(tag);
        }
        return nodes.getLength() > 0 ? nodes.item(0).getTextContent() : null;
    }

    private String getTextByTag(Document doc, String tag) {
        NodeList nodes = doc.getElementsByTagNameNS(NS, tag);
        if (nodes.getLength() == 0) {
            nodes = doc.getElementsByTagName(tag);
        }
        return nodes.getLength() > 0 ? nodes.item(0).getTextContent() : null;
    }

    private String getTextByTag(Element parent, String tag) {
        NodeList nodes = parent.getElementsByTagNameNS(NS, tag);
        if (nodes.getLength() == 0) {
            nodes = parent.getElementsByTagName(tag);
        }
        return nodes.getLength() > 0 ? nodes.item(0).getTextContent() : null;
    }

    private Instant parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE)
                .atStartOfDay().toInstant(ZoneOffset.UTC);
        } catch (Exception e1) {
            try {
                return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME)
                    .toInstant(ZoneOffset.UTC);
            } catch (Exception e2) {
                return null;
            }
        }
    }
}
