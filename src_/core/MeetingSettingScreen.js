import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {SwitchItem} from './components/Item';
import { setInStorage } from './helpers/StorageUtils';
import { config, config_key } from '../Constants';

export default function MeetingSettingScreen() {
  const [cameraStatus, setCameraStatus] = useState(config_key.camera);
  const [microphoneStatus, setMicrophoneStatus] = useState(config_key.microphone);

  const cameraSwitch = async value => {
    const storeValue = value ? 'true' : 'false';
    config_key.camera = value;
    await setInStorage(config.cameraIndex, storeValue);
    setCameraStatus(value);
  };

  const microphoneSwitch = async value => {
    const storeValue = value ? 'true' : 'false';
    config_key.microphone = value;
    await setInStorage(config.microphoneIndex, storeValue);
    setMicrophoneStatus(value)
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.switchContainer}>
        <SwitchItem
          text={'Caméra'}
          status={cameraStatus}
          switchEvent={cameraSwitch}
        />
      </View>
      <View style={styles.switchContainer}>
        <SwitchItem
          text={'Microphone'}
          status={microphoneStatus}
          switchEvent={microphoneSwitch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    backgroundColor: 'white',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    borderRadius: 10,
  },
});
