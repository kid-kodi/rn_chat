import { createContext, useContext, useState } from 'react';
import { MediaService } from '../service/MediaService';
import { MediaStreamFactory } from '../helpers/media/MediaStreamFactory';
// import { SpeechRecognition } from '../helpers/SpeechRecognition';
import { FileService } from '../service/FileService';

const MeetingContext = createContext();

export default function MeetingProvider({ children }) {
  const [mediaService, setMediaService] = useState(new MediaService())
  const [mediaStreamFactory, setMediaStreamFactory] = useState(new MediaStreamFactory())
  //   const [speechRecognition, setSpeechRecognition] = useState(new SpeechRecognition())
  const [fileService, setFileService] = useState(new FileService())
  const [messages, setMessages] = useState([])
  const [myName, setMyName] = useState("")
  const [room, setRoom] = useState(null)
  const [hostId, setHostId] = useState(null)
  const [notes, setNotes] = useState(null)


  return <MeetingContext.Provider value={{ mediaService, mediaStreamFactory, fileService, messages, myName, room, hostId, notes }}>
    {children}
  </MeetingContext.Provider>;
}

export function useMeeting() {
  return useContext(MeetingContext);
}
