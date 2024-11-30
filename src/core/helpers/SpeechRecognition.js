// import {Recognizer} from 'react-native-speech-iflytek';
import {NativeEventEmitter} from 'react-native';
import {iflytekAPPID} from '../../ServiceConfig';
import {SpeechText} from './Types';
import {config_key} from '../../Constants';
import {MeetingVariable} from '../../MeetingVariable';
// @ts-ignore
import moment from 'moment';

// Recognizer.init(iflytekAPPID);

const me = 'Moi';

export class SpeechRecognition {
  // recognizerEventEmitter = new NativeEventEmitter(Recognizer);
  recognizerEventEmitter = new NativeEventEmitter();
  working = null;
  sentenceEnded = null;
  currentSpeechTimestamp = null;
  speechCallbacks = null;
  speechTextStorage = null;
  // fromPeerId ==> SpeechText
  speakingSpeechTexts = null;

  constructor() {
    this.speechCallbacks = new Map();
    this.speechTextStorage = [];
    this.speakingSpeechTexts = new Map();
    this.recognizerEventEmitter.addListener(
      'onRecognizerResult',
      this.onRecognizerResult,
    );
    this.recognizerEventEmitter.addListener('onRecognizerError', err => {
      console.error(err);
    });
    this.working = false;
    this.sentenceEnded = true;
  }

  registerSpeechListener(key, recognizedCallback) {
    this.speechCallbacks.set(key, recognizedCallback);
  }

  deleteSpeechListener(key) {
    this.speechCallbacks.delete(key);
  }

  onRecognizerResult = recognized => {
    const pendingText = recognized.text.trim();
    if (pendingText.length === 0) return;

    console.log(`[Recognizer]  Recognized speech: ${pendingText}`);

    let updateTime = moment();
    if (this.sentenceEnded) {
      this.currentSpeechTimestamp = updateTime;
    }
    const speechText = {
      fromPeerId: config_key.userId,
      displayName: MeetingVariable.myName,
      fromMyself: true,
      newSentence: this.sentenceEnded,
      sentenceEnded: recognized.isLast,
      text: recognized.result,
      startTime: this.currentSpeechTimestamp,
      updateTime: updateTime,
    };
    this.sentenceEnded = recognized.isLast;

    SpeechRecognition.sendSpeechText(speechText);
    this.newSpeechText(speechText);

    if (recognized.isLast) {
      console.log('[Recognizer]  Sentence ended');
      if (this.working) {
        // Recognizer.start();
      }
    }
  };

  static sendSpeechText(text) {
    MeetingVariable.mediaService.sendSpeechText(text);
  }

  recvPeerSpeech(speechText) {
    if (speechText.fromPeerId !== config_key.userId) {
      speechText.fromMyself = false;
      speechText.startTime = moment(speechText.startTime);
      speechText.updateTime = moment(speechText.updateTime);
      this.newSpeechText(speechText);
    }
  }

  newSpeechText(speechText) {
    if (speechText.newSentence) {
      if (this.speakingSpeechTexts.has(speechText.fromPeerId)) {
        const previous = this.speakingSpeechTexts.get(speechText.fromPeerId);
        this.speechTextStorage.push(previous);
      }
    }
    this.speakingSpeechTexts.set(speechText.fromPeerId, speechText);
    if (speechText.sentenceEnded) {
      setTimeout(() => {
        if (
          this.speakingSpeechTexts.has(speechText.fromPeerId) &&
          this.speakingSpeechTexts
            .get(speechText.fromPeerId)
            .startTime.diff(speechText.startTime) === 0
        ) {
          const previous = this.speakingSpeechTexts.get(speechText.fromPeerId);
          this.speechTextStorage.push(previous);
          this.speakingSpeechTexts.delete(speechText.fromPeerId);

          const displayText = this.generateDisplayText();
          this.speechCallbacks.forEach(callback => {
            callback(displayText);
          });
        }
      }, 2000);
    }

    const displayText = this.generateDisplayText();
    this.speechCallbacks.forEach(callback => {
      callback(displayText);
    });
  }

  generateDisplayText() {
    let displayText = '';
    const currentTime = moment();
    this.speakingSpeechTexts.forEach(speechText => {
      if (currentTime.diff(speechText.updateTime) <= 6000) {
        displayText += `${
          speechText.fromMyself ? me : speechText.displayName
        }: ${speechText.text}\n`;
      }
    });
    console.log('[Recognizer]  Subtitles updated:\n' + displayText);
    return displayText;
  }

  exportMeme() {
    let speechTexts = [];
    let meme = '';
    this.speechTextStorage.forEach(speechText => {
      speechTexts.push(speechText);
    });
    this.speakingSpeechTexts.forEach(speechText => {
      speechTexts.push(speechText);
    });
    speechTexts.sort((a, b) => {
      return a.startTime.diff(b.startTime);
    });
    speechTexts.forEach(speechText => {
      meme += `${speechText.startTime.format('hh:mm:ss a')}  ${
        speechText.displayName
      }: ${speechText.text}\n`;
    });
    return meme;
  }

  start() {
    this.working = true;
    // Recognizer.start();
    console.log('[Recognizer]  Started');
  }

  stop() {
    this.working = false;
    // Recognizer.stop();
    console.log('[Recognizer]  Stopped');
  }

  clear() {
    if (this.working) {
      // Recognizer.stop();
    }
    this.speakingSpeechTexts.clear();
    this.speechTextStorage = [];
  }
}
