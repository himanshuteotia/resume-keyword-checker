import puppeteer from "puppeteer";
import {
  getClassicTemplateHTML,
  getModernTemplateHTML,
} from "./resume-templates.js";

async function generatePdfFromHtml(htmlContent) {
  let browser = null;
  console.log("generatePdfFromHtml: Starting PDF generation from HTML.");
  try {
    // Launch Puppeteer. Adjust launch options as needed for your environment.
    // For production, you might need to specify executablePath and args like ['--no-sandbox', '--disable-setuid-sandbox']
    console.log("generatePdfFromHtml: Launching Puppeteer...");
    browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // common in Docker/CI environments
        "--font-render-hinting=none", // May improve font rendering in some cases
      ],
    });
    console.log("generatePdfFromHtml: Puppeteer launched.");
    const page = await browser.newPage();
    // Ensure the viewport is large enough to capture the full width of our template
    await page.setViewport({ width: 1200, height: 800 });
    console.log("generatePdfFromHtml: New page created.");

    // Set content and wait for all network activity to cease, or a timeout
    console.log("generatePdfFromHtml: Setting page content...");
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    console.log("generatePdfFromHtml: Page content set.");

    // Generate PDF
    // You can customize PDF options (format, margins, etc.) here
    // https://pptr.dev/api/puppeteer.page.pdf
    console.log("generatePdfFromHtml: Generating PDF buffer...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // Important for styles to be applied
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });
    console.log("generatePdfFromHtml: PDF buffer generated.");
    return pdfBuffer; // Ensure pdfBuffer is returned before closing the browser
  } catch (error) {
    console.error("generatePdfFromHtml: Error during PDF generation:", error);
    // Propagate the error so it can be handled by the caller
    throw new Error("Failed to generate PDF.");
  } finally {
    if (browser !== null) {
      console.log("generatePdfFromHtml: Closing browser...");
      await browser.close();
      console.log("generatePdfFromHtml: Browser closed.");
    }
  }
}

async function generateResumePdf(userData, styleId) {
  console.log(`generateResumePdf: Called with styleId: ${styleId}`);
  let htmlContent = "";
  if (styleId === "classic") {
    console.log("generateResumePdf: Getting classic template HTML.");
    htmlContent = getClassicTemplateHTML(userData);
  } else if (styleId === "modern") {
    console.log("generateResumePdf: Getting modern template HTML.");
    htmlContent = getModernTemplateHTML(userData);
  } else {
    console.error(`generateResumePdf: Invalid style ID: ${styleId}`);
    throw new Error("Invalid style ID provided for PDF generation.");
  }

  if (!htmlContent) {
    console.error(
      "generateResumePdf: HTML content is empty after template generation."
    );
    throw new Error("Could not generate HTML content for the PDF.");
  }
  console.log(
    `generateResumePdf: HTML content generated. Length: ${htmlContent.length}. Calling generatePdfFromHtml.`
  );
  return generatePdfFromHtml(htmlContent);
}

export { generateResumePdf };
