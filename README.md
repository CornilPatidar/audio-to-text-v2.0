# Audio-to-Text v2.0

🎤 **Live Demo**: [https://audio-to-text-v2-0.vercel.app/](https://audio-to-text-v2-0.vercel.app/)

A modern audio transcription application powered by Rev AI. Transform your audio files into text using professional-grade speech recognition with enterprise-level accuracy.

## ✨ Features

- 🎯 **Professional Transcription** - Convert speech to text using Rev AI's enterprise-grade models
- 🌍 **Multi-language Support** - Transcribe audio in 100+ languages with automatic detection
- 🔒 **Secure Cloud Processing** - Audio processed securely on Rev AI's servers
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 📤 **Multiple Export Formats** - Export as TXT, PDF, DOCX, JSON, SRT, or VTT files
- 🔐 **Secure Authentication** - Sign in with Google, Apple, or email accounts

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **AI**: Rev AI Professional Speech-to-Text API (99%+ accuracy)
- **Auth**: Firebase Authentication
- **Deployment**: Vercel

## 🚀 Quick Start

### 1. Setup Requirements
- **Rev AI API Key**: Get your free key at [rev.ai](https://rev.ai) (5 hours/month free)
- **Firebase Project**: Create at [Firebase Console](https://console.firebase.google.com/)

### 2. Environment Variables
Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_REVAI_API_KEY=your-revai-api-key-here
```

### 3. Install & Run
```bash
npm install
npm run dev
```

## 🔐 Authentication Setup

1. **Firebase Console** → Authentication → Sign-in method
2. Enable **Google** and **Apple** providers
3. For Apple: Create Apple Developer account and configure Sign in with Apple

## 📊 Supported Formats

- **Input**: Audio files up to 2GB
- **Output**: TXT, JSON, SRT, VTT, DOCX, PDF
- **Features**: Speaker diarization, custom vocabulary, timestamps

## 🌐 Browser Support

- Chrome/Edge 88+ (Recommended)
- Firefox 89+
- Safari 15.4+

---

*Built with ❤️ using React and Rev AI's professional speech recognition service.*
