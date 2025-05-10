// backend/routes/pdfRoutes.js
const express = require("express");
const { generateResumePdf } = require("../pdf-generator");

const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
  const { userData, styleId } = req.body;
  console.log("--- New /generate-pdf request ---");
  console.log("Received styleId:", styleId);
  console.log(
    "Received userData (first 200 chars):",
    JSON.stringify(userData).substring(0, 200)
  );

  if (!userData || !styleId) {
    console.error("Validation Error: Missing userData or styleId.");
    return res
      .status(400)
      .json({ message: "Missing userData or styleId in request body" });
  }

  // Basic validation for userData structure (can be expanded)
  if (!userData.personalDetails || !userData.personalDetails.name) {
    console.error(
      "Validation Error: userData is missing essential fields like personalDetails.name."
    );
    return res.status(400).json({
      message: "userData is missing essential fields like personalDetails.name",
    });
  }

  try {
    console.log(
      `Processing PDF generation for Style ID: ${styleId}, User: ${userData.personalDetails.name}`
    );
    console.log("Calling generateResumePdf...");
    const pdfBuffer = await generateResumePdf(userData, styleId);
    console.log(
      `generateResumePdf returned. PDF Buffer size: ${
        pdfBuffer ? pdfBuffer.length : "null or empty"
      }`
    );

    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error("Error: pdfBuffer is null or empty after generation.");
      return res
        .status(500)
        .json({ message: "Failed to generate PDF buffer." });
    }

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    // Suggest a filename for the download
    const filename = `${
      userData.templateName || "resume"
    }_${styleId}.pdf`.replace(/[^a-z0-9_.-]/gi, "_"); // Sanitize filename
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    console.log(
      `Setting headers: Content-Type: application/pdf, Content-Disposition: attachment; filename="${filename}"`
    );

    console.log(
      `Successfully generated and sending PDF: ${filename}, Size: ${pdfBuffer.length}`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in /generate-pdf route catch block:", error);
    // Check if the error is a known one from our generator or a generic one
    if (
      error.message === "Invalid style ID provided for PDF generation." ||
      error.message === "Could not generate HTML content for the PDF."
    ) {
      return res.status(400).json({ message: error.message });
    } else if (error.message === "Failed to generate PDF.") {
      return res
        .status(500)
        .json({ message: "Server error while generating PDF file." });
    }
    // Generic server error for unexpected issues
    res
      .status(500)
      .json({ message: "An unexpected error occurred on the server." });
  }
});

module.exports = router;
