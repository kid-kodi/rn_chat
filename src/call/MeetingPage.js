import { View, Text, Animated, StyleSheet, Alert } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Header from './Header';
import Subtitle from './Subtitle';
import Footer from './Footer';
import { MeetingVariable } from '../MeetingVariable';
import { closeMediaStream } from '../core/helpers/media/MediaUtils';
import RNSwitchAudioOutput from 'react-native-switch-audio-output';
import GestureRecognizer from 'react-native-swipe-gestures';
import GridView from './GridView';
import PortraitView from './PortraitView';
import Orientation from 'react-native-orientation-locker';
import { clearMeetingVariable } from '../core/service/MeetingService';
import { MyAlert } from '../core/components/MyAlert';
import { TextButton } from '../core/components/MyButton';
import CheckBox from '@react-native-community/checkbox';
import axiosInstance from '../core/networks/AxiosInstance';
import { goBack } from '../core/helpers/RootNavigation';
import { useUser } from '../core/contexts/UserProvider';

import { useKeepAwake } from '@sayem314/react-native-keep-awake';

export default function MeetingPage({ navigation, route }) {
  useKeepAwake();

  const { cameraStatus, microphoneStatus, chatId } = route.params;

  const { user } = useUser();

  const [barHeight, setBarHeight] = useState(new Animated.Value(0));
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(600);

  const [myCameraStream, setMyCameraStream] = useState(null);
  const [myMicrophoneStream, setMyMicrophoneStream] = useState(null);
  const [myDisplayStream, setMyDisplayStream] = useState(null);
  const [error, setError] = useState(null);
  const [peerDetails, setPeerDetails] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [shareScreen, setShareScreen] = useState(false);
  const [alertError, setAlertError] = useState(false);
  const [hideHeadAndFoot, setHideHeadAndFoot] = useState(false);
  const [frontCam, setFrontCam] = useState(true);
  const [leaveAndClose, setLeaveAndClose] = useState(false);

  const [camStat, setCamStat] = useState(
    cameraStatus === true || cameraStatus === 'true' ? 'on' : 'off',
  );
  const [microStat, setMicroStat] = useState(
    microphoneStatus === true || microphoneStatus === 'true' ? 'on' : 'off',
  );

  const [view, setView] = useState('grid');
  const [audioRoute, setAudioRoute] = useState('Speaker');
  const [portraitIndex, setPortraitIndex] = useState(0);

  const [chatName, setChatName] = useState('');
  const currentChat = useRef();

  const backAction = () => {
    setModalVisible(true);
    return true;
  };

  useEffect(() => {
    (async () => {
      if (!chatId) return;

      const { chat } = await axiosInstance.get(`/api/chats/${chatId}`);

      if (chat) currentChat.current = chat;

      const callee = chat?.users.find(u => u._id !== user._id);
      const _chatName = chat?.isGroupChat ? chat?.chatName : callee?.fullName;
      setChatName(_chatName);
      setView(chat?.isGroupChat ? "grid" : "portrait");


      MeetingVariable.mediaService.registerPeerUpdateListener(
        'peer',
        updatePeerDetails,
      );

      MeetingVariable.mediaService.registerMeetingEndListener(
        'meetingEnd',
        recvEndSignal,
      );
      MeetingVariable.mediaService.registerBeMutedListener(
        'muted',
        mutedByHost,
      );

      Orientation.unlockAllOrientations();
      RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_SPEAKER);

      try {
        await MeetingVariable.mediaService.joinMeeting(
          currentChat?.current._id,
          user,
        );

        await MeetingVariable.mediaStreamFactory.waitForUpdate();

        if (camStat === 'on') {
          await openCamera();
        }
        if (microStat === 'on') {
          await openMicrophone();
        }
      } catch (e) {
        console.log(e)
        toast.show(e, { type: 'danger', duration: 1300, placement: 'top' });
      }
    })();
  }, []);

  const mutedByHost = async () => {
    toast.show("L'hôte vous a mis en sourdine", {
      type: 'warning',
      duration: 1000,
      placement: 'top',
    });
    if (microStat !== 'off') await closeMicrophone();
  };

  const recvEndSignal = message => {
    setAlertError(true);
    setModalVisible(true);
    setError(message);
  };

  const updatePeerDetails = () => {
    MeetingVariable.hostId = MeetingVariable.mediaService.getHostPeerId();
    const newLength = MeetingVariable.mediaService.getPeerDetails().length;
    const newPortraitIndex = portraitIndex >= newLength ? 0 : portraitIndex;

    setPeerDetails(
      newLength === 0 ? null : MeetingVariable.mediaService.getPeerDetails(),
    );

    setPortraitIndex(newPortraitIndex);
  };

  const getMainContainerScale = event => {
    let { width, height } = event.nativeEvent.layout;

    setWidth(width);
    setHeight(height);
  };

  const startRecord = () => {
    MeetingVariable.mediaService.startRecord();
    setIsRecording(true);
  };

  const stopRecord = () => {
    MeetingVariable.mediaService.stopRecord();
    setIsRecording(false);
  };

  const openMicrophone = async () => {
    // MeetingVariable.speechRecognition.start();
    setMicroStat('loading');
    try {
      const micStream = await MeetingVariable.mediaStreamFactory.getMicStream();

      if (micStream.getAudioTracks().length === 0) {
        return Promise.reject('Fail to get local microphone media.');
      }

      setMyMicrophoneStream(micStream);
      setMicroStat('on');

      await MeetingVariable.mediaService.sendMediaStream(micStream);
    } catch (e) {
      toast.show(e, { type: 'danger', duration: 1300, placement: 'top' });
    }
  };

  const closeMicrophone = async () => {
    // MeetingVariable.speechRecognition.stop();
    setMicroStat('loading');
    try {
      if (myMicrophoneStream.getAudioTracks().length === 0) return;
      await MeetingVariable.mediaService.closeTrack(
        myMicrophoneStream.getAudioTracks()[0],
      );
      closeMediaStream(myMicrophoneStream);
      setMyMicrophoneStream(null);
      setMicroStat('off');
    } catch (e) {
      toast.show(e, { type: 'danger', duration: 1300, placement: 'top' });
    }
  };

  const openCamera = async () => {
    if (shareScreen) {
      await closeScreenShare();
      setShareScreen(false);
    }

    setCamStat('loading');

    try {
      if (frontCam) {
        await openFrontCamera();
      } else {
        await openEnvCamera();
      }
    } catch (e) {
      toast.show(e, { type: 'danger', duration: 1300, placement: 'top' });
    }
  };

  const openFrontCamera = async () => {
    const camStream =
      await MeetingVariable.mediaStreamFactory.getCamFrontStream(
        width * 2,
        (height * 3) / 2,
        30,
      );

    if (camStream.getVideoTracks().length === 0) {
      return Promise.reject('Fail to get local camera media.');
    }

    setMyCameraStream(camStream);
    setCamStat('on');

    await MeetingVariable.mediaService.sendMediaStream(camStream);
  };

  const openEnvCamera = async () => {
    const camStream = await MeetingVariable.mediaStreamFactory.getCamEnvStream(
      width * 2,
      (height * 3) / 2,
      30,
    );

    if (camStream.getVideoTracks().length === 0) {
      return Promise.reject('Fail to get local camera media.');
    }

    setMyCameraStream(camStream);
    setCamStat('on');

    await MeetingVariable.mediaService.sendMediaStream(camStream);
  };

  const closeCamera = async () => {
    setCamStat('loading');
    try {
      if (myCameraStream.getVideoTracks().length === 0) return;
      await MeetingVariable.mediaService.closeTrack(
        myCameraStream.getVideoTracks()[0],
      );
      closeMediaStream(myCameraStream);
      setMyCameraStream(null);
      setCamStat('off');
    } catch (e) {
      toast.show(e, { type: 'danger', duration: 1300, placement: 'top' });
    }
  };

  const swapCam = async () => {
    if (camStat === 'on') {
      setFrontCam(!frontCam);
      myCameraStream.getTracks()[0]._switchCamera();
    } else {
      setFrontCam(!frontCam);
    }
  };

  const openScreenShare = async () => {
    if (camStat === 'on') {
      await closeCamera();
      setCamStat('off');
    }
    try {
      const screenStream =
        await MeetingVariable.mediaStreamFactory.getDisplayStream(
          width * 2,
          height * 2,
          30,
        );

      if (screenStream.getVideoTracks().length === 0) {
        return Promise.reject('Fail to get local camera media.');
      }

      setMyDisplayStream(screenStream);
      setShareScreen(true);

      await MeetingVariable.mediaService.sendMediaStream(screenStream);
    } catch (e) {
      toast.show(e, { type: 'danger', duration: 1300, placement: 'top' });
    }
  };

  const closeScreenShare = async () => {
    try {
      if (myDisplayStream.getVideoTracks().length === 0) return;
      await MeetingVariable.mediaService.closeTrack(
        myDisplayStream.getVideoTracks()[0],
      );
      closeMediaStream(myDisplayStream);
      setMyDisplayStream(null);
      setShareScreen(false);
    } catch (e) {
      toast.show(e, { type: 'danger', duration: 1300, placement: 'top' });
    }
  };

  const switchAudioRoute = () => {
    if (audioRoute === 'Speaker') {
      setAudioRoute('Headphone');
      RNSwitchAudioOutput.selectAudioOutput(
        RNSwitchAudioOutput.AUDIO_HEADPHONE,
      );
    } else {
      setAudioRoute('Speaker');
      RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_SPEAKER);
    }
  };

  const openChatRoom = () => {
    // minimizeCall();
    navigation.navigate('CHAT', { chatId });
  };

  const openDocuments = () => {
    // navigation.navigate('MeetingDocument');
  };

  const onSwipeLeft = () => {
    if (view === 'portrait' && peerDetails) {
      if (portraitIndex < peerDetails.length - 1) {
        const oldIndex = portraitIndex;
        peerDetails[oldIndex + 1].subscribe();
        setPortraitIndex(oldIndex + 1);
        peerDetails[oldIndex].unsubscribeVideo();
      }
    }
  };

  const onSwipeRight = () => {
    if (view === 'portrait' && peerDetails) {
      if (portraitIndex > 0) {
        const oldIndex = portraitIndex;
        peerDetails[oldIndex - 1].subscribe();
        setPortraitIndex(oldIndex - 1);
        peerDetails[oldIndex].unsubscribeVideo();
      }
    }
  };

  const turnGridToPortrait = index => {
    setPortraitIndex(index);
    setView('portrait');
  };

  const setHideBar = (value = null) => {
    if (value == null) {
      value = !hideHeadAndFoot;
    }

    if (!value) {
      Animated.timing(barHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(barHeight, {
        toValue: -60,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    setHideHeadAndFoot(value);
  };

  exit = async () => {
    try {
      if (myCameraStream) {
        await closeCamera();
      }
      if (myMicrophoneStream) {
        await closeMicrophone();
      }
      if (myDisplayStream) {
        await closeScreenShare();
      }
      if (MeetingVariable.mediaService) {
        //delete all listeners
        MeetingVariable.mediaService.deletePeerUpdateListener('peer');
        MeetingVariable.mediaService.deleteNewMessageListener(
          'messagesInMeetingPage',
        );
        MeetingVariable.mediaService.deleteMeetingEndListener('meetingEnd');
        MeetingVariable.mediaService.deleteBeMutedListener('muted');

        // await axiosInstance.put(`/api/chats/${chatId}`, {
        //   ongoingCall: null
        // })

        if (leaveAndClose) {
          console.log('CLOSE FOR EVERY ONE');
          await MeetingVariable.mediaService.closeRoom();
        } else {
          await MeetingVariable.mediaService.leaveMeeting();
        }
      }

      clearMeetingVariable();
      goBack();
    } catch (e) {
      toast.show(e, { type: 'danger', duration: 1300, placement: 'top' });
      MeetingVariable.messages = [];
      // CallKeepImpl.endIncomingcallAnswer();
      goBack();
    }
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: '#111111', flexDirection: 'column' }}>
      <MyAlert
        title={
          alertError
            ? "J'ai quitté la réunion"
            : 'Voulez-vous quitter la réunion ?'
        }
        okButton={
          <TextButton
            text={'Bien sûr'}
            pressEvent={async () => {
              await exit();
            }}
            containerStyle={{
              borderColor: 'green',
              borderWidth: 1,
              borderRadius: 5,
            }}
            fontStyle={{ fontSize: 14, color: 'green' }}
          />
        }
        content={alertError ? error : null}
        cancelButton={
          alertError ? null : (
            <TextButton
              text={'Annuler'}
              pressEvent={() => {
                setModalVisible(false);
              }}
              containerStyle={{
                borderColor: 'green',
                borderWidth: 1,
                backgroundColor: 'green',
                borderRadius: 5,
              }}
              fontStyle={{ fontSize: 14, color: 'white' }}
            />
          )
        }
        visible={modalVisible}
        setVisible={value => {
          setModalVisible(value);
        }}
        otherComponent={
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Text>Quitter et mettre fin à la réunion</Text>
            <CheckBox
              value={leaveAndClose}
              tintColors={{ true: 'green' }}
              onValueChange={value => {
                setLeaveAndClose(value);
              }}
            />
          </View>
        }
        backEvent={
          alertError
            ? async () => {
              await exit();
            }
            : () => {
              setModalVisible(false);
            }
        }
      />

      <Animated.View
        style={[screenStyle.header, { top: barHeight, width: width }]}>
        <Header roomInf={chatName} exit={backAction} />
      </Animated.View>
      <View style={{ flex: 1 }} onLayout={getMainContainerScale}>
        {showSubtitle && (
          <Subtitle maxHeight={height / 2} maxWidth={width * 0.7} />
        )}

        <GestureRecognizer
          onSwipeLeft={() => onSwipeLeft()}
          onSwipeRight={() => onSwipeRight()}
          config={{
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80,
          }}
          style={{ flex: 1, zIndex: 10 }}>
          {view === 'grid' ? (
            <GridView
              myStream={shareScreen ? myDisplayStream : myCameraStream}
              myFrontCam={frontCam}
              shareScreen={shareScreen}
              peerDetails={peerDetails}
              turnPortrait={turnGridToPortrait}
              setHideBar={setHideBar}
            />
          ) : (
            <PortraitView
              width={width}
              height={height}
              myStream={shareScreen ? myDisplayStream : myCameraStream}
              myFrontCam={frontCam}
              shareScreen={shareScreen}
              peerToShow={peerDetails ? peerDetails[portraitIndex] : null}
              peerAudio={
                peerDetails ? peerDetails[portraitIndex]?.hasAudio() : false
              }
              peerVideo={
                peerDetails ? peerDetails[portraitIndex]?.hasVideo() : false
              }
              setHideBar={setHideBar}
            />
          )}
        </GestureRecognizer>
      </View>
      <Animated.View
        style={[screenStyle.footer, { bottom: barHeight, width: width }]}>
        <Footer
          startRecord={startRecord}
          stopRecord={stopRecord}
          isRecording={isRecording}
          openCamera={openCamera}
          closeCamera={closeCamera}
          openMicro={openMicrophone}
          closeMicro={closeMicrophone}
          openScreenShare={openScreenShare}
          closeScreenShare={closeScreenShare}
          openChatRoom={openChatRoom}
          openDocuments={openDocuments}
          frontCam={frontCam}
          shareScreen={shareScreen}
          swapCam={swapCam}
          microStat={microStat}
          camStat={camStat}
          view={view}
          setView={type => {
            setView(type);
          }}
          showSubtitle={showSubtitle}
          setShowSubtitle={value => {
            setShowSubtitle(value);
          }}
          audioStatus={audioRoute}
          switchAudioRoute={switchAudioRoute}
        />
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
