import React, { useState, useEffect } from "react";
import SkillsInput from "../components/SkillsInput.tsx";
import AchievementsInput from "../components/AchievementsInput.tsx";
import WorkExperienceInput from "../components/WorkExperienceInput.tsx";
import EmailResumeModal from "../components/EmailResumeModal.tsx";

// Define the structure for a resume template (matches backend schema)
interface ResumeTemplate {
  _id?: string; // Added by MongoDB
  templateName: string;
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string; // Summary as a separate field, not inside personalDetails
  commonSkills: string[];
  commonAchievements: string[];
  workHistory: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  createdAt?: string; // Added by MongoDB
}

const TemplatesPage = () => {
  const [templateName, setTemplateName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [summary, setSummary] = useState(""); // Added summary state

  const [commonSkills, setCommonSkills] = useState([]);
  const [commonAchievements, setCommonAchievements] = useState([]);
  const [workHistory, setWorkHistory] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const [savedTemplates, setSavedTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [editingTemplate, setEditingTemplate] = useState(null);

  // New state for email modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedTemplateForEmail, setSelectedTemplateForEmail] =
    useState(null);

  const API_URL = "http://localhost:5001/api/templates"; // Backend API URL

  // Fetch saved templates
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    setFetchError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch templates");
      }
      const data: ResumeTemplate[] = await response.json();
      setSavedTemplates(data);
    } catch (error: any) {
      setFetchError(error.message || "Error fetching templates.");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const clearForm = () => {
    setTemplateName("");
    setName("");
    setEmail("");
    setPhone("");
    setLinkedin("");
    setPortfolio("");
    setSummary(""); // Clear summary state
    setCommonSkills([]);
    setCommonAchievements([]);
    setWorkHistory([]);
    setEditingTemplate(null); // Clear editing state
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    const templateData: Omit<ResumeTemplate, "_id" | "createdAt"> = {
      templateName,
      personalDetails: { name, email, phone, linkedin, portfolio },
      summary, // Include summary in template data
      commonSkills,
      commonAchievements,
      workHistory,
    };

    try {
      let response;
      let responseData;

      if (editingTemplate && editingTemplate._id) {
        // Update existing template
        response = await fetch(`${API_URL}/${editingTemplate._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(templateData),
        });
        responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || "Failed to update template.");
        }
        setSaveMessage("Template updated successfully!");
      } else {
        // Create new template
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(templateData),
        });
        responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || "Failed to save template.");
        }
        setSaveMessage("Template saved successfully!");
      }

      clearForm();
      fetchTemplates(); // Refresh the list of templates
    } catch (error: any) {
      setSaveMessage(error.message || "Error saving template.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleEditTemplate = (template: ResumeTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.templateName);
    setName(template.personalDetails.name);
    setEmail(template.personalDetails.email);
    setPhone(template.personalDetails.phone);
    setLinkedin(template.personalDetails.linkedin || "");
    setPortfolio(template.personalDetails.portfolio || "");
    setSummary(template.summary || ""); // Set summary state
    setCommonSkills(template.commonSkills || []);
    setCommonAchievements(template.commonAchievements || []);
    setWorkHistory(template.workHistory || []);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top to see the form
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;
    setSaveMessage(null);
    try {
      const response = await fetch(`${API_URL}/${templateId}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to delete template.");
      }
      setSaveMessage("Template deleted successfully!");
      fetchTemplates(); // Refresh list
    } catch (error: any) {
      setSaveMessage(error.message || "Error deleting template.");
    } finally {
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleEmailTemplate = (template) => {
    setSelectedTemplateForEmail(template);
    setIsEmailModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {editingTemplate
          ? "Edit Resume Template"
          : "Create New Resume Template"}
      </h2>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="templateName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Template Name
          </label>
          <input
            type="text"
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Senior Developer Template"
          />
        </div>

        <fieldset className="border p-4 rounded-md">
          <legend className="text-lg font-medium text-gray-900 px-2">
            Personal Details
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div>
              <label
                htmlFor="linkedin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                LinkedIn Profile URL (Optional)
              </label>
              <input
                type="url"
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="portfolio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Portfolio/Website URL (Optional)
              </label>
              <input
                type="url"
                id="portfolio"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="summary"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Summary
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            rows={4}
            placeholder="Brief summary about the candidate"
          />
        </div>

        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Common Skills
          </h3>
          <SkillsInput skills={commonSkills} setSkills={setCommonSkills} />
        </div>

        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Common Achievements
          </h3>
          <AchievementsInput
            achievements={commonAchievements}
            setAchievements={setCommonAchievements}
          />
        </div>

        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Work History (General Roles & Responsibilities)
          </h3>
          <WorkExperienceInput
            experiences={workHistory}
            setExperiences={setWorkHistory}
          />
        </div>

        <div className="flex justify-end mt-8">
          {editingTemplate && (
            <button
              type="button"
              onClick={clearForm} // Doubles as cancel edit
              className="mr-4 bg-gray-500 text-white px-6 py-2 rounded shadow hover:bg-gray-600 transition font-semibold"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving || !templateName || !name || !email || !phone}
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving
              ? "Saving..."
              : editingTemplate
              ? "Update Template"
              : "Save Template"}
          </button>
        </div>
        {saveMessage && (
          <div
            className={`mt-4 text-center p-2 rounded ${
              saveMessage.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {saveMessage}
          </div>
        )}
      </div>

      <hr className="my-10" />

      <h2 className="text-2xl font-bold mb-6 text-center">Saved Templates</h2>
      {isLoadingTemplates && (
        <p className="text-center">Loading templates...</p>
      )}
      {fetchError && (
        <p className="text-center text-red-600">Error: {fetchError}</p>
      )}
      {!isLoadingTemplates && !fetchError && savedTemplates.length === 0 && (
        <p className="text-center text-gray-500">No templates saved yet.</p>
      )}
      {!isLoadingTemplates && !fetchError && savedTemplates.length > 0 && (
        <ul className="space-y-4">
          {savedTemplates.map((template) => (
            <li
              key={template._id}
              className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold text-blue-700">
                  {template.templateName}
                </h3>
                <p className="text-sm text-gray-600">
                  Created:{" "}
                  {template.createdAt
                    ? new Date(template.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Summary: {template.summary}
                </p>
              </div>
              <div className="space-x-2 flex items-center">
                <button
                  onClick={() => handleEmailTemplate(template)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email
                </button>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() =>
                    template._id && handleDeleteTemplate(template._id)
                  }
                  disabled={!template._id}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md transition-colors duration-200 text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Email Resume Modal */}
      {selectedTemplateForEmail && (
        <EmailResumeModal
          isOpen={isEmailModalOpen}
          onClose={() => {
            setIsEmailModalOpen(false);
            setSelectedTemplateForEmail(null);
          }}
          userTemplateId={selectedTemplateForEmail._id || ""}
          atsStyleId="classic"
          resumeData={selectedTemplateForEmail}
        />
      )}
    </div>
  );
};

export default TemplatesPage;
