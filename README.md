# 🚀 MTI – Employee Review System

An internal company tool to manage employee peer reviews with automated assignment and email notifications.

---

# 🧠 Project Overview

This system allows:

* Employees to review colleagues
* Admin to manage users and departments
* Automatic assignment of reviewers
* Email notifications to users
* Dashboard to analyze reviews

---

# 🧱 Tech Stack

## 🔹 Frontend

* React.js
* Tailwind CSS
* Axios

## 🔹 Backend

* FastAPI (Python)
* SQLAlchemy

## 🔹 Database

* MySQL

## 🔹 Email

* Gmail SMTP (App Password)

---

# 🗂️ Project Structure

```
MTI/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── database.py
│   │   ├── email_utils.py
│   ├── venv/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── ReviewForm.js
│   │   ├── App.js
```

---

# 🧱 Prerequisites

Make sure you have installed:

* Python (3.9+)
* Node.js (v16+)
* MySQL Server
* Git

---

# 📥 Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/mti-review-system.git
cd mti-review-system
```

---

# 🗄️ Database Setup (MySQL)

## Create Database

```sql
CREATE DATABASE mti_db;
```

## Create Tables

```sql
-- Users
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE departments (
    dep_id INT AUTO_INCREMENT PRIMARY KEY,
    dep_name VARCHAR(100)
);

-- Reviews
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id INT,
    reviewee_id INT,
    rating INT,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments
CREATE TABLE review_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id INT,
    reviewee_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# ⚙️ Backend Setup

## Navigate to Backend

```bash
cd backend
```

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Environment

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy mysql-connector-python python-dotenv
```

## Configure Database

Edit `backend/app/database.py`:

```python
DATABASE_URL = "mysql+mysqlconnector://root:your_password@localhost/mti_db"
```

## Configure Email

Edit `backend/app/email_utils.py`:

```python
sender_email = "your_email@gmail.com"
app_password = "your_app_password"
```

> ⚠️ Use Gmail App Password (not your normal password)

## Run Backend Server

```bash
uvicorn app.main:app --reload
```

### Backend URL

* API: http://127.0.0.1:8000
* Docs: http://127.0.0.1:8000/docs

---

# 🎨 Frontend Setup

## Navigate to Frontend

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Run Frontend

```bash
npm start
```

### Frontend URL

```
http://localhost:3000
```

---

# 🔄 Application Flow

1. Open Dashboard
   → `/dashboard`

2. Add:

   * Departments
   * Users

3. Click:
   → **Generate Assignments**

4. System:

   * Assigns 4 reviewers per user
   * Sends email notifications

5. Users:

   * Open form
   * Submit reviews

---

# 🔧 Core Features

## ✅ User Management

* Add / Delete Users

## ✅ Department Management

* Add / Delete Departments

## ✅ Review System

* Submit feedback
* Rating + comments

## ✅ Assignment Engine

* Auto-assign 4 reviewers per user
* No self-review

## ✅ Email Automation

* Sends personalized review list

## ✅ Dashboard

* View reviews
* Filters (rating, user, month)
* Stats & analytics

---

# ⚠️ Important Notes

## ❗ Do NOT Commit

* `backend/venv/`
* `frontend/node_modules/`
* `.env`

---

## ❗ Email Issues

Make sure:

* 2-Step Verification enabled
* App Password used

---

## ❗ Port Conflict

Run backend on different port:

```bash
uvicorn app.main:app --reload --port 8001
```

---

# 🧠 Quick Commands

## Backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

## Frontend

```bash
cd frontend
npm install
npm start
```

---

# 🎯 What This Project Achieves

* Automates peer review workflow
* Reduces manual coordination
* Provides structured feedback system
* Scalable backend design

---

# 🚀 Future Improvements

* Authentication (Login system)
* Charts & analytics dashboard
* Role-based access
* Deployment (Cloud hosting)

---

# 💬 TL Note

If something fails:

1. Check backend logs
2. Verify API (`/docs`)
3. Then debug frontend

---

# ✅ Status

✔ Backend Complete
✔ Frontend Dashboard Complete
✔ Email Automation Working
✔ Assignment System Working

---

# 🙌 Contributors

* TL / Developer: You
* Intern: Coming soon 🚀

---
