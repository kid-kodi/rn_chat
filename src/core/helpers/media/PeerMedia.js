import {types as mediasoupTypes} from 'mediasoup-client';
import {config} from '../../../Constants';

const defaultPeerInfo = {
  id: 0,
  avatar: config.unKnownUri,
  displayName: 'defaultUser',
  device: 'defaultDevice',
};

class PeerDetail {
  _hasAudio = null;
  _hasVideo = null;
  peerId = null;
  peerInfo = null;
  // consumerId ==> Consumer
  consumers = null;
  constructor(peerId) {
    this.peerId = peerId;
    this._hasAudio = false;
    this._hasVideo = false;
    this.consumers = new Map();
  }

  setPeerInfo(peerInfo) {
    this.peerInfo = peerInfo;
  }

  addConsumer(consumer) {
    this.consumers.set(consumer.id, consumer);

    if (consumer.kind === 'audio') this._hasAudio = true;
    else if (consumer.kind === 'video') this._hasVideo = true;
  }

  deleteConsumer(consumerId) {
    if (this.consumers.has(consumerId)) {
      if (!this.consumers.get(consumerId).closed) {
        this.consumers.get(consumerId).close();
      }
      this.consumers.delete(consumerId);
    }

    this.updateMediaStatus();
  }

  getConsumerIds() {
    const consumerIds = [];
    this.consumers.forEach((consumer, consumerId) => {
      consumerIds.push(consumerId);
    });
    return consumerIds;
  }

  getPeerInfo() {
    if (this.peerInfo) return this.peerInfo;
    else {
      const peerInfo = defaultPeerInfo;
      peerInfo.id = this.peerId;
      return peerInfo;
    }
  }

  getTracks() {
    const tracks = [];
    this.consumers.forEach(consumer => {
      if (consumer.paused) {
        consumer.emit('resume');
        consumer.resume();
      }
      tracks.push(consumer.track);
    });
    return tracks;
  }

  getVideoTracks() {
    const tracks = [];
    this.consumers.forEach(consumer => {
      if (consumer.kind === 'video') {
        if (consumer.paused) {
          consumer.emit('resume');
          consumer.resume();
        }
        tracks.push(consumer.track);
      }
    });
    return tracks;
  }

  getAudioTracks() {
    const tracks = [];
    this.consumers.forEach(consumer => {
      if (consumer.kind === 'audio') {
        if (consumer.paused) {
          consumer.emit('resume');
          consumer.resume();
        }
        tracks.push(consumer.track);
      }
    });
    return tracks;
  }

  subscribe() {
    this.consumers.forEach(consumer => {
      if (consumer.paused) {
        consumer.emit('resume');
        consumer.resume();
      }
    });
  }

  unsubscribeVideo() {
    this.consumers.forEach(consumer => {
      if (consumer.kind === 'video') {
        if (!consumer.paused) {
          consumer.emit('pause');
          consumer.pause();
        }
      }
    });
  }

  hasVideo() {
    return this._hasVideo;
  }

  hasAudio() {
    return this._hasAudio;
  }

  clearConsumers() {
    this.consumers.forEach(consumer => {
      if (!consumer.closed) {
        consumer.close();
      }
    });
    this.consumers.clear();
  }

  updateMediaStatus() {
    this._hasAudio = false;
    this._hasVideo = false;
    this.consumers.forEach(consumer => {
      if (consumer.kind === 'video') this._hasVideo = true;
      else if (consumer.kind === 'audio') this._hasAudio = true;
    });
  }
}

export class PeerMedia {
  // peerId ==> PeerDetail
  peerId2Details = null;
  consumerId2Details = null;

  constructor() {
    this.peerId2Details = new Map();
    this.consumerId2Details = new Map();
  }

  addPeerInfo(peerInfo) {
    const peerId = peerInfo.id;
    if (this.peerId2Details.has(peerId)) {
      this.peerId2Details.get(peerId).setPeerInfo(peerInfo);
    } else {
      const peerDetail = new PeerDetail(peerId);
      peerDetail.setPeerInfo(peerInfo);
      this.peerId2Details.set(peerId, peerDetail);
    }
  }

  addConsumer(peerId, consumer) {
    if (this.consumerId2Details.has(consumer.id)) return;

    if (this.peerId2Details.has(peerId)) {
      const peerDetail = this.peerId2Details.get(peerId);
      peerDetail.addConsumer(consumer);
      this.consumerId2Details.set(consumer.id, peerDetail);
    } else {
      const peerDetail = new PeerDetail(peerId);
      peerDetail.addConsumer(consumer);
      this.peerId2Details.set(peerId, peerDetail);
      this.consumerId2Details.set(consumer.id, peerDetail);
    }
  }

  deleteConsumer(consumerId) {
    if (this.consumerId2Details.has(consumerId)) {
      this.consumerId2Details.get(consumerId).deleteConsumer(consumerId);
    }
  }

  deletePeer(peerId) {
    if (!this.peerId2Details.has(peerId)) return;

    const peerDetail = this.peerId2Details.get(peerId);

    const consumerIds = peerDetail.getConsumerIds();
    consumerIds.forEach(consumerId => {
      this.consumerId2Details.delete(consumerId);
    });

    peerDetail.clearConsumers();
    this.peerId2Details.delete(peerId);
  }

  getPeerDetails() {
    const peerDetails = [];
    this.peerId2Details.forEach(peerDetail => {
      peerDetails.push(peerDetail);
    });
    return peerDetails;
  }

  clear() {
    this.peerId2Details.forEach(peerDetail => {
      peerDetail.clearConsumers();
    });
    this.peerId2Details.clear();
    this.consumerId2Details.clear();
  }

  getPeerDetailByPeerId(peerId) {
    return this.peerId2Details.get(peerId);
  }
}
