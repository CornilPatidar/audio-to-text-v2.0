# Audio-to-Text v2.0

🎤 **Live Demo**: [https://audio-to-text-v2-0.vercel.app/](https://audio-to-text-v2-0.vercel.app/)

A modern, client-side audio transcription and translation application powered by AI. Transform your audio files into text and translate them into different languages - all running directly in your browser with no server processing required.

## ✨ Features

- 🎯 **Real-time Audio Transcription** - Convert speech to text using state-of-the-art AI models
- 🌍 **Multi-language Translation** - Translate transcribed text between multiple languages
- 🔒 **100% Client-Side Processing** - Your audio never leaves your device for maximum privacy
- ⚡ **No Server Required** - All AI processing happens in your browser using Web Workers
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🚀 **Fast & Efficient** - Optimized performance with progressive loading

## 🛠️ Technology Stack

### Frontend Framework
- **React 18** - Modern UI library for building interactive interfaces
- **Vite** - Next-generation frontend build tool for fast development
- **Tailwind CSS** - Utility-first CSS framework for rapid styling

### AI & Machine Learning
- **🤗 Transformers.js** - Client-side machine learning library by Hugging Face
- **OpenAI Whisper Models** - State-of-the-art speech recognition models
  - `whisper-tiny.en` - Optimized for English transcription
- **Meta NLLB Models** - No Language Left Behind translation models
  - `nllb-200-distilled-600M` - Multilingual translation support

### Performance & Processing
- **Web Workers** - Background processing for non-blocking AI operations
- **ONNX Runtime** - Optimized inference engine for machine learning models
- **Progressive Model Loading** - Smart fallback system across multiple model sources

### Deployment & Infrastructure
- **Vercel** - Edge deployment platform for optimal global performance
- **Cross-Origin Isolation** - Enabled for SharedArrayBuffer support in Web Workers

## 🧠 How It Works

1. **Audio Upload** - Users upload audio files through the intuitive interface
2. **Client-Side Processing** - Audio is processed locally using Web Workers to prevent UI blocking
3. **AI Transcription** - Whisper models convert speech to text with high accuracy
4. **Translation (Optional)** - NLLB models translate text between supported languages
5. **Results Display** - Transcribed and translated text is displayed with timestamps

## 🔐 Privacy & Security

- **Zero Data Collection** - No audio files or transcriptions are sent to external servers
- **Local Processing** - All AI computations happen directly in your browser
- **No Account Required** - Use the application immediately without registration
- **Secure Headers** - CORS and security headers properly configured

## 🌐 Browser Compatibility

- Chrome/Edge 88+ (Recommended)
- Firefox 89+
- Safari 15.4+
- Requires modern browser with Web Workers and SharedArrayBuffer support

## 📊 Model Information

### Speech Recognition
- **Primary**: OpenAI Whisper Tiny English model
- **Fallbacks**: Multiple model sources for reliability
- **Language**: Optimized for English speech recognition
- **Accuracy**: High-quality transcription with timestamp support

### Translation
- **Model**: Meta's NLLB-200 Distilled (600M parameters)
- **Languages**: 200+ language pairs supported
- **Quality**: State-of-the-art neural machine translation

---

*Built with ❤️ using cutting-edge web technologies and AI models*
