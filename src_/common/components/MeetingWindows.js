import { useEffect } from 'react';
import { TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { UserLabel } from './UserLabel';
import { RTCView } from 'react-native-webrtc';
import { BASE_API_URL } from '@env';
import { DefaultPic, DefaultWithAudioPic, MyPic } from './DefaultPic';
// import { MeetingVariable } from '../MeetingVariable';
// import { config_key } from '../Constants';

const PeerWindow = ({
  peerToShow,
  rtcViewStyle,
  peerInfo,
  trackUrl,
  peerAudio,
  peerVideo,
  zOrder,
}) => {
  useEffect(() => {
    peerToShow.subscribe();
    return () => {
      peerToShow.unsubscribeVideo();
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <UserLabel text={peerInfo.displayName} />
      {peerVideo ? (
        <RTCView zOrder={zOrder} style={[rtcViewStyle]} streamURL={trackUrl} />
      ) : peerAudio ? (
        <DefaultWithAudioPic style={rtcViewStyle} imgSrc={peerInfo.avatar} />
      ) : (
        <DefaultPic style={rtcViewStyle} imgSrc={peerInfo.avatar} />
      )}
    </View>
  );
};

const MyStreamWindow = ({
  currentUser,
  rtcViewStyle,
  myStream,
  zOrder,
  frontCam,
  shareScreen,
}) => {
  return (
    <View style={{ flex: 1 }}>
      <UserLabel text="Me" />
      {myStream ? (
        <RTCView
          mirror={frontCam && !shareScreen}
          zOrder={zOrder}
          style={rtcViewStyle}
          streamURL={myStream.toURL()}
        />
      ) : (
        <MyPic style={rtcViewStyle} imgSrc={
          currentUser?.profilePicture ?
            `${BASE_API_URL}/image/${currentUser?.profilePicture}` : null
        } />
      )}
    </View>
  );
};

const GridMyWindow = ({ currentUser, mirror, rtcViewStyle, myStream, pressEvent }) => {
  return (
    <TouchableHighlight
      style={{
        borderRadius: 10,
      }}
      onPress={pressEvent}>
      <View>
        <UserLabel text="Me" />
        {myStream ? (
          <RTCView
            zOrder={0}
            mirror={mirror}
            style={rtcViewStyle}
            streamURL={myStream.toURL()}
          />
        ) : (
          <MyPic style={rtcViewStyle}
            imgSrc={
              currentUser?.profilePicture ?
                `${BASE_API_URL}/image/${currentUser?.profilePicture}` : null
            } />
        )}
      </View>
    </TouchableHighlight>
  );
};

const GridPeerWindow = ({
  rtcViewStyle,
  peerToShow,
  trackUrl,
  peerAudio,
  peerVideo,
  pressEvent,
}) => {
  useEffect(() => {
    peerToShow.subscribe();
    return () => {
      peerToShow.unsubscribeVideo();
    };
  }, []);

  const peerInfo = peerToShow.getPeerInfo();
  return (
    <TouchableOpacity
      style={{
        borderWidth: peerAudio ? 1 : 0,
        borderColor: peerAudio ? '#44CE55' : '#f1f3f5',
      }}
      onPress={pressEvent}>
      <View>
        <UserLabel text={peerInfo.displayName} />
        {peerVideo ? (
          <RTCView
            zOrder={0}
            mirror={false}
            style={rtcViewStyle}
            streamURL={trackUrl}
          />
        ) : peerAudio ? (
          <DefaultWithAudioPic style={rtcViewStyle} imgSrc={peerInfo.avatar} />
        ) : (
          <DefaultPic style={rtcViewStyle} imgSrc={peerInfo.avatar} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export { MyStreamWindow, PeerWindow, GridPeerWindow, GridMyWindow };
