# Weather App — PM Accelerator Technical Assessment

**Author:** Wajid Karim  
**Role:** Full Stack Engineer  
**Assessments Completed:** #1 (Frontend) + #2 (Backend)

---

## Quick Start

```bash
# Backend (port 3001)
cd backend
npm install
npm run dev

# Frontend (port 5173) — new terminal
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

Optional: copy `backend/.env.example` → `backend/.env` and add `YOUTUBE_API_KEY` for embedded YouTube results.

---

## Assessment Checklist

### Tech Assessment #1 — Frontend (Required)

| Requirement | Status |
|-------------|--------|
| Location input (city, zip, landmark, coordinates) | Done |
| Current weather with useful details | Done |
| Current location via geolocation | Done |
| Weather icons | Done |
| 5-day forecast | Done |
| Error handling (not found, API failure, geolocation denied) | Done |
| Responsive design (mobile / tablet / desktop) | Done |
| Real API data (Open-Meteo) | Done |
| Author name + PM Accelerator description | Done |

### Tech Assessment #2 — Backend (Required)

| Requirement | Status |
|-------------|--------|
| CREATE — location + date range → temperatures stored in DB | Done |
| READ — list all saved weather records | Done |
| UPDATE — edit records with validation | Done |
| DELETE — remove records | Done |
| Date range validation | Done |
| Location validation (geocoding) | Done |
| YouTube integration | Done |
| Google Maps / map data | Done |
| Data export (JSON, CSV, XML, Markdown, PDF) | Done |
| RESTful API | Done |

### Stand-Apart Features (Completed)

- 5-day forecast with precipitation probability
- Error handling with user-friendly messages
- YouTube + Maps on saved records

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/current?location=` | Current weather + forecast |
| GET | `/api/weather/current?lat=&lon=` | Weather by GPS coordinates |
| POST | `/api/weather/records` | Create record |
| GET | `/api/weather/records` | List records |
| GET | `/api/weather/records/:id` | Get one record |
| PUT | `/api/weather/records/:id` | Update record |
| DELETE | `/api/weather/records/:id` | Delete record |
| GET | `/api/export/:format` | Export (`json`, `csv`, `xml`, `markdown`, `pdf`) |

---

## Tech Stack

- **Frontend:** React 19, Vite 6
- **Backend:** Node.js, Express 4, SQLite
- **Weather:** Open-Meteo (free, no API key)
- **Maps:** OpenStreetMap embed + Google Maps links
- **Videos:** YouTube Data API v3 (optional key)

---

## Form Submission Notes

For the Google Form submission:

| Field | Suggested Answer |
|-------|------------------|
| Role | Fullstack |
| GitHub repo | Your public repo URL |
| Demo video | 1–2 min screen recording (code + app demo) |
| Weather app URL | `Locally Hosted Only` |
| Extra features | `I did basic + extra features` (5-day forecast, error handling, export formats) |

---

## About PM Accelerator

[Product Manager Accelerator on LinkedIn](https://www.linkedin.com/company/product-manager-accelerator)
