#!/usr/bin/env bash

set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}     SatyaLens - Setup & Initialization Script      ${NC}"
echo -e "${CYAN}====================================================${NC}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

# 1. Check prerequisites
echo -e "\n${YELLOW}[1/4] Checking environment requirements...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 is required but not installed.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is required but not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python $(python3 --version | cut -d' ' -f2) and Node/npm detected.${NC}"

# 2. Setup Backend
echo -e "\n${YELLOW}[2/4] Setting up Backend (FastAPI + SQLAlchemy)...${NC}"
cd "${BACKEND_DIR}"

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment in backend/venv..."
    python3 -m venv venv
fi

echo "Installing backend dependencies..."
./venv/bin/pip install --upgrade pip > /dev/null
./venv/bin/pip install -r requirements.txt

echo "Running migrations and seeding 50+ Indian news domain classifications..."
./venv/bin/python -c "
from app.database import init_db, SessionLocal
from app.seed_data import seed_initial_domains
from app.models import DomainClassification

init_db()
db = SessionLocal()
seeded = seed_initial_domains(db)
total = db.query(DomainClassification).count()
print(f'Database initialized successfully! Total seeded publications in DB: {total}')
db.close()
"
echo -e "${GREEN}✓ Backend setup complete.${NC}"

# 3. Setup Frontend
echo -e "\n${YELLOW}[3/4] Setting up Frontend (Next.js 14)...${NC}"
cd "${FRONTEND_DIR}"

echo "Installing frontend npm dependencies..."
npm install --silent

echo -e "${GREEN}✓ Frontend setup complete.${NC}"

# 4. Summary & Launch
echo -e "\n${YELLOW}[4/4] Setup Finished Successfully!${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "You can now run SatyaLens using one of these methods:"
echo -e ""
echo -e "${CYAN}Option A: Run with Docker Compose (1 Command):${NC}"
echo -e "  docker compose up --build"
echo -e ""
echo -e "${CYAN}Option B: Run locally in 2 terminals:${NC}"
echo -e "  Terminal 1 (Backend):"
echo -e "    cd backend && ./venv/bin/uvicorn app.main:app --reload --port 8000"
echo -e ""
echo -e "  Terminal 2 (Frontend):"
echo -e "    cd frontend && npm run dev"
echo -e ""
echo -e "Access URLs:"
echo -e "  Frontend UI:           ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend API:          ${GREEN}http://localhost:8000${NC}"
echo -e "  Interactive Swagger:  ${GREEN}http://localhost:8000/docs${NC}"
echo -e "${GREEN}====================================================${NC}"

# If argument --start or -s is passed, run both in background/foreground
if [[ "$1" == "--start" || "$1" == "-s" ]]; then
    echo -e "\n${CYAN}Starting both backend and frontend servers...${NC}"
    
    # Start backend
    cd "${BACKEND_DIR}"
    ./venv/bin/uvicorn app.main:app --port 8000 &
    BACKEND_PID=$!

    # Start frontend
    cd "${FRONTEND_DIR}"
    npm run dev -- -p 3000 &
    FRONTEND_PID=$!

    trap "kill $BACKEND_PID $FRONTEND_PID" EXIT INT TERM
    wait
fi
