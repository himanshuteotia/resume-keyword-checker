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

  const moveAchievementUp = (idx: number) => {
    if (idx === 0) return; // Can't move first item up
    const newAchievements = [...achievements];
    const temp = newAchievements[idx];
    newAchievements[idx] = newAchievements[idx - 1];
    newAchievements[idx - 1] = temp;
    setAchievements(newAchievements);
  };

  const moveAchievementDown = (idx: number) => {
    if (idx === achievements.length - 1) return; // Can't move last item down
    const newAchievements = [...achievements];
    const temp = newAchievements[idx];
    newAchievements[idx] = newAchievements[idx + 1];
    newAchievements[idx + 1] = temp;
    setAchievements(newAchievements);
  };

  return (
    <div>
      <label className="block font-medium mb-1">Key Achievements</label>
      <ul className="mb-2">
        {achievements.map((ach, idx) => (
          <li
            key={idx}
            className="flex items-center gap-2 mb-1 p-2 border rounded bg-gray-50"
          >
            <span className="flex-1">{ach}</span>
            <div className="flex space-x-1">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => moveAchievementUp(idx)}
                disabled={idx === 0}
                title="Move Up"
              >
                ↑
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => moveAchievementDown(idx)}
                disabled={idx === achievements.length - 1}
                title="Move Down"
              >
                ↓
              </button>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 focus:outline-none"
                onClick={() => removeAchievement(idx)}
                title="Remove"
              >
                &times;
              </button>
            </div>
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
