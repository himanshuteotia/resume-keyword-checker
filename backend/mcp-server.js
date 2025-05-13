import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

import { ResumeTemplate } from "./model.js";
import { generateResumePdf } from "./pdf-generator.js";

const server = new Server(
  {
    name: "resume-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "send_resume",
      description: "Send a resume to an email based on a message",
      inputSchema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description:
              "User message containing job description, template, and email",
          },
          template: {
            type: "string",
            description: "Template name",
          },
          email: {
            type: "string",
            description: "Email address",
          },
        },
        required: ["message", "template", "email"],
      },
    },
    {
      name: "get_templates",
      description: "Fetch all resume templates from MongoDB",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_templates") {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://localhost:27017/resumeTemplatesDB");
    }
    const templates = await ResumeTemplate.find({});
    return {
      content: [
        {
          type: "text",
          text: templates.map((t) => t.templateName).join("\n"),
        },
      ],
    };
  }
  if (request.params.name === "send_resume") {
    try {
      const args = request.params.arguments;
      const email = args.email;
      const template = args.template;
      const message = args.message;

      if (!email || !template) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Missing email, template.",
            },
          ],
        };
      }

      if (mongoose.connection.readyState === 0) {
        await mongoose.connect("mongodb://localhost:27017/resumeTemplatesDB");
      }

      const resume = await ResumeTemplate.findOne({
        templateName: new RegExp(template, "i"),
      });
      if (!resume) {
        return {
          isError: true,
          content: [{ type: "text", text: "Template not found." }],
        };
      }

      const pdfBuffer = await generateResumePdf(resume, "classic");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Resume for ${template}`,
        text: message || "Hi,\n\nPlease find the resume attached. \n\nThanks",
        attachments: [
          {
            filename: `${resume.personalDetails.name}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      return {
        content: [{ type: "text", text: `Resume sent to ${email}` }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
  return {
    isError: true,
    content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Resume server running on stdio");
}
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

export { server };
