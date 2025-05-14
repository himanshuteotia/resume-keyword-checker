# Resume Keyword Checker

A full-stack application that helps job seekers optimize their resumes by checking for keyword matches against job descriptions and managing resume templates.

## Features

- **LLM-Powered Resume Analysis**: Compare your resume against job descriptions using a local Llama3.2 model via Ollama (with a fallback extractor).
- **Keyword Matching & Suggestions**: Identify matched and missing keywords, plus actionable tips to improve your resume.
- **Email Resume Directly**: Compose and send your resume via an in-app modal without leaving the browser.
- **Template Management (CRUD)**: Create, read, update, and delete reusable resume templates stored in MongoDB.
- **ATS-Friendly Templates**: Access pre-built templates optimized for Applicant Tracking Systems.
- **PDF Generation**: Generate and download professional-quality resume PDFs.
- **NLP-Based Keyword Extraction**: Leverage NLP to identify technical terms while filtering out common stopwords.

## Project Structure

The project consists of:
- React frontend with TypeScript
- Node.js/Express backend
- MongoDB database for storing resume templates

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd resume-keyword-checker
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
npm install
```

### Configuration

1. Create a `.env` file in the backend directory with your MongoDB connection string:
```
MONGO_URI=mongodb://localhost:27017/resumeTemplatesDB
PORT=5001
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm start
```

2. In a new terminal, start the frontend development server
```bash
npm start
```

3. Open your browser and navigate to http://localhost:3000

## Usage

### Resume Analysis
1. Navigate to the Resume Analysis page
2. Paste your resume and job description in the provided fields
3. Click "Analyze" to see matching and missing keywords

### Template Management
1. Go to the Templates page
2. Fill in the form to create a new template
3. View, edit, or delete existing templates from the list

## LLM-based Analysis via Ollama

The backend can optionally use a locally hosted Llama 3.2 model via Ollama to perform resume vs job-description analysis. If you have Ollama installed and the llama3.2 model pulled, the `/analyze` endpoint will shell out to the LLM for more accurate keyword matching and contextual suggestions. Otherwise, it falls back to a simple keyword extractor.

### Prerequisites for LLM Integration

- Install Ollama (e.g. via Homebrew):
  ```bash
  brew install ollama
  ```
- Pull the Llama 3.2 model:
  ```bash
  ollama pull llama3.2
  ```

### How It Works

1. When you hit **Analyze** in the front end, the backend spawns:
   ```bash
   ollama run llama3.2 --prompt "<built prompt with JD + resume>"
   ```
2. The model is instructed to return only a JSON object with keys:
   - `matched`: keywords found in your resume
   - `missing`: keywords to add
   - `suggestions`: human-readable improvement tips
3. If the call fails or no JSON is returned, the server falls back to a basic noun/keyword extractor.

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, MongoDB/Mongoose
- **PDF Generation**: Custom PDF rendering

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Resume MCP Server

This server provides Model Context Protocol (MCP) support for fetching resume templates and sending resumes via email. You can integrate it with LLMs like Claude (Anthropic) using tool use (function calling).

## Features

- **Get Resume Templates:**
  - Use the MCP tool `get_templates` to fetch all available resume templates from MongoDB.
- **Send Resume via Email:**
  - Use the MCP tool `send_resume` to generate a PDF from a selected template and send it via email.

## Environment Variables

Set these environment variables for email sending:

```
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_gmail@gmail.com
```

## How to Run

```bash
npm install
node backend/mcp-server.js
```

## Testing with MCP Inspector

To test the server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node backend/mcp-server.js
```

## Example MCP Tool Calls

### 1. Get All Resume Templates

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_templates",
    "arguments": {}
  }
}
```

### 2. Send Resume via Email

```json
{
  "method": "tools/call",
  "params": {
    "name": "send_resume",
    "arguments": {
      "email": "himanshuteotia7@gmail.com",
      "template": "Senior Software Developer",
      "message": "Hi,\n\nPlease find my resume attached for your consideration.\n\nThanks,\nHimanshu"
    }
  }
}
```
- The `message` field is optional. If not provided, a default message will be used.

## Notes
- Templates are stored in the `ResumeTemplate` collection in MongoDB.
- The email is sent with a PDF attachment.
- The MCP response will include an error or success message.

---

## Integrating with Claude (Anthropic) Tool Use

You can connect this MCP server to Claude using Anthropic's tool use (function calling) feature. This allows Claude to:
- Fetch available resume templates
- Send a resume via email

### 1. Expose Your MCP Server Tools

Your MCP server exposes two main tools:
- `get_templates`: Fetches all available resume templates from MongoDB.
- `send_resume`: Generates a PDF from a selected template and sends it via email.

### 2. Example User Prompts for Claude

- **To get all templates:**
  - "Show me all available resume templates."
- **To send a resume:**
  - "Send my Senior Software Developer resume to himanshuteotia7@gmail.com with the message: 'Hi, please find my resume attached for your consideration.'"

<img width="743" alt="image" src="https://github.com/user-attachments/assets/f7d4bedd-0105-4b2e-95c9-c3c27556ed4b" />


<img width="729" alt="image" src="https://github.com/user-attachments/assets/93fb8488-6f54-4ebb-8184-ddf26fcff06e" />


### 3. References

- [Anthropic Claude Tool Use Documentation](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview)
- [Model Context Protocol (MCP) Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
