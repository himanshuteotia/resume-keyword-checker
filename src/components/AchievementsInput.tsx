import React, { useState } from "react";

type AchievementsInputProps = {
  achievements: string[];
  setAchievements: (achievements: string[]) => void;
};

function AchievementsInput({
  achievements,
  setAchievements,
}: AchievementsInputProps) {
  const [input, setInput] = useState("");

  const addAchievement = () => {
    const trimmed = input.trim();
    if (trimmed) {
      setAchievements([...achievements, trimmed]);
      setInput("");
    }
  };

  const removeAchievement = (idx: number) => {
    setAchievements(achievements.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block font-medium mb-1">Key Achievements</label>
      <ul className="mb-2">
        {achievements.map((ach, idx) => (
          <li key={idx} className="flex items-center gap-2 mb-1">
            <span className="flex-1">{ach}</span>
            <button
              type="button"
              className="text-red-500 hover:text-red-700"
              onClick={() => removeAchievement(idx)}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="border border-gray-300 rounded p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Add an achievement"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addAchievement();
            }
          }}
        />
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={addAchievement}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default AchievementsInput;
