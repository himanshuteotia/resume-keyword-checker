import React, { useState } from "react";

type SkillsInputProps = {
  skills: string[];
  setSkills: (skills: string[]) => void;
};

function SkillsInput({ skills, setSkills }: SkillsInputProps) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <div>
      <label className="block font-medium mb-1">Skills</label>
      <div className="flex gap-2 flex-wrap mb-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 text-sm"
          >
            {skill}
            <button
              type="button"
              className="ml-1 text-blue-500 hover:text-red-500"
              onClick={() => removeSkill(skill)}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border border-gray-300 rounded p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Add a skill"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
        />
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={addSkill}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default SkillsInput;
