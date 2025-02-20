# Contract Management System

A full-stack application for managing contracts with real-time updates using WebSocket.

## Features

- Upload and manage contract data
- Real-time status updates
- Search and filter contracts
- Edit contract details
- Responsive UI with modern design
- WebSocket integration for live updates
- PostgreSQL database integration
- AWS deployment ready

## Tech Stack

### Frontend
- React.js
- TailwindCSS
- shadcn/ui components
- WebSocket client
- React Router for navigation

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- WebSocket server
- PostgreSQL database
- Pydantic for data validation

## Local Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- AWS CLI (for deployment)

### Environment Variables

#### Backend (.env)
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/contract_db
CORS_ORIGINS=http://localhost:3000
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
```

#### Frontend (.env)
```ini
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
```

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up the database:
   ```bash
   createdb contract_db
   ```

4. Run migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## AWS Deployment

### Backend Deployment (AWS Elastic Beanstalk)

1. Initialize Elastic Beanstalk:
   ```bash
   eb init -p python-3.8 contract-management
   ```

2. Create the environment:
   ```bash
   eb create contract-management-env
   ```

3. Deploy:
   ```bash
   eb deploy
   ```

### Frontend Deployment (AWS S3 + CloudFront)

1. Create an S3 bucket:
   ```bash
   aws s3 mb s3://your-bucket-name
   ```

2. Build the frontend:
   ```bash
   npm run build
   ```

3. Deploy to S3:
   ```bash
   aws s3 sync build/ s3://your-bucket-name
   ```

4. Configure CloudFront distribution:
   - Create a new distribution
   - Point to the S3 bucket
   - Enable HTTPS
   - Configure custom domain (optional)

## API Documentation

### Endpoints

#### GET /contracts/
Query Parameters:
- `status`: Filter by contract status (DRAFT/FINALIZED)
- `client_name`: Search by client name
- `contract_id`: Search by contract ID
- `skip`: Pagination offset
- `limit`: Number of records per page

#### POST /contracts/
Create a new contract

#### PUT /contracts/{contract_id}
Update an existing contract

#### DELETE /contracts/{contract_id}
Delete a contract

### WebSocket

Connect to `/ws` for real-time updates on contract changes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

