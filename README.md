# PixelPet - Virtual Pixel Pet Game

> Adopt, raise, and compete with your pixel companion!

## Features

- **Adopt a Pet** - Choose from Cat, Dog, Dragon, or Slime
- **Daily Care** - Feed, play, and keep your pet happy
- **Evolution System** - Level up to evolve your pet through 4 stages (Baby -> Teen -> Adult -> Elder)
- **Daily Tasks** - Complete tasks to earn coins and rewards
- **Shop System** - Buy food, toys, and decorations
- **Social Features** - Follow friends, compete on leaderboard
- **Achievement Badges** - Unlock badges for milestones

## Tech Stack

- Backend: FastAPI + PostgreSQL + SQLAlchemy
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Deploy: Docker + Railway

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key

## License

MIT
