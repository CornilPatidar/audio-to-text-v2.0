import React from 'react'
import React, { useState, useRef, useEffect } from 'react'

//Components
import HomePage from './components/HomePage'
import Header from './components/Header'
import FileDisplay from './components/FileDisplay.jsx'
import Information from './components/Information'
import Transcribing from './components/Transcribing'
import { MessageType } from './utils/presets'


function App() {

  const [file,setFile] = useState(null) //audio file chosen by user
  const [audioStream,setAudioStream] = useState(null) //live recording blob
  const [output,setOutput] = useState(null) //output text from the audio
  const [downloading,setDownloading] = useState(false) //downloading state
  const [loading,setLoading] = useState(false) //transcription in progress
  const [finished,setFinished] = useState(false) //transcription finished

  const isAudioAvailable = file || audioStream //check if audio is available

  function handleAudioReset(){
    setFile(null)
    setAudioStream(null)
  }

  const worker = useRef(null) //worker ref
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./utils/whisper.worker', import.meta.url), {
        type: 'module'
      })
    }
  
    const onMessageReceived = async (e) => {
      switch (e.data.type) {
        case 'DOWNLOADING':
          setDownloading(true)
          break
        case 'LOADING':
          setLoading(true)
          break
        case 'RESULT':
          setOutput(e.data.results)
          break
        case 'INFERENCE_DONE':
          setFinished(true)
          break
      }
    }
  
    worker.current.addEventListener('message', onMessageReceived) 
  
    return () => worker.current.removeEventListener('message', onMessageReceived)
  }, [])

  //We need to decode audio into raw waveform for Whisper.
  async function readAudioFrom(file) {
    const sampling_rate = 16000
    const audioCTX = new AudioContext({ sampleRate: sampling_rate })
    const response = await file.arrayBuffer()
    const decoded = await audioCTX.decodeAudioData(response)
    const audio = decoded.getChannelData(0)
    return audio
  }
  
  async function handleFormSubmission(){
    if(!file && !audioStream) return

    let audio = await readAudioFrom(file ? file : audioStream)
    const model_name = 'openai/whisper-tiny.en'

    worker.current.postMessage({
      type: MessageType.INTERFERENCE_REQUEST,
      audio,
      model_name
    })
  }


  return (
    <div className='flex flex-col max-w-[1000px] mx-auto w-full'>
      <section className='min-h-screen flex flex-col'>
        <Header />
        {output ? (
          <Information output={output} finished={finished} />
        ) : loading ? (
          <Transcribing />
        ) : isAudioAvailable ? (
          <FileDisplay
            handleFormSubmission={handleFormSubmission}
            handleAudioReset={handleAudioReset}
            file={file}
            audioStream={audioStream}
          />
        ) : (
          <HomePage setFile={setFile} setAudioStream={setAudioStream} />
        )}
      </section>
      <footer></footer>
    </div>
  )

}


export default App
