# Golden Ratio Face Analyzer (v2)

A full-stack web application that analyzes facial landmarks to calculate the "Golden Ratio" of a human face. The application uses computer vision to detect facial features, performs geometric calculations, and generates detailed analysis reports including visual "Shrink/Bulge" adjustments and symmetry assessments.

## Tech Stack

### **Backend**
* **Framework:** Django (Python)
* **API:** GraphQL (Graphene-Django)
* **Computer Vision:** OpenCV, MediaPipe (Face Mesh)
* **Database:** PostgreSQL (Production) / SQLite (Dev)
* **Storage:** Google Cloud Storage (for image persistence)

### **Frontend**
* **Framework:** React (TypeScript)
* **Styling:** Tailwind CSS
* **State Management:** React Hooks

---

## Project Structure

This repository is a Monorepo containing both the server and client code:

* **`goldenratio_backend/`**: The Django server code, API logic, and image processing algorithms.
* **`goldenratio_frontend/`**: The React user interface code.

---

## Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js (v18+) & npm
* PostgreSQL (Optional for local dev, required for production)

### 1. Backend Setup (Django)

Navigate to the backend folder:
in Terminal:
cd goldenratio_backend

Setup Database:

Install PostgreSQL and then open SQL Shell (psql):
Create a database after configuring postgres using the following command

create database your_preferred_database_name;

upon creating the database, configure the settings.py DATABASES section where you may need to enter the newly created database details.
The database details that need to enter are Username, Password, Database name, User & Port number.

Create a virtual environment and activate it:
python -m venv venv

# Windows:
.\venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

Install dependencies:
pip install -r requirements.txt

Run migrations and start the server:
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

The backend will start at http://127.0.0.1:8000/

2. Frontend Setup (React)
Open a new terminal and navigate to the frontend folder:
cd goldenratio_frontend

Install Node dependencies:
npm install

Start the React development server:
npm start

The frontend will start at http://localhost:3000/



Features

-- Facial Landmark Detection: Precise mapping of face mesh using MediaPipe.

-- Golden Ratio Calculation: Mathematical analysis of facial proportions (Phi Matrix).

-- Symmetry Analysis: Comparison of left vs. right face structures.

-- Visual Adjustments: "Shrink" and "Bulge" visualizations to show ideal proportions.

-- PDF Reports: Auto-generation of downloadable analysis reports.

© Vividobots
