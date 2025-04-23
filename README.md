# T&Cs Document Processor

A web application that processes and compares Terms & Conditions documents using AI to align buyer's clauses with seller's model.

## Features

- Upload Seller and Buyer T&Cs documents (PDF format)
- AI-powered transformation of buyer's clauses to match seller's structure
- Annotated PDF output highlighting changes
- Modern React frontend with Tailwind CSS
- FastAPI backend with OpenAI GPT-4 integration

## Prerequisites

- Docker and Docker Compose
- OpenAI API Key

## Setup

1. Clone the repository
2. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

3. Build and start the services:
   ```bash
   docker-compose up --build
   ```

4. Access the application at http://localhost:3000

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