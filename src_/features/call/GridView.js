import { memo, useState } from 'react';
import { windowHeight, windowWidth } from '../../common/utils/Utility';
import { useOrientationChange } from 'react-native-orientation-locker';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { GridMyWindow, GridPeerWindow } from '../../components/MeetingWindows';
import { MediaStream } from 'react-native-webrtc';

export default GridView = memo(function ({
  currentUser,
  myStream,
  peerDetails,
  turnPortrait,
  myFrontCam,
  shareScreen,
  setHideBar,
}) {
  const [gridWidth, setGridWidth] = useState(windowWidth / 3);
  const [gridHeight, setGridHeight] = useState(windowWidth * 4 / 9);
  const [column, setColumn] = useState(3);

  useOrientationChange((orientation) => {
    switch (orientation) {
      case 'LANDSCAPE-RIGHT': case 'LANDSCAPE-LEFT': setGridWidth(windowHeight / 5); setGridHeight(windowWidth / 3); setColumn(5); setHideBar(true); break;
      default: setGridWidth(windowWidth / 3); setGridHeight(windowWidth * 4 / 9); setColumn(3); break;
    }
  });

  const gridStyle = StyleSheet.create({
    container: {
      // padding: 8
    },
    rtcView: {
      width: gridWidth - 15,
      height: gridHeight,
      flex: 1,
      margin: 5,
      backgroundColor: '#fff',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    }
  })

  let streamData = [];
  if (myStream) {
    streamData.push(myStream);
  } else {
    streamData.push('emptyInf of me');
  }
  if (peerDetails) {
    streamData.push(...peerDetails);
  }

  const renderItem = ({ item, index }) => {
    if (index === 0) {
      return (
        <GridMyWindow
          currentUser={currentUser}
          mirror={myFrontCam && !shareScreen}
          rtcViewStyle={gridStyle.rtcView}
          myStream={myStream}
          pressEvent={() => {
            turnPortrait(0);
          }}
        />
      );
    } else {
      return (
        <GridPeerWindow
          rtcViewStyle={gridStyle.rtcView}
          peerToShow={item}
          peerAudio={item.hasAudio()}
          peerVideo={item.hasVideo()}
          trackUrl={new MediaStream(item.getTracks()).toURL()}
          pressEvent={() => {
            turnPortrait(index - 1);
          }}
        />
      );
    }
  };

  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => {
        setHideBar();
      }}>
      <FlatList
        data={streamData}
        renderItem={renderItem}
        numColumns={column}
        key={column}
        keyExtractor={(item, index) => index}
        contentContainerStyle={gridStyle.container}
      />
    </Pressable>
  );
});
