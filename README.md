# ContractLens with Supabase Authentication

A web application for analyzing and comparing legal contracts with Supabase authentication.

## Project Structure

- `frontend/`: React frontend application
- `backend/`: FastAPI backend service

## Setup

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Supabase account (https://supabase.com)

### Supabase Setup

1. Create a new Supabase project
2. Enable email authentication
3. Get your Supabase URL and anon key from the project settings
4. Set up your JWT secret in the Auth settings

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example`:
   ```
   OPENAI_API_KEY=your-openai-api-key
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-service-key
   SECRET_KEY=your-jwt-secret-key
   ```

5. Start the server:
   ```
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```
   npm start
   ```

## Usage

1. Sign up for an account
2. Log in to access the document upload form
3. Upload your documents for comparison and analysis

## Features

- Secure authentication with Supabase
- PDF document upload and processing
- Contract comparison and analysis using LLMs
- Download annotated PDFs and summaries

## Development

### Backend

- Python FastAPI application
- Uses pdfplumber for text extraction
- OpenAI GPT-4 for document transformation
- Run tests: `cd backend && pytest`

### Frontend

- React with Vite
- Tailwind CSS for styling
- Axios for API calls
- Run tests: `cd frontend && npm test`

## API Endpoints

- `POST /process`: Process T&Cs documents
  - Input: MultiPart form data with `seller_tc` and `buyer_tc` PDF files
  - Output: Annotated PDF file
- `GET /health`: Health check endpoint

## License

MIT 