// backend/routes/pdfRoutes.js
const express = require("express");
const { generateResumePdf } = require("../pdf-generator");
const nodemailer = require("nodemailer");

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

router.post("/email-resume", async (req, res) => {
  const { recipientEmail, subject, emailBody, templateId, resumeData } =
    req.body;

  if (!recipientEmail || !subject || !emailBody || !resumeData) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Validate template ID - only accept 'classic' or 'modern'
    const validTemplateId = ["classic", "modern"].includes(templateId)
      ? templateId
      : "classic"; // Default to classic if invalid

    console.log(`Email resume: Using template ID: ${validTemplateId}`);

    // Generate PDF for the resume
    const pdfBuffer = await generateResumePdf(resumeData, validTemplateId);

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: subject,
      text: emailBody,
      attachments: [
        {
          filename: `${
            resumeData.personalDetails?.name || "resume"
          }_${validTemplateId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;
