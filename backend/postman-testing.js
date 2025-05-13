import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { ResumeTemplate } from "./model.js";

// MCP tool logic ko yahan manually handle karo
async function handleMcpToolCall(toolName, args) {
  if (toolName === "get_templates") {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://localhost:27017/resumeTemplatesDB");
    }
    const templates = await ResumeTemplate.find({});
    return {
      content: [
        {
          type: "json",
          json: templates.map((t) => ({
            templateName: t.templateName,
          })),
        },
      ],
    };
  }
  // ...baaki tools ka logic yahan daalo (send_resume, etc.)
}

const app = express();
app.use(bodyParser.json());

app.post("/mcp", async (req, res) => {
  try {
    const { type, params } = req.body;
    if (type === "tool_call") {
      const result = await handleMcpToolCall(params.name, params.arguments);
      res.json(result);
    } else {
      res.status(400).json({ error: "Invalid MCP request type" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("MCP HTTP server running on port 3001");
});
