import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import SkillsInput from "./components/SkillsInput.tsx";
import AchievementsInput from "./components/AchievementsInput.tsx";
import WorkExperienceInput from "./components/WorkExperienceInput.tsx";
import TemplatesPage from "./pages/TemplatesPage.tsx";
import AtsFriendlyTemplatesPage from "./pages/AtsFriendlyTemplatesPage.tsx"; // Import the new page
import EmailResumeModal from "./components/EmailResumeModal.tsx";

type Experience = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

// Define ResumeTemplate at top
interface ResumeTemplate {
  _id?: string;
  templateName: string;
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    portfolio?: string;
  };
  commonSkills: string[];
  commonAchievements: string[];
  workHistory: Experience[];
  summary: string;
}

const MainPage = () => {
  const [currentTemplate, setCurrentTemplate] = useState(
    null as ResumeTemplate | null
  );
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [skills, setSkills] = useState([] as string[]);
  const [achievements, setAchievements] = useState([] as string[]);
  const [experiences, setExperiences] = useState([] as Experience[]);
  const [jd, setJd] = useState("");
  const [matched, setMatched] = useState([] as string[]);
  const [missing, setMissing] = useState([] as string[]);
  const [suggestions, setSuggestions] = useState([] as string[]);
  const [analyzed, setAnalyzed] = useState(false as boolean);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);

  const [savedTemplates, setSavedTemplates] = useState([] as any[]); // Using any for now, define a proper type later
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateNameHome, setTemplateNameHome] = useState("");

  const API_URL_TEMPLATES = "http://localhost:5001/api/templates";

  // Fetch saved templates for dropdown (extracted for reuse)
  const fetchTemplates = async () => {
    try {
      const response = await fetch(API_URL_TEMPLATES);
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      setSavedTemplates(data);
    } catch (err: any) {
      console.error("Error fetching templates:", err.message);
    }
  };

  useEffect(() => {
    // Initial load of templates
    fetchTemplates();
  }, []);

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setTemplateNameHome("");
    }
    if (!templateId) {
      // Clear form if "Select a template..." is chosen
      setSkills([]);
      setAchievements([]);
      setExperiences([]);
      setCurrentTemplate(null);
      return;
    }
    try {
      const response = await fetch(`${API_URL_TEMPLATES}/${templateId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch selected template details");
      }
      const template: ResumeTemplate = await response.json();

      // Populate form fields from the selected template
      // Note: The MainPage currently doesn't have separate input fields for personal details.
      // These are part of the template creation process on TemplatesPage.
      // If you want to display/edit them on MainPage, you'd need to add those fields and state here.
      setSkills(template.commonSkills || []);
      setAchievements(template.commonAchievements || []);
      setExperiences(template.workHistory || []);
      setCurrentTemplate(template);
      setTemplateNameHome(template.templateName);

      // If you decide to add personal details to the MainPage form:
      // setName(template.personalDetails.name); // Example, assuming you add a `name` state to MainPage
      // setEmail(template.personalDetails.email); // Example

      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error("Error loading template details:", err.message);
      setError("Failed to load template details. Please check console.");
    }
  };

  // Save updates to the currently loaded template
  const handleSaveTemplate = async () => {
    if (!templateNameHome.trim()) {
      alert("Please enter a template name.");
      return;
    }
    // Check for duplicate name (other than current loaded template)
    const duplicate = savedTemplates.find(
      (t) => t.templateName === templateNameHome && t._id !== selectedTemplateId
    );
    if (duplicate) {
      setError("Template name already exists! Please choose a different name.");
      return;
    }
    setLoading(true);
    setError(null);
    console.log(currentTemplate);
    try {
      // Prepare personalDetails from currentTemplate or fallback
      const personalDetails = currentTemplate?.personalDetails || {
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        portfolio: "",
        summary: "",
      };
      // Determine if updating or creating new: update only if name matches existing or matches loaded template name
      const existing = savedTemplates.find(
        (t) => t.templateName === templateNameHome
      );
      let templateId: string | null = null;
      if (existing) {
        templateId = existing._id;
      } else if (
        selectedTemplateId &&
        currentTemplate?.templateName === templateNameHome
      ) {
        templateId = selectedTemplateId;
      }
      if (templateId) {
        // Update existing template
        const response = await fetch(`${API_URL_TEMPLATES}/${templateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateName: templateNameHome,
            personalDetails,
            commonSkills: skills,
            commonAchievements: achievements,
            workHistory: experiences,
            summary: currentTemplate?.summary || "",
          }),
        });
        if (!response.ok) throw new Error("Failed to update template");
        alert("Template updated successfully!");
        setSelectedTemplateId(templateId);
      } else {
        // Create new template
        const response = await fetch(API_URL_TEMPLATES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateName: templateNameHome,
            personalDetails,
            commonSkills: skills,
            commonAchievements: achievements,
            workHistory: experiences,
            summary: currentTemplate?.summary || "",
          }),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to create template");
        }
        const newTemplate = await response.json();
        alert("Template created successfully!");
        setSelectedTemplateId(newTemplate._id);
      }
      await fetchTemplates();
    } catch (err: any) {
      console.error("handleSaveTemplate error:", err);
      alert(err.message || "Error saving template");
    } finally {
      setLoading(false);
    }
  };

  // Resume text generation from fields
  const buildResumeText = () => {
    let text = "";
    if (skills.length) text += `Skills: ${skills.join(", ")}.\n`;
    if (achievements.length)
      text += `Achievements: ${achievements.join(". ")}.\n`;
    if (experiences.length) {
      text += "Work Experience: ";
      text += experiences
        .map(
          (exp) =>
            `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.description}`
        )
        .join(". ");
      text += ".\n";
    }
    return text;
  };

  const handleAnalyze = async () => {
    console.log("handleAnalyze: called");
    const resume = buildResumeText();
    console.log("handleAnalyze: resume:", resume);
    console.log("handleAnalyze: JD:", jd);
    setLoading(true);
    setError(null);
    setAnalyzed(false);
    try {
      const res = await fetch("http://localhost:5001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jd }),
      });
      console.log(
        "handleAnalyze: fetch returned status",
        res.status,
        "ok?",
        res.ok
      );
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      console.log("handleAnalyze: data received:", data);
      setMatched(data.matched);
      setMissing(data.missing);
      setSuggestions(data.suggestions);
      setAnalyzed(true);
    } catch (err: any) {
      console.error("handleAnalyze: error caught:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Compute resume text once
  const resumeText = buildResumeText();

  // Compute merged resumeData
  const mergedResumeData = currentTemplate
    ? {
        ...currentTemplate,
        commonSkills: skills,
        commonAchievements: achievements,
        workHistory: experiences,
      }
    : null;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <label htmlFor="templateSelect" className="block font-medium mb-1">
          Load from Template
        </label>
        <div className="flex gap-2 mb-4">
          <select
            id="templateSelect"
            value={selectedTemplateId}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Select a resume template to load"
          >
            <option value="">Select a template...</option>
            {savedTemplates.map((template) => (
              <option key={template._id} value={template._id}>
                {template.templateName}
              </option>
            ))}
          </select>
        </div>
        {/* Display error related to template loading if any */}
        {error && selectedTemplateId && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <label htmlFor="templateNameHome" className="block font-medium mb-1">
          Template Name
        </label>
        <input
          id="templateNameHome"
          type="text"
          value={templateNameHome}
          onChange={(e) => setTemplateNameHome(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter or select a template name"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <SkillsInput skills={skills} setSkills={setSkills} />
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <AchievementsInput
          achievements={achievements}
          setAchievements={setAchievements}
        />
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <WorkExperienceInput
          experiences={experiences}
          setExperiences={setExperiences}
        />
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <label className="block font-medium mb-1">Job Description (JD)</label>
        <textarea
          className="w-full h-32 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
          placeholder="Paste the job description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
      </div>
      <div className="flex justify-center mb-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          onClick={handleAnalyze}
          disabled={loading || !jd || resumeText.trim() === ""}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        {mergedResumeData && (
          <>
            <button
              className="ml-4 bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition font-semibold"
              onClick={() => setIsEmailModalOpen(true)}
            >
              Email Resume
            </button>
            {selectedTemplateId && (
              <button
                className="ml-4 bg-yellow-600 text-white px-6 py-2 rounded shadow hover:bg-yellow-700 transition font-semibold"
                onClick={handleSaveTemplate}
                disabled={loading}
              >
                Save Template
              </button>
            )}
          </>
        )}
      </div>
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      {analyzed && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-lg font-semibold mb-2">✅ Matched Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {matched.length > 0 ? (
                matched.map((kw) => (
                  <span
                    key={kw}
                    className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No keywords matched.</span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-lg font-semibold mb-2">❌ Missing Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {missing.length > 0 ? (
                missing.map((kw) => (
                  <span
                    key={kw}
                    className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-green-600">
                  All important keywords are present!
                </span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-lg font-semibold mb-2">💡 Suggestions</h2>
            <ul className="list-disc pl-5 space-y-1">
              {suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </>
      )}
      {/* Email modal for home */}
      {mergedResumeData && (
        <EmailResumeModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          userTemplateId={selectedTemplateId || ""}
          atsStyleId="classic"
          resumeData={mergedResumeData}
        />
      )}
    </>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-2">
      <div className="max-w-2xl w-full">
        <nav className="mb-6 flex justify-center flex-wrap">
          <Link to="/" className="text-blue-600 hover:text-blue-800 px-4 py-2">
            Home
          </Link>
          <Link
            to="/templates"
            className="text-blue-600 hover:text-blue-800 px-4 py-2"
          >
            Manage Templates
          </Link>
          <Link
            to="/ats-templates"
            className="text-blue-600 hover:text-blue-800 px-4 py-2"
          >
            ATS Templates
          </Link>{" "}
          {/* Add new link */}
        </nav>
        <h1 className="text-3xl font-bold text-center mb-6">
          Resume Builder & Keyword Checker
        </h1>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route
            path="/ats-templates"
            element={<AtsFriendlyTemplatesPage />}
          />{" "}
          {/* Add new route */}
        </Routes>
        <footer className="mt-8 text-gray-400 text-xs text-center">
          Made with ❤️ in React + Tailwind CSS
        </footer>
      </div>
    </div>
  );
}

export default App;
