import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(skills);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSkills(reordered);
  };

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="skills-droppable" direction="horizontal">
          {(provided) => (
            <div
              className="flex gap-2 flex-wrap mb-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {skills.map((skill, idx) => (
                <Draggable draggableId={skill} index={idx}>
                  {(provided, snapshot) => (
                    <span
                      key={skill}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 text-sm ${
                        snapshot.isDragging ? "ring-2 ring-blue-400" : ""
                      }`}
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
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
