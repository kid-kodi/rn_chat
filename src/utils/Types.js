// import {types as mediasoupTypes} from 'mediasoup-client';
// import {MediaKind, TransportType} from '../ServiceConfig';
// import {Moment} from 'moment';
// import {SctpStreamParameters} from 'mediasoup-client/lib/SctpParameters';

// export const JoinRequest = {
//   displayName: string,
//   joined: boolean,
//   device: string,
//   rtpCapabilities: mediasoupTypes.RtpCapabilities,
// };

// export const CreateTransportRequest = {
//   transportType: TransportType,
//   sctpCapabilities: mediasoupTypes.SctpCapabilities,
// };

// export const ConnectTransportRequest = {
//   transportId: string,
//   dtlsParameters: mediasoupTypes.DtlsParameters,
// };

// export const PeerInfo = {
//   id: number,
//   avatar: string,
//   displayName: string,
//   device: string,
// };

// export const ConsumerInfo = {
//   producerPeerId: number,
//   consumerId: string,
//   producerId: string,
//   kind: MediaKind,
//   rtpParameters: mediasoupTypes.RtpParameters,
// };

// export const ConsumerDetail = {
//   consumerInfo: ConsumerInfo,
//   consumer: mediasoupTypes.Consumer,
//   track: MediaStreamTrack,
// };

// export const DataConsumerInfo = {
//   producerPeerId: number,
//   dataProducerId: string,
//   dataConsumerId: string,
//   sctpParameters: SctpStreamParameters,
//   protocol: string,
//   label: string,
// };

// export const SendText = {
//   toPeerId: number,
//   text: string,
//   timestamp: Moment,
// };

// export const RecvText = {
//   fromPeerId: number,
//   broadcast: boolean,
//   text: string,
//   timestamp: Moment,
// };

// export const SendFile = {
//   fileURL: string,
//   timestamp: Moment,
//   filename: string,
//   fileType: string,
// };

// export const RecvFile = {
//   fromPeerId: number,
//   fileURL: string,
//   timestamp: Moment,
//   filename: string,
//   fileType: string,
// };

export const MessageType = {
  file: 'file',
  text: 'text',
};

export const FileJobType = {
  upload: 'upload',
  download: 'upload',
};

export const FileJobStatus = {
  progressing: 'progressing',
  completed: 'completed',
  failed: 'failed',
  unDownloaded: 'unDownloaded',
};

// export const FileJob = {
//   status: FileJobStatus,
//   totalBytes: number,
//   bytesSent: number,
//   filePath: string,
// };

// export const FileInfo = {
//   uri: string,
//   path: string,
//   name: string,
//   type: string,
//   size: number,
// };

// export const Message = {
//   type: MessageType,
//   timestamp: Moment,
//   fromMyself: boolean,
//   fromPeerId: number,
//   broadcast: boolean,
//   text: string,
//   fileJobType: FileJobType,
//   fileURL: string,
//   filename: string,
//   fileType: string,
//   fileJobStatus: FileJobStatus,
//   totalBytes: number,
//   bytesSent: number,
//   filePath: string,
// };

// export const SpeechText = {
//   newSentence: boolean,
//   sentenceEnded: boolean,
//   startTime: Moment,
//   updateTime: Moment,
//   fromMyself: boolean,
//   fromPeerId: number,
//   displayName: string,
//   text: string,
// };
