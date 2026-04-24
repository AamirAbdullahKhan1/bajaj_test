# SRM Full Stack Engineering Challenge

A complete full-stack solution for parsing, validating, and analyzing tree hierarchies from directed edges.

## Project Structure
This is a monorepo containing two main parts:
- **`backend/`**: Node.js + Express API for business logic.
- **`frontend/`**: React + Vite single-page application for the UI.

## Tech Stack
- **Backend:** Node.js, Express, CORS
- **Frontend:** React, Vite, CSS (Vanilla, modern dark theme)
- **Deployment Ready:** Easy to deploy on platforms like Render, Vercel, Railway, etc.

---

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update User Identity (IMPORTANT):
   Open `backend/src/config.js` and update the constants with your details:
   - `USER_ID`: `"firstname_lastname_ddmmyyyy"`
   - `EMAIL_ID`: your college email
   - `COLLEGE_ROLL_NUMBER`: your roll number
4. (Optional) Start the server in dev mode:
   ```bash
   npm run dev
   ```
   *(Server runs on `http://localhost:3000`)*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *(Frontend runs on `http://localhost:5173`)*

4. Open your browser and go to the frontend URL to use the application!

---

## 🚀 Deployment Guide

### Backend (Render / Railway)
1. Push this repository to GitHub.
2. Go to Render (render.com) or Railway (railway.app) and create a new "Web Service".
3. Connect your GitHub repo.
4. **Root Directory:** Set to `backend`
5. **Build Command:** `npm install`
6. **Start Command:** `npm start`
7. Deploy. Once live, copy the backend URL (e.g., `https://bfhl-api-xyz.onrender.com`).

### Frontend (Vercel / Netlify)
1. Go to Vercel (vercel.com) or Netlify (netlify.com) and create a new project.
2. Connect your GitHub repo.
3. **Root Directory:** Set to `frontend`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment Variables:** Add a new variable:
   - Key: `VITE_API_URL`
   - Value: `<YOUR_DEPLOYED_BACKEND_URL>` (e.g., `https://bfhl-api-xyz.onrender.com`)
7. Deploy!

---

## 🧪 Edge Cases Handled
- **Invalid Formats:** Entries like `"hello"`, `"A->"`, `"1->2"`, or self-loops `"A->A"` are caught and isolated.
- **Duplicate Edges:** Exact duplicate pairs (e.g., `"A->B"`, `"A->B"`) are tracked, and only the first is used.
- **Multi-Parent Conflict (Diamond case):** If a child receives multiple parents (e.g., `"A->D"` and `"B->D"`), the first-parent-wins rule is applied. The subsequent edge is silently discarded for tree construction.
- **Cycle Detection:** Cycles are accurately detected using DFS and a 3-color map. Cyclic components are isolated and reported without calculating depth.
- **Multiple Disconnected Trees:** Groupings that form separate disconnected trees are successfully split and analyzed independently.
- **Lexicographical Ordering:** Root selection for pure cycles and depth tie-breakers are deterministic and alphabetical.

## 📝 Usage / Sample Request
**Endpoint:** `POST /bfhl`
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "data": [
    "A->B", "A->C", "B->D", "C->E", "E->F",
    "X->Y", "Y->Z", "Z->X",
    "P->Q", "Q->R",
    "G->H", "G->H", "G->I",
    "hello", "1->2", "A->"
  ]
}
```

**Response (Snippet):**
```json
{
  "user_id": "john_doe_17091999",
  "email_id": "john.doe2022@srm.edu.in",
  "college_roll_number": "RA2111003010001",
  "hierarchies": [
    {
      "root": "A",
      "tree": { "A": { "B": { "D": {} }, "C": { "E": { "F": {} } } } },
      "depth": 4
    },
    ...
  ],
  "invalid_entries": ["hello", "1->2", "A->"],
  "duplicate_edges": ["G->H"],
  "summary": {
    "total_trees": 3,
    "total_cycles": 1,
    "largest_tree_root": "A"
  }
}
```
