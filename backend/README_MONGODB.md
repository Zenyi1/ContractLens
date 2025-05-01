# MongoDB Integration for ContractLens

This document explains how to set up and test the MongoDB integration for the ContractLens application.

## Prerequisites

- Python 3.9+
- MongoDB installed locally or a MongoDB Atlas account

## Configuration

1. Create a `.env` file in the `backend` directory with the following content:

```
MONGODB_URL=mongodb://localhost:27017/contractlens
```

For MongoDB Atlas, use a connection string like:
```
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/contractlens
```

## Setting Up MongoDB

### Local Installation

1. Install MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Start the MongoDB service
3. MongoDB should be available at `mongodb://localhost:27017`

### Using MongoDB Atlas

1. Create a MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster
3. Configure network access to allow connections from your IP
4. Create a database user
5. Get your connection string from the Atlas dashboard

## Testing the Integration

1. Make sure all dependencies are installed:
```
pip install -r requirements.txt
```

2. Run the test script:
```
python test_mongodb.py
```

This script will:
- Initialize the database connection
- Create test data including a company, user, document, and analysis
- Perform CRUD operations to verify everything works
- Display the results of each operation

## Troubleshooting

If you encounter connection issues:
- Verify MongoDB is running (for local installations)
- Check your network settings and firewall
- Ensure your connection string is correct in the `.env` file
- For Atlas: Verify IP whitelist and user credentials

For other issues, check the error messages which should indicate the specific problem.

## Database Structure

The application uses the following collections:
- `users`: User accounts and authentication information
- `company_profiles`: Company information and preferences
- `company_documents`: Document metadata and storage paths
- `analysis_history`: History of document analysis operations 