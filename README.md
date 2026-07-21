# AuraFit — Personal Fitness & Nutrition Tracker

AuraFit is a premium, full-stack fitness tracking web application built to monitor workouts, diet, and weight goals with beautiful, interactive visual analytics.

---

## ✨ Features

- **🔒 User Authentication & Profiles:** 
  - JWT-based authentication using Django SimpleJWT.
  - User profiles containing age, height, weight, daily calorie targets, and macronutrient splits (protein/carbs/fat).
- **💪 Workout logging:**
  - Track exercises, record weight, repetitions, or cardio metrics (distance and duration).
  - Create and manage custom exercise types.
- **🍎 Diet Counter:**
  - Log daily meals (Breakfast, Lunch, Dinner, Snack).
  - Search a pre-seeded food item database or add custom foods with calorie and macronutrient counts.
- **📊 Interactive Visual Analytics:**
  - Real-time calorie consumption vs. daily targets.
  - Historical weight logs represented via beautiful area line charts.
  - Workout category splits (Strength vs. Cardio vs. Flexibility).
- **🎨 Premium Dark Theme UI:**
  - Recharts integrations, smooth glassmorphism, responsive sidebar layout.

---

## 🛠️ Technology Stack

- **Backend:** Django, Django REST Framework, SQLite (default dev database), PostgreSQL (configured).
- **Frontend:** React (Vite), Tailwind CSS v3.4, Recharts (glowing SVG charts), Axios (automatic JWT token refresh interceptors), Lucide React (icons).

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/himanshu9899/fitness-tracker.git
cd fitness-tracker
```

### 2. Backend Setup
1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Seed sample data (creates a default user `demo` with password `password123` and 7 days of logs):
   ```bash
   python seed.py
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```
The backend API runs at `http://localhost:8000/`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
The React application runs at `http://localhost:5173/`.

---

## 🔑 Demo Account
- **Username:** `demo`
- **Password:** `password123`
