# 🛡️ PaySentinel — AI Guardian (Frontend)

An AI-powered fintech security platform that detects fake online payments,
fraudulent UTR transactions, and malicious QR codes.

## 🌐 Live Demo
 -  deployed to vercel

## ✨ Features
- 🖼️ Fake payment screenshot detection
- 📱 Real-time QR code threat scanning
- 🔢 UTR transaction verification
- 📊 Security analytics dashboard
- 🔐 Firebase authentication (Email + Google)
- 🌙 Premium dark-mode fintech UI

## 🛠️ Tech Stack
- **Frontend:** React.js, React Router, Chart.js
- **Auth:** Firebase Authentication
- **Styling:** Inline styles + custom CSS animations
- **API:** Axios (connects to Node.js backend)

## 🚀 Run Locally

1. Clone the repo
   git clone https://github.com/mehak018/paysentinel.git

2. Install dependencies
   cd paysentinel
   npm install

3. Create .env file
   REACT_APP_API_URL=http://localhost:5000

4. Start the app
   npm start

## 📁 Project Structure
src/
├── components/    Reusable UI (Navbar, VerdictCard, ProtectedRoute)
├── pages/         Full pages (Home, Dashboard, Scanner, VerifyUTR, Screenshot)
├── context/       Firebase Auth context
└── services/      Firebase config + Backend API calls

## 👨‍💻 Author
Built as a full-stack learning project — AI fintech security platform