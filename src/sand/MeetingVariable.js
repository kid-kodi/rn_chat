import {config_key} from "./Constants";
import { FileService } from "./FileService";
import { MediaService } from "./MediaService";
import { MediaStreamFactory } from "./MediaStreamFactory";
import { SpeechRecognition } from "./SpeechRecognition";

export const MeetingVariable = {
    mediaService: new MediaService(),
    mediaStreamFactory: new MediaStreamFactory(),
    speechRecognition: new SpeechRecognition(),
    fileService: new FileService(),
    messages: [],
    myName: config_key.username,
    room: null,
    hostId: null,
    notes: null,
}