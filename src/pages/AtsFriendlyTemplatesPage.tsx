import React, { useState, useEffect, useRef } from "react";
// Removed html2canvas and jspdf imports

// Define the structure for user's saved resume data templates (similar to TemplatesPage)
interface UserResumeTemplate {
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
  workHistory: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  createdAt?: string;
}

// Define structure for pre-defined ATS templates
interface AtsStyleTemplate {
  id: string;
  name: string;
  description: string;
  // In a real scenario, this might contain layout components or functions
  render: (data: UserResumeTemplate) => React.ReactNode;
}

// --- Sample ATS Template Styles ---
const atsTemplates: AtsStyleTemplate[] = [
  {
    id: "classic",
    name: "Classic ATS",
    description: "A clean, single-column layout, optimized for ATS parsing.",
    render: (data) => (
      <div className="p-4 border rounded-md font-sans text-sm bg-white">
        <h1 className="text-2xl font-bold text-center mb-2">
          {data.personalDetails.name}
        </h1>
        <p className="text-center text-xs mb-1">
          {data.personalDetails.email} | {data.personalDetails.phone}
          {data.personalDetails.linkedin &&
            ` | ${data.personalDetails.linkedin}`}
          {data.personalDetails.portfolio &&
            ` | ${data.personalDetails.portfolio}`}
        </p>
        <hr className="my-2" />

        {data.commonSkills.length > 0 && (
          <section className="mb-2">
            <h2 className="text-sm font-bold uppercase border-b mb-1">
              Skills
            </h2>
            <p className="text-xs">{data.commonSkills.join(", ")}</p>
          </section>
        )}

        {data.workHistory.length > 0 && (
          <section className="mb-2">
            <h2 className="text-sm font-bold uppercase border-b mb-1">
              Work Experience
            </h2>
            {data.workHistory.map((job, index) => (
              <div key={index} className="mb-1.5">
                <h3 className="text-xs font-semibold">
                  {job.title}{" "}
                  <span className="font-normal">at {job.company}</span>
                </h3>
                <p className="text-xs text-gray-600 italic">
                  {job.startDate} - {job.endDate}
                </p>
                <p className="text-xs whitespace-pre-line">{job.description}</p>
              </div>
            ))}
          </section>
        )}

        {data.commonAchievements.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b mb-1">
              Achievements
            </h2>
            <ul className="list-disc list-inside text-xs">
              {data.commonAchievements.map((ach, index) => (
                <li key={index}>{ach}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    ),
  },
  {
    id: "modern",
    name: "Modern Compact",
    description: "A space-efficient design, good for concise resumes.",
    render: (data) => (
      <div className="p-4 border rounded-md font-serif text-sm bg-white">
        <div className="text-center mb-3">
          <h1 className="text-xl font-bold">{data.personalDetails.name}</h1>
          <p className="text-xs">
            {data.personalDetails.phone} | {data.personalDetails.email}
            {data.personalDetails.linkedin && (
              <a
                href={data.personalDetails.linkedin}
                className="text-blue-600 hover:underline ml-2"
              >
                LinkedIn
              </a>
            )}
            {data.personalDetails.portfolio && (
              <a
                href={data.personalDetails.portfolio}
                className="text-blue-600 hover:underline ml-2"
              >
                Portfolio
              </a>
            )}
          </p>
        </div>

        {data.commonSkills.length > 0 && (
          <div className="mb-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-gray-700">
              Skills Summary
            </h2>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {data.commonSkills.map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-sm text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.workHistory.length > 0 && (
          <div className="mb-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-gray-700">
              Experience
            </h2>
            {data.workHistory.map((job, index) => (
              <div key={index} className="mt-1">
                <h3 className="text-xs font-semibold">
                  {job.title},{" "}
                  <span className="font-normal italic">{job.company}</span>{" "}
                  <span className="text-gray-500 float-right text-xs">
                    {job.startDate} - {job.endDate}
                  </span>
                </h3>
                <p className="text-xs mt-0.5 whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {data.commonAchievements.length > 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase text-gray-700">
              Key Achievements
            </h2>
            <ul className="list-disc pl-3 text-xs mt-0.5">
              {data.commonAchievements.map((ach, index) => (
                <li key={index} className="mb-0.5">
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ),
  },
  // Add more ATS template styles here
];

const AtsFriendlyTemplatesPage = () => {
  const [userTemplates, setUserTemplates] = useState<UserResumeTemplate[]>([]);
  const [selectedUserTemplateId, setSelectedUserTemplateId] =
    useState<string>("");
  const [selectedAtsStyleId, setSelectedAtsStyleId] = useState<string>("");

  const [isLoadingUserTemplates, setIsLoadingUserTemplates] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<React.ReactNode | null>(
    null
  );
  const [isDownloading, setIsDownloading] = useState(false);
  // const previewRef = useRef<HTMLDivElement>(null); // No longer needed for client-side canvas

  const API_URL_USER_TEMPLATES = "http://localhost:5001/api/templates";
  const API_URL_GENERATE_PDF = "http://localhost:5001/api/generate-pdf";

  useEffect(() => {
    const fetchUserTemplates = async () => {
      setIsLoadingUserTemplates(true);
      setFetchError(null);
      try {
        const response = await fetch(API_URL_USER_TEMPLATES);
        if (!response.ok)
          throw new Error("Failed to fetch your saved templates");
        const data: UserResumeTemplate[] = await response.json();
        setUserTemplates(data);
      } catch (error: any) {
        setFetchError(error.message);
      }
      setIsLoadingUserTemplates(false);
    };
    fetchUserTemplates();
  }, []);

  const handleGeneratePreview = () => {
    if (!selectedUserTemplateId || !selectedAtsStyleId) {
      alert("Please select both an ATS style and one of your data templates.");
      return;
    }
    const userTemplateData = userTemplates.find(
      (t) => t._id === selectedUserTemplateId
    );
    const atsStyle = atsTemplates.find((s) => s.id === selectedAtsStyleId);

    if (userTemplateData && atsStyle) {
      // Render function is still used for client-side preview
      setPreviewContent(atsStyle.render(userTemplateData));
    } else {
      alert("Selected data or style not found for preview.");
      setPreviewContent(null);
    }
  };

  const handleDownload = async () => {
    if (!selectedUserTemplateId || !selectedAtsStyleId) {
      alert(
        "Please select your resume data and an ATS style before downloading."
      );
      return;
    }

    const userTemplateData = userTemplates.find(
      (t) => t._id === selectedUserTemplateId
    );
    if (!userTemplateData) {
      alert("Selected user data not found.");
      return;
    }

    setIsDownloading(true);
    setFetchError(null);

    try {
      const response = await fetch(API_URL_GENERATE_PDF, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData: userTemplateData,
          styleId: selectedAtsStyleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "PDF generation failed on server." }));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        `${userTemplateData.templateName}_${selectedAtsStyleId}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      setFetchError(
        error.message || "Could not download PDF. Please try again."
      );
      alert(`Error: ${error.message || "Could not download PDF."}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        ATS-Friendly Resume Generator
      </h2>

      {/* ... existing selectors ... */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label
            htmlFor="atsStyleSelect"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            1. Select ATS-Friendly Style
          </label>
          <select
            id="atsStyleSelect"
            value={selectedAtsStyleId}
            onChange={(e) => {
              setSelectedAtsStyleId(e.target.value);
              setPreviewContent(null);
            }}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose an ATS Style --</option>
            {atsTemplates.map((style) => (
              // We still use atsTemplates for the names and descriptions in the dropdown
              <option key={style.id} value={style.id}>
                {style.name} - {style.description}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="userTemplateSelect"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            2. Select Your Resume Data
          </label>
          {isLoadingUserTemplates && (
            <p className="text-xs text-gray-500">Loading your templates...</p>
          )}
          {fetchError && !isDownloading && (
            <p className="text-xs text-red-500">Error: {fetchError}</p>
          )}
          <select
            id="userTemplateSelect"
            value={selectedUserTemplateId}
            onChange={(e) => {
              setSelectedUserTemplateId(e.target.value);
              setPreviewContent(null);
            }}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoadingUserTemplates || userTemplates.length === 0}
          >
            <option value="">-- Choose your saved data --</option>
            {userTemplates.map((template) => (
              <option key={template._id} value={template._id}>
                {template.templateName}
              </option>
            ))}
          </select>
          {userTemplates.length === 0 &&
            !isLoadingUserTemplates &&
            !fetchError && (
              <p className="text-xs text-gray-500 mt-1">
                No saved data templates found. Please create one on the 'Manage
                Templates' page.
              </p>
            )}
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={handleGeneratePreview}
          disabled={
            !selectedUserTemplateId || !selectedAtsStyleId || isDownloading
          }
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition font-semibold disabled:opacity-50"
        >
          Preview Resume
        </button>
        <button
          onClick={handleDownload}
          disabled={
            !selectedUserTemplateId || !selectedAtsStyleId || isDownloading
          }
          className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition font-semibold disabled:opacity-50"
        >
          {isDownloading ? "Downloading..." : "Download Resume"}
        </button>
      </div>
      {fetchError && isDownloading && (
        <p className="text-center text-red-500 text-sm mb-4">
          Download Error: {fetchError}
        </p>
      )}

      {previewContent && (
        <div>
          <h3 className="text-xl font-semibold mb-2 text-center">
            Resume Preview
          </h3>
          {/* The ref is removed as client-side canvas capture is no longer used for PDF */}
          <div
            id="resumePreviewArea"
            className="border p-2 bg-gray-50 max-w-2xl mx-auto shadow-inner"
          >
            {previewContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default AtsFriendlyTemplatesPage;
