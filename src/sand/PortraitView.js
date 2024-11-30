import {memo, useState, useRef, useEffect} from 'react';
import {windowHeight, windowWidth} from './Utils';
import Orientation, {
  useOrientationChange,
} from 'react-native-orientation-locker';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { MyStreamWindow } from './MeetingWindows';

export default PortraitView = memo(function ({
  width,
  height,
  peerToShow,
  myStream,
  myFrontCam,
  shareScreen,
  setHideBar,
  peerAudio,
  peerVideo,
}) {
  const [smallWindowWidth, setSmallWidth] = useState(windowWidth / 3);
  const [smallWindowHeight, setSmallHeight] = useState((windowWidth * 4) / 9);

  const changeScaleDueToOrientation = orientation => {
    switch (orientation) {
      case 'LANDSCAPE-RIGHT':
      case 'LANDSCAPE-LEFT':
        setSmallHeight((windowHeight * 4) / 15);
        setSmallWidth(windowHeight / 5);
        break;
      default:
        setSmallHeight((windowWidth * 4) / 9);
        setSmallWidth(windowWidth / 3);
        break;
    }
  };

  Orientation.getOrientation(orientation =>
    changeScaleDueToOrientation(orientation),
  );

  useOrientationChange(orientation => changeScaleDueToOrientation(orientation));

  const portraitStyle = StyleSheet.create({
    smallWindow: {
      position: 'absolute',
      bottom: 80,
      right: 20,
      width: smallWindowWidth,
      height: smallWindowHeight,
      borderWidth: 1,
    },
    bigWindow: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: width - 3,
      height: height - 3,
    },
    cancelButton: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 15,
    },
    showButton: {
      position: 'absolute',
      bottom: 60 + smallWindowHeight / 2,
      right: 0,
      width: 20,
      height: 40,
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const [showSmall, setShowSmall] = useState('show');
  const [peerBig, setPeerBig] = useState(true);
  const animateWidth = useRef(new Animated.Value(smallWindowWidth)).current;
  const animateHeight = useRef(new Animated.Value(smallWindowHeight)).current;
  const animateBottom = useRef(new Animated.Value(80)).current;
  const animateRight = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (showSmall === 'toShow') {
      showSmallWindow();
    } else if (showSmall === 'toHide') {
      hideSmallWindow();
    }
  }, [showSmall]);

  const showSmallWindow = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(animateWidth, {
          toValue: smallWindowWidth,
          useNativeDriver: false,
          duration: 200,
        }),
        Animated.timing(animateRight, {
          toValue: 20,
          useNativeDriver: false,
          duration: 200,
        }),
      ]),
      Animated.parallel([
        Animated.timing(animateHeight, {
          toValue: smallWindowHeight,
          useNativeDriver: false,
          duration: 200,
        }),
        Animated.timing(animateBottom, {
          toValue: 80,
          useNativeDriver: false,
          duration: 200,
        }),
      ]),
    ]).start(() => {
      setShowSmall('show');
    });
  };

  const hideSmallWindow = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(animateHeight, {
          toValue: 0,
          useNativeDriver: false,
          duration: 200,
        }),
        Animated.timing(animateBottom, {
          toValue: 60 + smallWindowHeight / 2,
          useNativeDriver: false,
          duration: 200,
        }),
      ]),
      Animated.parallel([
        Animated.timing(animateWidth, {
          toValue: 0,
          useNativeDriver: false,
          duration: 200,
        }),
        Animated.timing(animateRight, {
          toValue: 0,
          useNativeDriver: false,
          duration: 200,
        }),
      ]),
    ]).start(() => {
      setShowSmall('hide');
    });
  };

  if (peerToShow) {
    const smallMic = !peerBig && peerAudio;
    const trackUrl = new MediaStream(peerToShow.getTracks()).toURL();

    return (
      <View style={{flex: 1}}>
        <Pressable
          style={{flex: 1}}
          onPress={() => {
            setHideBar();
          }}>
          {peerBig ? (
            <PeerWindow
              peerToShow={peerToShow}
              rtcViewStyle={portraitStyle.bigWindow}
              peerInfo={peerToShow.getPeerInfo()}
              trackUrl={trackUrl}
              peerVideo={peerVideo}
              peerAudio={peerAudio}
              zOrder={0}
            />
          ) : (
            <MyStreamWindow
              rtcViewStyle={portraitStyle.bigWindow}
              myStream={myStream}
              zOrder={0}
              frontCam={myFrontCam}
              shareScreen={shareScreen}
            />
          )}
        </Pressable>
        {showSmall === 'show' ? (
          <Pressable
            style={[
              portraitStyle.smallWindow,
              {
                borderColor: peerBig
                  ? 'white'
                  : smallMic
                  ? '#44CE55'
                  : '#f1f3f5',
              },
            ]}
            onPress={() => {
              setPeerBig(!peerBig);
            }}>
            <View style={{flex: 1}}>
              <Pressable
                style={portraitStyle.cancelButton}
                onPress={() => {
                  setShowSmall('toHide');
                }}>
                <Ionicons
                  name={'close-circle-outline'}
                  color={'white'}
                  size={20}
                />
              </Pressable>
              {peerBig ? (
                <MyStreamWindow
                  rtcViewStyle={{
                    width: smallWindowWidth - 3,
                    height: smallWindowHeight - 3,
                    backgroundColor: 'black',
                  }}
                  myStream={myStream}
                  zOrder={1}
                  frontCam={myFrontCam}
                  shareScreen={shareScreen}
                />
              ) : (
                <PeerWindow
                  rtcViewStyle={{
                    width: smallWindowWidth - 3,
                    height: smallWindowHeight - 3,
                    backgroundColor: 'black',
                  }}
                  peerToShow={peerToShow}
                  peerInfo={peerToShow.getPeerInfo()}
                  trackUrl={trackUrl}
                  peerAudio={peerAudio}
                  peerVideo={peerVideo}
                  zOrder={1}
                />
              )}
            </View>
          </Pressable>
        ) : showSmall === 'hide' ? (
          <TouchableOpacity
            style={[
              portraitStyle.showButton,
              {
                backgroundColor: peerBig
                  ? 'white'
                  : smallMic
                  ? '#44CE55'
                  : '#f1f3f5',
              },
            ]}
            onPress={() => {
              setShowSmall('toShow');
            }}>
            <FontAwesome5
              name={'window-maximize'}
              color={smallMic ? 'white' : 'black'}
              size={15}
              style={{transform: [{rotate: '270deg'}]}}
            />
          </TouchableOpacity>
        ) : (
          <Animated.View
            style={{
              position: 'absolute',
              width: animateWidth,
              height: animateHeight,
              backgroundColor: 'black',
              bottom: animateBottom,
              right: animateRight,
              borderWidth: 1,
              borderColor: '#f1f3f5',
            }}
          />
        )}
      </View>
    );
  } else {
    return (
      <Pressable
        style={{flex: 1}}
        onPress={() => {
          setHideBar();
        }}>
        <MyStreamWindow
          rtcViewStyle={portraitStyle.bigWindow}
          myStream={myStream}
          zOrder={0}
          frontCam={myFrontCam}
          shareScreen={shareScreen}
        />
      </Pressable>
    );
  }
});
