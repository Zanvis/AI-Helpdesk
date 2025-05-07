# Helpdesk AI

### 1. Clone the Repository
To get a local copy of the project:
```bash
git clone https://github.com/Zanvis/AI-Helpdesk.git
cd helpdesk-ai-assistant
```

Alternatively, you can fork the repository on GitHub and then clone your fork.

### 2. Install Dependencies
Install all required Node.js packages:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following content:
```
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual Gemini API key.

---

## Running the Application

### Option 1: Run Locally
Start the development server:
```bash
npm start
```
Then open your browser and go to:
```
http://localhost:3000
```

### Option 2: Run with Docker Compose
Build and run the application using Docker:
```bash
docker-compose up --build
```
Then access it in your browser at:
```
http://localhost:3000
```

---

## How to Use the Application

When the application loads:
- The AI assistant will greet the user and guide them through filling out a contact form.
- It will prompt the user for each of the following inputs:
  - First Name (max 20 characters)
  - Last Name (max 20 characters)
  - Email Address (must be valid)
  - Reason of Contact (max 100 characters)
  - Urgency Level (an integer from 1 to 10)

As you proceed:
- The right-hand panel shows the current state of the form.
- Once all required information is valid and complete, the form is submitted automatically.
- The submitted data is saved as a JSON file.
- A "Reset Form" button is available to clear the form and restart the process.