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