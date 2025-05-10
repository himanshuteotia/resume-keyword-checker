const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const pdfRoutes = require("./routes/pdfRoutes"); // Import PDF routes

const app = express();
const PORT = process.env.PORT || 5001; // Ensure this port is different from your frontend dev server

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// MongoDB Connection (Replace 'your_mongodb_connection_string' with your actual URI)
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/resumeTemplatesDB";

mongoose
  .connect(MONGO_URI)
  .then(() =>
    console.log("MongoDB connected successfully to resumeTemplatesDB.")
  )
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Mongoose Schema for ResumeTemplate
const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    description: { type: String, required: false, default: "" }, // Changed required to false and added default empty string
  },
  { _id: false }
);

const personalDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    linkedin: String,
    portfolio: String,
  },
  { _id: false }
);

const resumeTemplateSchema = new mongoose.Schema({
  templateName: { type: String, required: true, unique: true }, // Ensure template names are unique
  personalDetails: { type: personalDetailsSchema, required: true },
  summary: { type: String, default: "" }, // Added summary field
  commonSkills: { type: [String], default: [] },
  commonAchievements: { type: [String], default: [] },
  workHistory: { type: [experienceSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const ResumeTemplate = mongoose.model("ResumeTemplate", resumeTemplateSchema);

// API Endpoints
// POST: Create a new resume template
app.post("/api/templates", async (req, res) => {
  try {
    const newTemplate = new ResumeTemplate(req.body);
    const savedTemplate = await newTemplate.save();
    res.status(201).json(savedTemplate);
  } catch (error) {
    console.error("Error saving template:", error);
    if (error.code === 11000) {
      // Handle duplicate templateName
      return res
        .status(400)
        .json({ message: "A template with this name already exists." });
    }
    res
      .status(500)
      .json({ message: "Error saving template", error: error.message });
  }
});

// GET: Retrieve all resume templates
app.get("/api/templates", async (req, res) => {
  try {
    const templates = await ResumeTemplate.find().sort({ createdAt: -1 }); // Sort by newest
    res.status(200).json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res
      .status(500)
      .json({ message: "Error fetching templates", error: error.message });
  }
});

// GET: Retrieve a single resume template by ID
app.get("/api/templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const template = await ResumeTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res
      .status(500)
      .json({ message: "Error fetching template", error: error.message });
  }
});

// PUT: Update an existing resume template
app.put("/api/templates/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to update template with ID: ${id}`);
  console.log("Request body for update:", req.body);

  try {
    // First, try to find the document to see if it exists
    const templateExists = await ResumeTemplate.findById(id);
    if (!templateExists) {
      console.log(`Template with ID: ${id} not found prior to update attempt.`);
      return res.status(404).json({ message: "Template not found" });
    }
    console.log(`Template with ID: ${id} found. Proceeding with update.`);

    // Ensure templateName uniqueness if it's being changed and is part of req.body
    if (
      req.body.templateName &&
      req.body.templateName !== templateExists.templateName
    ) {
      const existingByName = await ResumeTemplate.findOne({
        templateName: req.body.templateName,
        _id: { $ne: id },
      });
      if (existingByName) {
        console.log(
          `Update failed: Another template with name '${req.body.templateName}' already exists.`
        );
        return res
          .status(400)
          .json({ message: "Another template with this name already exists." });
      }
    }

    const updatedTemplate = await ResumeTemplate.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    // findByIdAndUpdate will return null if not found, but we checked above.
    // However, it's good practice to keep this check in case of race conditions or other issues.
    if (!updatedTemplate) {
      console.log(
        `Update operation failed for ID: ${id} - findByIdAndUpdate returned null.`
      );
      // This case should ideally be caught by the pre-check, but as a fallback:
      return res
        .status(404)
        .json({ message: "Template not found during update operation" });
    }

    console.log(`Template with ID: ${id} updated successfully.`);
    res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error(`Error updating template with ID: ${id}:`, error);
    // Check for CastError, which can happen with malformed ObjectIds
    if (error.name === "CastError" && error.path === "_id") {
      return res.status(400).json({ message: "Invalid template ID format." });
    }
    res
      .status(500)
      .json({ message: "Error updating template", error: error.message });
  }
});

// DELETE: Delete a resume template
app.delete("/api/templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTemplate = await ResumeTemplate.findByIdAndDelete(id);
    if (!deletedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res
      .status(500)
      .json({ message: "Error deleting template", error: error.message });
  }
});

// Mount the PDF generation routes
app.use("/api", pdfRoutes);

// Simple keyword extraction (same as frontend logic)
function extractKeywords(text) {
  const stopwords = [
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "are",
    "was",
    "but",
    "have",
    "has",
    "had",
    "not",
    "you",
    "your",
    "will",
    "can",
    "all",
    "any",
    "our",
    "out",
    "who",
    "how",
    "why",
    "when",
    "where",
    "which",
    "their",
    "they",
    "his",
    "her",
    "she",
    "him",
    "its",
    "been",
    "were",
    "also",
    "more",
    "may",
    "such",
    "than",
    "then",
    "them",
    "these",
    "those",
    "use",
    "using",
    "used",
    "on",
    "in",
    "at",
    "to",
    "of",
    "a",
    "an",
    "is",
    "it",
    "as",
    "by",
    "be",
    "or",
    "if",
    "we",
    "i",
    "my",
    "me",
    "so",
    "do",
    "does",
    "did",
    "job",
    "role",
    "work",
    "skills",
    "skill",
    "responsibilities",
    "requirements",
    "qualification",
    "qualifications",
    "should",
    "must",
    "good",
    "strong",
    "excellent",
    "etc",
    "etc.",
  ];
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopwords.includes(word))
    )
  );
}

function suggestionsFromMissing(missing) {
  if (missing.length === 0)
    return ["Great job! All important keywords are covered."];
  return [
    "Try to include these keywords in your resume (if relevant):",
    ...missing.map((kw) => `• ${kw}`),
    "Tip: Add projects, skills, or achievements using these keywords.",
  ];
}

app.post("/analyze", (req, res) => {
  const { resume, jd } = req.body;
  if (!resume || !jd) {
    return res.status(400).json({ error: "Both resume and jd are required." });
  }
  const jdKeywords = extractKeywords(jd);
  const resumeKeywords = extractKeywords(resume);
  const matched = jdKeywords.filter((kw) => resumeKeywords.includes(kw));
  const missing = jdKeywords.filter((kw) => !resumeKeywords.includes(kw));
  const suggestions = suggestionsFromMissing(missing);
  res.json({ matched, missing, suggestions });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
