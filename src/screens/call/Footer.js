import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MeetingVariable } from '../../MeetingVariable';
import { IconWithLabel } from '../../components/IconWithLabel';
import { HostMenu, ParticipantsMenu } from '../../components/ParticipantsMenu';
import Orientation from 'react-native-orientation-locker';
import { preventDoubleClick } from '../../utils/Utility';
import IconContainer from '../../components/IconContainer';
import Ionicons from "react-native-vector-icons/Ionicons";

const microInf = {
  isCalled: false,
  timer: null,
},
  camInf = {
    isCalled: false,
    timer: null,
  },
  shareScreenInf = {
    isCalled: false,
    timer: null,
  };


export default Footer = ({
  view,
  setView,
  swapCam,
  openChatRoom,
  shareScreen,
  openCamera,
  openDocuments,
  closeCamera,
  openMicro,
  closeMicro,
  frontCam,
  camStat,
  microStat,
  openScreenShare,
  closeScreenShare,
  showSubtitle,
  setShowSubtitle,
  audioStatus,
  switchAudioRoute,
  startRecord,
  stopRecord,
  isRecording,
  stopCall
}) => {
  const footerStyle = StyleSheet.create({
    wholeContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 7
    },
  });

  const menuStyle = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-around',
      height: 60,
    },
    progress: {
      margin: 5,
    },
    outerContainer: {
      flexDirection: 'column',
    },
  });

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [hostVisible, setHostVisible] = useState(false);
  const [orientationLock, setOrientationLock] = useState(false);
  const [newMessage, setNewMessage] = useState(false);

  useEffect(() => {
    MeetingVariable.mediaService.registerNewMessageListener(
      'messagesInMeetingPage',
      recvNewMessage,
    );
  }, []);

  const recvNewMessage = message => {
    message.peerInfo = MeetingVariable.mediaService
      .getPeerDetailByPeerId(message.fromPeerId)
      .getPeerInfo();
    message.fromMyself = false;
    console.log(message);
    MeetingVariable.messages.push(message);
    setNewMessage(true);
  };

  const microEvent = () => {
    if (microStat === 'loading') {
      return;
    }

    if (microStat === 'on') {
      closeMicro();
    } else {
      openMicro();
    }
  };

  const camEvent = () => {
    if (camStat === 'loading') {
      return;
    }

    if (camStat === 'on') {
      closeCamera();
    } else {
      openCamera();
    }
  };

  const shareScreenEvent = () => {
    if (shareScreen) {
      closeScreenShare();
    } else {
      openScreenShare();
    }
  };

  return (
    <View style={[footerStyle.wholeContainer]}>
      <IconContainer
        style={{
          borderWidth: 1.5,
          borderColor: "#2B3034",
        }}
        onPress={() => {
          setSettingsVisible(true);
        }}
        backgroundColor="transparent"
        Icon={() => {
          return <Ionicons
            name="ellipsis-horizontal"
            color="#fff"
            size={26} />;
        }}
      />

      <IconContainer
        style={{
          borderWidth: 1.5,
          borderColor: "#2B3034",
        }}
        onPress={() => {
          preventDoubleClick(camEvent, camInf);
        }}
        backgroundColor={camStat === 'on' ? "#fff" : "transparent"}
        Icon={() => {
          return <Ionicons
            name={camStat === 'on' ? 'videocam' : 'videocam-off'}
            color={camStat === 'on' ? "#000" : "#fff"}
            size={26} />;
        }}
      />

      <IconContainer
        style={{
          borderWidth: 1.5,
          borderColor: "#2B3034",
        }}
        onPress={switchAudioRoute}
        backgroundColor={audioStatus === 'Speaker' ? "#fff" : "transparent"}
        Icon={() => {
          return <Ionicons
            name={audioStatus === 'Speaker' ? 'volume-high' : 'volume-mute'}
            color={audioStatus === 'Speaker' ? "#000" : "#fff"}
            size={26} />;
        }}
      />

      <IconContainer
        style={{
          borderWidth: 1.5,
          borderColor: "#2B3034",
        }}
        onPress={() => {
          preventDoubleClick(microEvent, microInf);
        }}
        backgroundColor={microStat === 'on' ? "#fff" : "transparent"}
        Icon={() => {
          return <Ionicons
            name={microStat === 'on' ? 'mic' : 'mic-off'}
            color={microStat === 'on' ? "#000" : "#fff"}
            size={26} />;
        }}
      />

      <IconContainer
        backgroundColor={"red"}
        onPress={stopCall}
        Icon={() => {
          return <Ionicons name="call" color="#fff" size={26} style={{ transform: [{ rotate: '135deg' }] }} />;
        }}
      />

      <Modal
        animationType={'slide'}
        visible={participantsVisible}
        transparent={true}
        onRequestClose={() => {
          setParticipantsVisible(false);
        }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              setParticipantsVisible(false);
            }}
          />
          <ParticipantsMenu
            myCamStat={camStat === 'on'}
            myMicStat={microStat === 'on'}
          />
        </View>
      </Modal>
      <Modal
        animationType={'slide'}
        visible={hostVisible}
        transparent={true}
        onRequestClose={() => {
          setHostVisible(false);
        }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              setHostVisible(false);
            }}
          />
          <HostMenu />
        </View>
      </Modal>
      <Modal
        animationType={'fade'}
        visible={settingsVisible}
        transparent={true}
        onRequestClose={() => {
          setSettingsVisible(false);
        }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              setSettingsVisible(false);
            }}
          />
          <View style={menuStyle.outerContainer}>
            <View style={[menuStyle.container]}>
              <IconWithLabel
                iconName={view === 'grid' ? 'tablet-portrait' : 'grid'}
                color={'black'}
                text={view === 'grid' ? 'Portrait' : 'Grille'}
                pressEvent={() => {
                  if (view === 'grid') {
                    setView('portrait');
                  } else if (view === 'portrait') {
                    setView('grid');
                  }
                }}
              />
              <IconWithLabel
                iconName={'text'}
                color={'black'}
                text={showSubtitle ? 'Pas de sous-titres' : 'Sous-titres'}
                pressEvent={() => {
                  setShowSubtitle(!showSubtitle);
                }}
              />
              <IconWithLabel
                text={'Rotation'}
                color={'black'}
                iconName={
                  orientationLock ? 'sync-circle-outline' : 'sync-circle'
                }
                pressEvent={() => {
                  if (orientationLock) {
                    Orientation.unlockAllOrientations();
                  } else {
                    Orientation.getOrientation(orientation => {
                      switch (orientation) {
                        case 'LANDSCAPE-LEFT':
                          Orientation.lockToLandscapeLeft();
                          break;
                        case 'LANDSCAPE-RIGHT':
                          Orientation.lockToLandscapeRight();
                          break;
                        default:
                          Orientation.lockToPortrait();
                          break;
                      }
                    });
                  }
                  setOrientationLock(!orientationLock);
                }}
              />
              <IconWithLabel
                iconName={
                  frontCam ? 'camera-reverse' : 'camera-reverse-outline'
                }
                color={'black'}
                text={frontCam ? 'Arrière' : 'Avant'}
                pressEvent={swapCam}
              />
              <IconWithLabel
                iconName={'document-text'}
                color={'black'}
                text={'Docs'}
                pressEvent={() => {
                  setSettingsVisible(false);
                  openDocuments();
                }}
              />
            </View>
            <View style={[menuStyle.container]}>
              <IconWithLabel
                iconName={isRecording ? 'recording' : 'recording-outline'}
                color={'black'}
                text={isRecording ? 'Arreter' : 'Enregistrer'}
                pressEvent={() => {
                  if (isRecording) {
                    stopRecord();
                  } else {
                    startRecord();
                  }
                }}
              />
              <IconWithLabel
                text={'Participants'}
                iconName={'people'}
                pressEvent={() => {
                  setParticipantsVisible(true);
                }}
                color={'black'}
              />
              <IconWithLabel
                text={'Partage Ecran'}
                iconName={shareScreen ? 'tv' : 'tv-outline'}
                pressEvent={() => {
                  preventDoubleClick(shareScreenEvent, shareScreenInf);
                }}
                color={shareScreen ? '#9be3b1' : '#000'}
              />
              <IconWithLabel
                text={'Messages'}
                iconName={newMessage ? 'chatbubbles' : 'chatbubbles-outline'}
                pressEvent={() => {
                  setNewMessage(false);
                  openChatRoom();
                }}
                color={newMessage ? '#9be3b1' : '#000'}
              />
              <IconWithLabel
                iconName={'settings'}
                color={'black'}
                text={'Fermer'}
                pressEvent={() => {
                  setSettingsVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
