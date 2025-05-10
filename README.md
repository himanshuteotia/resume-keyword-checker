# Resume Keyword Checker

A full-stack application that helps job seekers optimize their resumes by checking for keyword matches against job descriptions and managing resume templates.

## Features

- **Resume Analysis**: Check your resume against job descriptions to find missing keywords
- **Template Management**: Create, edit, and delete resume templates
- **ATS-Friendly Templates**: Access templates designed to pass Applicant Tracking Systems
- **PDF Generation**: Generate professional-looking resume PDFs

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

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, MongoDB/Mongoose
- **PDF Generation**: Custom PDF rendering

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.