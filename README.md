# Audio-to-Text v2.0

🎤 **Live Demo**: [https://audio-to-text-v2-0.vercel.app/](https://audio-to-text-v2-0.vercel.app/)

A modern audio transcription application powered by Rev AI. Transform your audio files into text using professional-grade speech recognition - all processed securely in the cloud with enterprise-level accuracy.

## ✨ Features

- 🎯 **Professional Audio Transcription** - Convert speech to text using Rev AI's enterprise-grade models
- 🌍 **Multi-language Support** - Transcribe audio in multiple languages with high accuracy
- 🔒 **Secure Cloud Processing** - Your audio is processed securely on Rev AI's servers
- ⚡ **Fast & Reliable** - No model downloads, immediate processing with professional uptime
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🚀 **Enterprise Features** - Speaker diarization, custom vocabulary, and multiple output formats
- 📤 **Multiple Export Formats** - Export transcriptions as TXT, PDF, DOCX, JSON, SRT, or VTT files
- 🔐 **Secure Authentication** - Sign in with Google, GitHub, or email accounts

## 🛠️ Technology Stack

### Frontend Framework
- **React 18** - Modern UI library for building interactive interfaces
- **Vite** - Next-generation frontend build tool for fast development
- **Tailwind CSS** - Utility-first CSS framework for rapid styling

### AI & Machine Learning
- **Rev AI API** - Professional speech-to-text service with enterprise-grade accuracy
- **Cloud Processing** - Secure server-side transcription with 99%+ accuracy
- **Multi-language Support** - Automatic language detection and transcription
- **Speaker Diarization** - Identify and separate different speakers in audio

### Authentication & Security
- **Firebase Auth** - Secure authentication with Google, GitHub, and email providers
- **User Management** - Profile management and session handling
- **Secure API Keys** - Environment-based configuration for API credentials

### Performance & Processing
- **Web Workers** - Background processing for non-blocking API operations
- **HTTP API Integration** - Efficient communication with Rev AI servers
- **Real-time Status Polling** - Live progress updates during transcription. 

### Deployment & Infrastructure
- **Vercel** - Edge deployment platform for optimal global performance
- **Cross-Origin Isolation** - Enabled for SharedArrayBuffer support in Web Workers

## 🧠 How It Works

1. **Audio Upload** - Users upload audio files or record directly through the interface
2. **API Submission** - Audio is securely uploaded to Rev AI's servers for processing
3. **Cloud Processing** - Rev AI's professional models transcribe the audio with high accuracy
4. **Status Monitoring** - Real-time progress updates via API polling
5. **Results Display** - Transcribed text is displayed with timestamps and speaker information
6. **Export Options** - Download results in multiple formats including TXT, PDF, DOCX, JSON, SRT, and VTT

## 🔐 Privacy & Security

- **Secure API Processing** - Audio is processed securely on Rev AI's enterprise servers
- **Professional Standards** - Rev AI follows industry best practices for data security
- **API Key Required** - Users provide their own Rev AI API key for authentication
- **No Data Storage** - Audio files are processed and then deleted from Rev AI servers

## 🌐 Browser Compatibility

- Chrome/Edge 88+ (Recommended)
- Firefox 89+
- Safari 15.4+
- Requires modern browser with Web Workers and Fetch API support

## 📊 API Information

### Speech Recognition
- **Service**: Rev AI Professional Speech-to-Text API
- **Accuracy**: 99%+ transcription accuracy
- **Languages**: 100+ languages supported with automatic detection
- **Features**: Speaker diarization, custom vocabulary, multiple output formats, export options

### Setup Required
- **API Key**: Get your free Rev AI API key at [rev.ai](https://rev.ai)
- **Account**: Free tier includes 5 hours of transcription per month
- **File Limits**: Supports audio files up to 2GB in size

## 📤 Export Formats

The application supports exporting transcriptions in multiple formats:

- **TXT** - Plain text format for simple text extraction
- **JSON** - Structured data with timestamps, speaker information, and metadata
- **SRT** - SubRip subtitle format compatible with video players
- **VTT** - WebVTT format for web video text tracks
- **DOCX** - HTML file that opens in Microsoft Word with formatting
- **PDF** - Portable document format with professional layout

## 🔐 Authentication Setup

The application uses Firebase Authentication for secure user management. To set up authentication:

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication in the Firebase console

### 2. Configure Authentication Providers
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Google and GitHub providers
3. For GitHub, you'll need to create a GitHub OAuth app and add the client ID/secret

### 3. Environment Variables
Create a `.env` file in the project root with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_REVAI_API_KEY=your-revai-api-key-here
```

### 4. Supported Providers
- **Google** - One-click sign-in with Google accounts
- **GitHub** - Sign-in with GitHub accounts
- **Email/Password** - Traditional email authentication (can be added)

---

*Built with ❤️ using React and Rev AI's professional speech recognition service*
