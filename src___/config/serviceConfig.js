import {BASE_API_URL, SERVER_IP} from '@env';

const config = {
  // serverIp:  "api.solisalim.com",
  serverIp:  SERVER_IP,
  serverPort: 5000,
  serverUseHttps: false,
};

export const iflytekAPPID = 'YourAPPID';

export const SIMULCASTENCODING = [
  {maxBitrate: 100000},
  {maxBitrate: 300000},
  {maxBitrate: 700000},
];

const _serverURL = (config.serverUseHttps ? 'wss://' : 'http://') + config.serverIp;

export const fileUploadURL = userToken => {
  return `${BASE_API_URL}/api/files?token=${userToken}`;
};

export const meetingURL = (chatId, userId) => {
  return `${serviceConfig.serverURL}/room?chatId=${chatId}&userId=${userId}`;
};

export const roomURL = (userId) => {
  return `${serviceConfig.serverURL}/room?userId=${userId}`;
};

export const avatarURL = avatar => {
  return `${serviceConfig.serverURL}/image/${avatar}`;
};

export const serviceConfig = {
  requestTimeout: 10000,
  connectTimeout: 20000,
  reconnectTimeout: 60000,
  mediaTimeout: 10000,
  allowTimeout: 10000,
  serverIp: config.serverIp,
  serverPort: config.serverPort,
  serverURL: _serverURL,
};

export const SignalType = {
  request: 'request',
  notify: 'notify',
};

export const MediaKind = {
  video: 'video',
  audio: 'audio',
};

export const TransportType = {
  producer: 'producer',
  consumer: 'consumer',
};

export const SignalMethod = {
  getRouterRtpCapabilities: 'getRouterRtpCapabilities',
  join: 'join',
  createTransport: 'createTransport',
  connectTransport: 'connectTransport',
  produce: 'produce',
  produceData: 'produceData',
  consume: 'consume',
  closeProducer: 'closeProducer',
  pauseProducer: 'pauseProducer',
  resumeProducer: 'resumeProducer',
  pauseConsumer: 'pauseConsumer',
  resumeConsumer: 'resumeConsumer',
  newConsumer: 'newConsumer',
  newDataConsumer: 'newDataConsumer',
  newPeer: 'newPeer',
  consumerClosed: 'consumerClosed',
  dataConsumerClosed: 'dataConsumerClosed',
  peerClosed: 'peerClosed',
  closeRoom: 'closeRoom',
  sendText: 'sendText',
  newText: 'newText',
  sendFile: 'sendFile',
  newFile: 'newFile',
  hostChanged: 'hostChanged',
  connectMeeting: 'connectMeeting',
  allowed: 'allowed',
  mute: 'mute',
  restartIce: 'restartIce',
  roomClosed: 'roomClosed',
  transferHost: 'transferHost',
  kick: 'kick',
  kicked: 'kicked',
  beMuted: 'beMuted',
  getStatus: 'getStat',
  sendSpeechText: 'sendSpeechText',
  newSpeechText: 'newSpeechText',
  startRecord: 'startRecord',
  stopRecord: 'stopRecord',
};

export const MeetingEndReason = {
  notAllowed: 'notAllowed',
  lostConnection: 'lostConnection',
  roomClosed: 'roomClosed',
  kicked: 'kicked',
};

export const socketConnectionOptions = {
  // timeout: 3000,
  reconnection: true,
  autoConnect: true,
  reconnectionAttempts: Infinity,
  reconnectionDelayMax: 2000,
  forceNew: true,
  // transports: ['websocket'],
};
