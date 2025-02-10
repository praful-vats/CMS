from fastapi import FastAPI, HTTPException, WebSocket, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, DateTime, Integer, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional
from datetime import datetime
import enum
import os
from dotenv import load_dotenv
import json
from typing import Optional

load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
POSTGRES_URL = os.getenv("DATABASE_URL")
engine = create_engine(POSTGRES_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# WebSocket connections store
active_connections: List[WebSocket] = []

class ContractStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    FINALIZED = "FINALIZED"

class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(String, unique=True, index=True)
    client_name = Column(String, index=True)
    status = Column(SQLEnum(ContractStatus), default=ContractStatus.DRAFT)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# WebSocket endpoints
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Keep connection alive
    except:
        active_connections.remove(websocket)

async def notify_clients(message: str):
    for connection in active_connections:
        await connection.send_text(message)

# REST endpoints
@app.post("/contracts/")
async def create_contract(contract_data: dict, db: Session = Depends(get_db)):
    contract = Contract(
        contract_id=contract_data["contract_id"],
        client_name=contract_data["client_name"],
        content=json.dumps(contract_data["content"]),
        status=contract_data.get("status", ContractStatus.DRAFT)  # Use provided status or DRAFT as default
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)
    await notify_clients(f"New contract created: {contract.contract_id}")
    return contract

@app.get("/contracts/")
async def get_contracts(
    status: Optional[str] = None,
    clientName: Optional[str] = None, 
    contractId: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Contract)
    
    if status:
        query = query.filter(Contract.status == status)
    if clientName:
        query = query.filter(Contract.client_name.ilike(f"%{clientName}%"))
    if contractId:
        query = query.filter(Contract.contract_id.ilike(f"%{contractId}%"))
        
    contracts = query.offset(skip).limit(limit).all()
    return contracts

@app.put("/contracts/{contract_id}")
async def update_contract(contract_id: str, contract_data: dict, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    for key, value in contract_data.items():
        setattr(contract, key, value)
    
    contract.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contract)
    
    await notify_clients(f"Contract updated: {contract_id}")
    return contract

@app.delete("/contracts/{contract_id}")
async def delete_contract(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    db.delete(contract)
    db.commit()
    
    await notify_clients(f"Contract deleted: {contract_id}")
    return {"message": "Contract deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)