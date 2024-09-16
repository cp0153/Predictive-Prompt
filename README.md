# Predictive Prompt

**Predictive Prompt** is a simple Language Learning Model (LLM) chat window with retro styling. It dynamically populates a dropdown with available models from a local instance of Ollama and uses the streaming API to generate and display results in real-time. The output is rendered in markdown with syntax highlighting support.

## Features

- **Dynamic Model Selection**: Automatically fetches available models from your local Ollama instance.
- **Retro Loading Bar**: Displays a nostalgic loading bar while the model processes your request.
- **Real-time Text Rendering**: Text is rendered in chunks as the model generates the output.
- **Markdown Support**: The output includes markdown formatting and syntax highlighting for code snippets.

## Getting Started

Follow these steps to set up **Predictive Prompt**:

### 1. Setting Up Ollama

Before starting, ensure that Ollama is installed and running on your local machine with the streaming API enabled.

1. **Download Ollama**
   - Go to [ollama.com](https://ollama.com) and download the version suited for your operating system.

2. **Install Ollama**
   - Follow the step-by-step installation guide for your specific OS:
     - For Windows, use the [Windows installation guide](https://github.com/ollama/ollama/blob/main/docs/windows.md).
     - For macOS and Linux, check the [Ollama Download page](https://ollama.com/download) for instructions.

3. **Start Ollama**
   - Once installed, start Ollama and ensure the streaming API is running on `http://localhost:11434` (default).

### 2. Installing Project Dependencies

1. **Install Node.js and npm**  
   - If Node.js and npm are not already installed, download and install them from [nodejs.org](https://nodejs.org). npm is included with Node.js.

2. **Install Project Dependencies**  
   - In your terminal, navigate to the project directory where `package.json` is located.
   - Run the command:  
     ```bash
     npm install
     ```  
     or  
     ```bash
     yarn install
     ```  
     to install all necessary dependencies.

### 3. Running the Development Server

1. **Start the Server**  
   - In your terminal, run:  
     ```bash
     npm run dev
     ```  
     or  
     ```bash
     yarn dev
     ```  
     This will start the development server.

2. **Open the Chat Window**  
   - Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Select a Model**  
   - Use the dropdown menu to choose a model from your local Ollama instance.

2. **Enter Your Prompt**  
   - Type your prompt into the text input area.

3. **Generate Output**  
   - Press the 'Send' button to submit your prompt. The model will begin processing, and the output will be displayed in markdown format as it is generated.

## Troubleshooting

- **Ollama Not Running**: If you receive an error indicating that Ollama is not running, ensure that Ollama is installed correctly and the streaming API is enabled on `http://localhost:11434`.
- **Model Selection Issues**: If models do not appear in the dropdown, make sure your Ollama instance is running properly. Restart Ollama and refresh the chat window if necessary.
