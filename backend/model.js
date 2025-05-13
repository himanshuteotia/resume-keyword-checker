import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    description: { type: String, required: false, default: "" },
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

export const ResumeTemplate = mongoose.model(
  "ResumeTemplate",
  resumeTemplateSchema
);
