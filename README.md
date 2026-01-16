# 🥗 EatRight AI Nutrition Assistant

A modern, AI-powered nutrition assistant that helps users analyze their meals, track calories, and get personalized nutrition advice using Google's Gemini AI.

<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/6c8f89cc-bce7-48cd-bfcc-3558dcd5c223" />


## ✨ Features

- **📸 Instant Food Analysis**: Upload or snap a photo of your meal.
- **🤖 AI Nutritionist**: Powered by Gemini 2.0 Flash for accurate food identification and advice.
- **📊 Smart Tracking**: Automatically estimates calories, protein, carbs, and fats.
- **🔐 Secure Authentication**: Google OAuth 2.0 integration.
- **📅 Meal History**: Keep track of your daily nutrition journey.
- **📈 Progress Insights**: Weekly charts and stats to monitor your goals.
- **📱 Mobile Ready**: Optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Recharts, Framer Motion
- **Backend**: FastAPI, Python, MongoDB (Motor)
- **AI**: Google Gemini API (Visual Analysis)
- **Storage**: Google Cloud Storage (Images)
- **Auth**: Google OAuth + JWT

## 🚀 Getting Started

### Prerequisites

- Node.js & npm
- Python 3.9+
- MongoDB Atlas Account
- Google Cloud Project (for GCS & OAuth)
- Gemini API Key

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_key
MONGODB_URI=your_mongodb_connection_string
GCS_BUCKET_NAME=your_bucket_name
GOOGLE_APPLICATION_CREDENTIALS=path/to/gcs_credentials.json

# Authorization
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
JWT_SECRET_KEY=generate_a_random_secret_string
FRONTEND_URL=http://localhost:5173
```

Start the server:
```bash
uvicorn main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id
```

Start the development server:
```bash
npm run dev
```

## 🔑 Key Configuration Guide

### How to get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Application type: **Web application**.
6. Add Authorized Redirect URI: `http://localhost:8000/auth/google/callback`
7. Copy the **Client ID** and **Client Secret** to your `.env` files.

### How to generate JWT Secret
You can generate a secure random key using python:
```python
import secrets
print(secrets.token_urlsafe(32))
```

## 📱 Mobile Usage
To use the camera feature on mobile:
1. Access the app via your network IP (e.g., `http://192.168.1.x:5173`).
2. Ensure your backend allows CORS from this IP.
3. The upload button will automatically prompt for Camera or Gallery.

## 📄 License
MIT License - Made with ❤️ by EatRight Team
