import {config_key} from "./Constants";
import {FileService} from "./core/service/FileService";
import {MediaService} from "./core/service/MediaService";
import {MediaStreamFactory} from "./core/helpers/media/MediaStreamFactory";
// import {SpeechRecognition} from "./corre/helpers/SpeechRecognition";


export const MeetingVariable = {
    mediaService: new MediaService(),
    mediaStreamFactory: new MediaStreamFactory(),
    // speechRecognition: new SpeechRecognition(),
    fileService: new FileService(),
    messages: [],
    myName: config_key.username,
    room: null,
    hostId: null,
    notes: null,
}