import * as React from 'react';
import {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {SwitchItem} from '../core/components/Item';
import {config, config_key} from '../core/Constants';
import {setInStorage} from '../core/utils/StorageUtils';

const styles = StyleSheet.create({
  switchContainer: {
    backgroundColor: 'white',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    borderRadius: 10,
  },
});

export default class MeetingSettingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraStatus: config_key.camera,
      microphoneStatus: config_key.microphone,
    };
  }

  cameraSwitch = async value => {
    const storeValue = value ? 'true' : 'false';
    config_key.camera = value;
    await setInStorage(config.cameraIndex, storeValue);
    this.setState({
      cameraStatus: value,
    });
  };

  microphoneSwitch = async value => {
    const storeValue = value ? 'true' : 'false';
    config_key.microphone = value;
    await setInStorage(config.microphoneIndex, storeValue);
    this.setState({
      microphoneStatus: value,
    });
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={styles.switchContainer}>
          <SwitchItem
            text={'Caméra'}
            status={this.state.cameraStatus}
            switchEvent={this.cameraSwitch}
          />
        </View>
        <View style={styles.switchContainer}>
          <SwitchItem
            text={'Microphone'}
            status={this.state.microphoneStatus}
            switchEvent={this.microphoneSwitch}
          />
        </View>
      </View>
    );
  }
}
