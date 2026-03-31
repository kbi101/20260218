package com.pao.service;

import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.data.MutableDataSet;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.List;

@Service
public class ResumeConversionService {

    public byte[] convertMarkdownToPdf(String markdown) throws IOException {
        String html = convertMarkdownToHtml(markdown);
        // openhtmltopdf requires well-formed XML/XHTML
        org.jsoup.nodes.Document doc = org.jsoup.Jsoup.parse(html);
        doc.outputSettings().syntax(org.jsoup.nodes.Document.OutputSettings.Syntax.xml);
        String xhtml = doc.html();

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(xhtml, "");
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        }
    }

    public byte[] convertMarkdownToWord(String markdown) throws IOException {
        // Simple HTML to Word conversion using POI
        try (XWPFDocument doc = new XWPFDocument();
                ByteArrayOutputStream os = new ByteArrayOutputStream()) {

            // Very basic conversion: stripping HTML tags for now, or just injecting text
            // In a real app, we'd use a better HTML->Docx library, but POI can do basics
            XWPFParagraph p = doc.createParagraph();
            XWPFRun r = p.createRun();
            r.setText(markdown); // Since MS Word supports plain text, and we want to preserve MD flavor or raw
                                 // text

            doc.write(os);
            return os.toByteArray();
        }
    }

    public String importFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public String importFromWord(MultipartFile file) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
            StringBuilder sb = new StringBuilder();
            List<XWPFParagraph> paragraphs = doc.getParagraphs();
            for (XWPFParagraph p : paragraphs) {
                sb.append(p.getText()).append("\n");
            }
            return sb.toString();
        }
    }

    private String convertMarkdownToHtml(String markdown) {
        MutableDataSet options = new MutableDataSet();
        Parser parser = Parser.builder(options).build();
        HtmlRenderer renderer = HtmlRenderer.builder(options).build();

        String content = renderer.render(parser.parse(markdown));

        // Wrap in basic HTML structure for PDF generator
        return "<html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }</style></head><body>"
                + content + "</body></html>";
    }
}
