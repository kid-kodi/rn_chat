import {View, Text, Animated, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';

import GestureRecognizer from 'react-native-swipe-gestures';

import Header from './Header';
import Footer from './Footer';
import GridView from './GridView';
import PortraitView from './PortraitView';

export default function SandScreen({route}) {
  const [viewState, setViewState] = useState({
    view: 'grid',
    peerDetails: null,
    portraitIndex: 0,
    myCameraStream: null,
    myDisplayStream: null,
    myMicrophoneStream: null,
    width: 300,
    height: 600,
    frontCam: true,
    shareScreen: false,
    microStat: 'off',
    camStat: 'off',
    modalVisible: false,
    alertError: false,
    leaveAndClose: false,
    showSubtitle: false,
    hideHeadAndFoot: false,
    audioRoute: 'Speaker',
    subtitleContents: null,
  });
  const [roomInf, setRoomInf] = useState({
    topic: 'Topic 1',
    id: 'Id 1',
    start_time: new Date(),
    end_time: new Date(),
  });

  const backAction = () => {};

  getMainContainerScale = event => {
    let {width, height} = event.nativeEvent.layout;
    setViewState({
      width: width,
      height: height,
    });
  };

  const onSwipeLeft = () => {};
  const onSwipeRight = () => {};
  const turnGridToPortrait = () => {};
  const setHideBar = () => {};


  useEffect(() =>{
    (async () => {

      const {cameraStatus=true, microphoneStatus=true} = route.params;
      // this.handleBack();
      Orientation.unlockAllOrientations();
      // RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_SPEAKER);
  
      try {
          // await MeetingVariable.mediaService.joinMeeting(this.props.route.params.roomInf.token, config_key.token, config_key.userId, // config_key.userId.toString(),
          //     MeetingVariable.myName, `${MeetingVariable.myName}'s mobile device`, config_key.avatarUri);
  
          await MeetingVariable.mediaService.joinMeeting(route.params.roomInf.token, config_key.token, config_key.userId, // config_key.userId.toString(),
              MeetingVariable.myName, `${MeetingVariable.myName}'s mobile device`, config_key.avatarUri);
          
          await MeetingVariable.mediaStreamFactory.waitForUpdate();
          if (cameraStatus) {
              await this.openCamera();
          }
          if (microphoneStatus) {
              await this.openMicrophone();
          }
      } catch (e) {
          // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
      }
    })()
  }, []);

  return (
    <View
      style={{flex: 1, backgroundColor: '#111111', flexDirection: 'column'}}>
      <Animated.View style={[screenStyle.header, {top: 0, width: '100%'}]}>
        <Header roomInf={roomInf} exit={backAction} />
      </Animated.View>
      <View style={{flex: 1}} onLayout={getMainContainerScale}>
        <GestureRecognizer
          onSwipeLeft={() => onSwipeLeft()}
          onSwipeRight={() => onSwipeRight()}
          config={{
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80,
          }}
          style={{flex: 1, zIndex: 10}}>
          {viewState.view === 'grid' ? (
            <GridView
              myStream={
                viewState.shareScreen
                  ? viewState.myDisplayStream
                  : viewState.myCameraStream
              }
              myFrontCam={viewState.frontCam}
              shareScreen={viewState.shareScreen}
              peerDetails={viewState.peerDetails}
              turnPortrait={turnGridToPortrait}
              setHideBar={setHideBar}
            />
          ) : (
            <PortraitView
              width={viewState.width}
              height={viewState.height}
              myStream={viewState.shareScreen ? viewState.myDisplayStream : viewState.myCameraStream}
              myFrontCam={viewState.frontCam}
              shareScreen={viewState.shareScreen}
              peerToShow={viewState.peerDetails ? viewState.peerDetails[viewState.portraitIndex] : null}
              peerAudio={
                viewState.peerDetails ? viewState.peerDetails[viewState.portraitIndex].hasAudio() : false
              }
              peerVideo={
                viewState.peerDetails ? viewState.peerDetails[viewState.portraitIndex].hasVideo() : false
              }
              setHideBar={setHideBar}
            />
          )}
        </GestureRecognizer>
      </View>
      <Animated.View style={[screenStyle.footer, {bottom: 0, width: '100%'}]}>
        <Footer />
      </Animated.View>
    </View>
  );
}

const screenStyle = StyleSheet.create({
  header: {
    position: 'absolute',
    backgroundColor: '#27272766',
    flexDirection: 'row',
    height: 60,
    left: 0,
    zIndex: 20,
  },
  footer: {
    position: 'absolute',
    height: 60,
    backgroundColor: '#27272766',
    flexDirection: 'row',
    alignSelf: 'flex-end',
    left: 0,
    zIndex: 20,
  },
});
