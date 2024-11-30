// Class to hold peers info
export default class Peer {
    constructor(socketId, device) {
      this.socketId = socketId;
      this.device = device;
      this.producers = [];
  
      this.mediaStream = new MediaStream();
      this.sendTransport = undefined;
    }
  
    hasVideo() {
      return Boolean(
        this.producers.find((producer) => producer.kind === "video")
      );
    }
  
    hasAudio() {
      return Boolean(
        this.producers.find((producer) => producer.kind === "audio")
      );
    }
  }
  