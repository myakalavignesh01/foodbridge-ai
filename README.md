# FoodBridge AI

> **Surplus Food. Smart Matching. Zero Hunger.**  
> UN SDG 2 — Zero Hunger Platform

FoodBridge AI is a production-quality AI-powered food redistribution platform that connects surplus food donors with verified NGOs, shelters, and community kitchens — using intelligent matching, real-time coordination, and transparent impact tracking.

---

## 🚀 Live Demo

**URL:** https://foodbridge-ai-jade.vercel.app

**Demo Accounts** (password: `demo1234` for all):

| Role | Email |
|---|---|
| Admin | admin@demo.com |
| Donor | donor@demo.com |
| NGO Recipient | ngo@demo.com |
| Volunteer | volunteer@demo.com |

---

## Features

- Role-based authentication (Donor / Recipient / Volunteer / Admin)
- AI matching engine scoring on 7 factors (distance, urgency, need, compatibility, capacity, reliability, pickup)
- Food safety assessment engine
- 4-step donation wizard with live safety preview
- Full donation lifecycle tracking
- Live map dashboard
- AI Assistant chatbot
- Analytics with charts
- Impact engine (meals, food weight, people reached)
- In-app notifications

---

## Tech Stack

- Next.js 16 + React 19 + Tailwind CSS 4
- Prisma ORM + PostgreSQL
- NextAuth.js v5
- Recharts
- Vercel deployment

---

## Run Locally

```bash
git clone https://github.com/myakalvignesh01/foodbridge-ai.git
cd foodbridge-ai
npm install --legacy-peer-deps
# Add DATABASE_URL to .env.local
npx prisma@5 db push --schema=./prisma/schema.prisma
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npx next dev --port 3000
```

---

Built for UN SDG 2 — Zero Hunger
