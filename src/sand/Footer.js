import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {IconWithLabel} from './IconWithLabel';

import {preventDoubleClick} from './Utils';
import { MeetingVariable } from './MeetingVariable';

import {config_key} from "./Constants";
import { HostMenu, ParticipantsMenu } from './ParticipantsMenu';

export default function Footer({
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
}) {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [hostVisible, setHostVisible] = useState(false);
  const [orientationLock, setOrientationLock] = useState(false);
  const [newMessage, setNewMessage] = useState(false);

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
      <IconWithLabel
        text={microStat === 'on' ? '开启静音' : '解除静音'}
        iconName={microStat === 'on' ? 'mic' : 'mic-outline'}
        pressEvent={() => {
          preventDoubleClick(microEvent, microInf);
        }}
        color={microStat === 'on' ? '#9be3b1' : 'white'}
      />
      <IconWithLabel
        text={camStat === 'on' ? '关闭视频' : '开启视频'}
        iconName={camStat === 'on' ? 'videocam' : 'videocam-outline'}
        pressEvent={() => {
          preventDoubleClick(camEvent, camInf);
        }}
        color={camStat === 'on' ? '#9be3b1' : 'white'}
      />
      <IconWithLabel
        text={shareScreen ? '停止共享' : '共享屏幕'}
        iconName={shareScreen ? 'tv' : 'tv-outline'}
        pressEvent={() => {
          preventDoubleClick(shareScreenEvent, shareScreenInf);
        }}
        color={shareScreen ? '#9be3b1' : 'white'}
      />
      <IconWithLabel
        text={'会议聊天'}
        iconName={newMessage ? 'chatbubbles' : 'chatbubbles-outline'}
        pressEvent={() => {
          setNewMessage(false);
          openChatRoom();
        }}
        color={newMessage ? '#9be3b1' : 'white'}
      />
      <IconWithLabel
        text={'更多选项'}
        iconName={settingsVisible ? 'settings' : 'settings-outline'}
        pressEvent={() => {
          setSettingsVisible(true);
        }}
      />

      <Modal
        animationType={'slide'}
        visible={participantsVisible}
        transparent={true}
        onRequestClose={() => {
          setParticipantsVisible(false);
        }}>
        <View style={{flex: 1}}>
          <TouchableOpacity
            style={{flex: 1}}
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
        <View style={{flex: 1}}>
          <TouchableOpacity
            style={{flex: 1}}
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
        <View style={{flex: 1, justifyContent: 'flex-end'}}>
          <TouchableOpacity
            style={{flex: 1}}
            onPress={() => {
              setSettingsVisible(false);
            }}
          />
          <View style={menuStyle.outerContainer}>
            <View style={menuStyle.container}>
              <IconWithLabel
                iconName={view === 'grid' ? 'tablet-portrait' : 'grid'}
                color={'black'}
                text={view === 'grid' ? '人像视图' : '网格视图'}
                pressEvent={() => {
                  if (view === 'grid') {
                    setView('portrait');
                  } else if (view === 'portrait') {
                    setView('grid');
                  }
                }}
              />
              {MeetingVariable.hostId === config_key.userId && (
                <IconWithLabel
                  iconName={'build'}
                  color={'black'}
                  text={'管理成员'}
                  pressEvent={() => {
                    setHostVisible(true);
                  }}
                />
              )}
              <IconWithLabel
                text={'参会人员'}
                iconName={'people'}
                pressEvent={() => {
                  setParticipantsVisible(true);
                }}
                color={'black'}
              />
              <IconWithLabel
                text={audioStatus === 'Speaker' ? '扬声器开' : '扬声器关'}
                color={'black'}
                iconName={
                  audioStatus === 'Speaker' ? 'volume-high' : 'volume-mute'
                }
                pressEvent={switchAudioRoute}
              />
            </View>
            <View style={[menuStyle.container]}>
              <IconWithLabel
                iconName={'text'}
                color={'black'}
                text={showSubtitle ? '关闭字幕' : '开启字幕'}
                pressEvent={() => {
                  setShowSubtitle(!showSubtitle);
                }}
              />
              <IconWithLabel
                iconName={'document-text'}
                color={'black'}
                text={'会议纪要'}
                pressEvent={() => {
                  setSettingsVisible(false);
                  openDocuments();
                }}
              />
              <IconWithLabel
                iconName={
                  frontCam ? 'camera-reverse' : 'camera-reverse-outline'
                }
                color={'black'}
                text={frontCam ? '切换后置' : '切换前置'}
                pressEvent={swapCam}
              />
              <IconWithLabel
                text={orientationLock ? '自动旋转' : '禁用旋转'}
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
                iconName={'settings'}
                color={'black'}
                text={'关闭设置'}
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
}

const footerStyle = StyleSheet.create({
  wholeContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-around',
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
