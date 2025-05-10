import React, { useState } from "react";

type Experience = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

type WorkExperienceInputProps = {
  experiences: Experience[];
  setExperiences: (experiences: Experience[]) => void;
};

function WorkExperienceInput({
  experiences,
  setExperiences,
}: WorkExperienceInputProps) {
  const [form, setForm] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  } as Experience);

  const addExperience = () => {
    if (form.title && form.company && form.startDate && form.endDate) {
      setExperiences([...experiences, form]);
      setForm({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      } as Experience);
    }
  };

  const removeExperience = (idx: number) => {
    setExperiences(experiences.filter((_, i) => i !== idx));
  };

  const moveExperienceUp = (idx: number) => {
    if (idx === 0) return; // Can't move first item up
    const newExperiences = [...experiences];
    const temp = newExperiences[idx];
    newExperiences[idx] = newExperiences[idx - 1];
    newExperiences[idx - 1] = temp;
    setExperiences(newExperiences);
  };

  const moveExperienceDown = (idx: number) => {
    if (idx === experiences.length - 1) return; // Can't move last item down
    const newExperiences = [...experiences];
    const temp = newExperiences[idx];
    newExperiences[idx] = newExperiences[idx + 1];
    newExperiences[idx + 1] = temp;
    setExperiences(newExperiences);
  };

  return (
    <div>
      <label className="block font-medium mb-1">Work Experience</label>
      <ul className="mb-2">
        {experiences.map((exp, idx) => (
          <li
            key={idx}
            className="mb-2 p-2 border rounded bg-gray-50 flex flex-col gap-1 relative"
          >
            <div className="absolute top-1 right-2 flex space-x-1">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => moveExperienceUp(idx)}
                disabled={idx === 0}
                title="Move Up"
              >
                ↑
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => moveExperienceDown(idx)}
                disabled={idx === experiences.length - 1}
                title="Move Down"
              >
                ↓
              </button>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 focus:outline-none"
                onClick={() => removeExperience(idx)}
                title="Remove"
              >
                &times;
              </button>
            </div>
            <div className="font-semibold mt-4">
              {exp.title} @ {exp.company}
            </div>
            <div className="text-xs text-gray-500">
              {exp.startDate} - {exp.endDate}
            </div>
            <div className="text-sm">{exp.description}</div>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        <input
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Job Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Start Date (e.g. Jan 2020)"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="End Date (e.g. Dec 2022 or Present)"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />
      </div>
      <textarea
        className="border border-gray-300 rounded p-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <button
        type="button"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={addExperience}
      >
        Add
      </button>
    </div>
  );
}

export default WorkExperienceInput;
