import {MediaStream, mediaDevices} from 'react-native-webrtc';
import {serviceConfig} from '../../ServiceConfig';
import * as events from 'events';
import {timeoutCallback} from './MediaUtils';

export class MediaStreamFactory {
  camEnvDeviceId = null;
  camFrontDeviceId = null;
  micDeviceId = null;
  speakerDeviceId = null;

  updated = null;
  eventEmitter = null;

  constructor() {
    this.updated = false;
    this.eventEmitter = new events.EventEmitter();
    this.updateLocalDeviceInfos();
    mediaDevices.ondevicechange = event => {
      this.updateLocalDeviceInfos();
    };
  }

  waitForUpdate() {
    return new Promise((resolve, reject) => {
      console.log(
        '[Log]  Waiting for MediaStreamFactory to update device info...',
      );
      let returned = false;
      this.eventEmitter.once(
        'localDeviceUpdated',
        timeoutCallback(() => {
          if (returned) return;

          returned = true;
          if (this.updated) {
            console.log('[Log]1  Device info updated');
            resolve();
          } else {
            reject('Device info update failed');
          }
        }, serviceConfig.mediaTimeout),
      );

      if (!returned && this.updated) {
        returned = true;
        console.log('[Log]  Device info updated');
        resolve();
      }
    });
  }

  async updateLocalDeviceInfos() {
    try {
      this.camEnvDeviceId = null;
      this.camFrontDeviceId = null;
      this.micDeviceId = null;
      const devices = await mediaDevices.enumerateDevices();
      devices.forEach(device => {
        let deviceId = device.deviceId;
        switch (device.kind) {
          case 'videoinput':
            if (
              device.facing === 'environment' &&
              this.camEnvDeviceId == null
            ) {
              this.camEnvDeviceId = deviceId;
            } else if (this.camFrontDeviceId == null) {
              this.camFrontDeviceId = deviceId;
            }
            break;
          case 'audioinput':
            if (this.micDeviceId == null) {
              this.micDeviceId = deviceId;
            }
            break;
          case 'audiooutput':
            if (this.speakerDeviceId == null) {
              this.speakerDeviceId = deviceId;
            }
            break;
        }
      });
      this.updated = true;
      this.eventEmitter.emit('localDeviceUpdated');
    } catch (err) {
      console.error(err);
    }
  }

  getCamEnvDeviceId() {
    return this.camEnvDeviceId;
  }

  getCamFrontDeviceId() {
    return this.camFrontDeviceId;
  }

  getMicDeviceId() {
    return this.micDeviceId;
  }

  getSpeakerDeviceId() {
    return this.speakerDeviceId;
  }

  async getCamEnvStream(_width, _height, _frameRate) {
    const constraints = {
      audio: false,
      video: {
        width: _width,
        height: _height,
        frameRate: _frameRate,
        aspectRatio: _width / _height,
        deviceId: this.camEnvDeviceId,
      },
    };

    try {
      return await mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error(err);
      return Promise.reject('Fail to get camera env stream.');
    }
  }

  async getCamFrontStream(_width, _height, _frameRate) {
    const constraints = {
      audio: false,
      video: {
        width: _width,
        height: _height,
        frameRate: _frameRate,
        aspectRatio: _width / _height,
        deviceId: this.camFrontDeviceId,
      },
    };

    try {
      return await mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error(err);
      return Promise.reject('Fail to get camera front stream.');
    }
  }

  async getMicStream() {
    const constraints = {
      audio: {
        deviceId: this.micDeviceId,
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: false,
    };

    try {
      return await mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error(err);
      return Promise.reject('Fail to get camera front stream.');
    }
  }

  async getDisplayStream(_width, _height, _frameRate) {
    const constraints = {
      audio: true,
      video: {
        width: _width,
        height: _height,
        frameRate: _frameRate,
        aspectRatio: _width / _height,
      },
    };
    try {
      return await mediaDevices.getDisplayMedia(constraints);
    } catch (err) {
      console.error(err);
      return Promise.reject('Fail to get display stream.');
    }
  }
}
