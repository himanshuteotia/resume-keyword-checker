import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(achievements);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setAchievements(reordered);
  };

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="achievements-droppable" direction="vertical">
          {(provided) => (
            <ul
              className="mb-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {achievements.map((ach, idx) => (
                <Draggable draggableId={ach + idx} index={idx}>
                  {(provided, snapshot) => (
                    <li
                      key={ach + idx}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center gap-2 mb-1 p-2 border rounded bg-gray-50 ${
                        snapshot.isDragging ? "ring-2 ring-blue-400" : ""
                      }`}
                    >
                      <span className="flex-1">{ach}</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        onClick={() => removeAchievement(idx)}
                        title="Remove"
                      >
                        &times;
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
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
