// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const pdfRoutes = require("./routes/pdfRoutes"); // Import PDF routes
const { spawn } = require("child_process");

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

// Call local ollama LLM to analyze resume vs JD and output JSON

function analyzeWithLlama(resume, jd) {
  // Prompt must return only the JSON object, no extra text
  const instruction = `You are an assistant that compares a resume against a job description. Return output strictly as a JSON object with keys "matched", "missing", and "suggestions". Do NOT include any explanatory text outside the JSON object.\n- matched: array of JD keywords present in the resume.\n- missing: array of JD keywords not in the resume.\n- suggestions: array of improvement suggestions based on missing keywords.`;

  const prompt = `${instruction}\n\nJob description:\n${jd}\n\nResume:\n${resume}`;

  return new Promise((resolve, reject) => {
    const ollama = spawn("ollama", ["run", "llama3.2"]);
    let output = "";
    let error = "";

    ollama.stdout.on("data", (data) => {
      output += data.toString();
    });

    ollama.stderr.on("data", (data) => {
      error += data.toString();
    });

    ollama.on("close", (code) => {
      if (code !== 0) return reject(new Error(error));
      // Extract JSON object from any surrounding text
      const match = output.match(/(\{[\s\S]*\})/);
      if (match) {
        return resolve(match[1].trim());
      }
      return reject(new Error("No JSON object found in LLM output: " + output));
    });

    // Write the prompt
    ollama.stdin.write(prompt);
    ollama.stdin.end();
  });
}

// The legacy extractKeywords can be used as fallback if needed
function extractKeywords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/);
  return Array.from(new Set(words.filter((w) => w.length > 2)));
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

// Analyze endpoint using LLM
app.post("/analyze", async (req, res) => {
  const { resume, jd } = req.body;
  if (!resume || !jd)
    return res.status(400).json({ error: "Both resume and jd are required." });
  try {
    const output = await analyzeWithLlama(resume, jd);
    const parsed = JSON.parse(output);
    // Ensure keys exist
    const matched = parsed.matched || [];
    const missing = parsed.missing || [];
    const suggestions = parsed.suggestions || suggestionsFromMissing(missing);
    res.json({ matched, missing, suggestions });
  } catch (err) {
    console.error("LLM analyze error, falling back:", err);
    // Fallback to simple extraction
    const jdKeywords = extractKeywords(jd);
    const resumeKeywords = extractKeywords(resume);
    const matched = jdKeywords.filter((kw) => resumeKeywords.includes(kw));
    const missing = jdKeywords.filter((kw) => !resumeKeywords.includes(kw));
    const suggestions = suggestionsFromMissing(missing);
    res.json({ matched, missing, suggestions });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
