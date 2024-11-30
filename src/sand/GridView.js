import { memo, useState } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";
import {preventDoubleClick, windowHeight, windowWidth} from "./Utils";
import Orientation, {useOrientationChange} from "react-native-orientation-locker";
import { GridMyWindow, GridPeerWindow } from "./MeetingWindows";


export default GridView = memo(function ({myStream, peerDetails, turnPortrait, myFrontCam, shareScreen, setHideBar}) {
    const [gridWidth, setGridWidth] = useState(windowWidth / 3);
    const [gridHeight, setGridHeight] = useState(windowWidth * 4 / 9);
    const [column, setColumn] = useState(3);

    useOrientationChange((orientation) => {
        switch (orientation) {
            case 'LANDSCAPE-RIGHT': case 'LANDSCAPE-LEFT': setGridWidth(windowHeight / 5); setGridHeight(windowWidth / 3); setColumn(5); setHideBar(true); break;
            default: setGridWidth(windowWidth / 3 ); setGridHeight(windowWidth * 4 / 9); setColumn(3); break;
        }
    });

    const gridStyle = StyleSheet.create({
        rtcView: {
            width: gridWidth,
            height: gridHeight,
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

    const renderItem = ({item, index}) => {
        if (index === 0) {
            return (
                <GridMyWindow
                    mirror={myFrontCam && !shareScreen}
                    rtcViewStyle={gridStyle.rtcView}
                    myStream={myStream}
                    pressEvent={() => {turnPortrait(0)}}
                />
            )
        } else {
            return (
                <GridPeerWindow
                    rtcViewStyle={gridStyle.rtcView}
                    peerToShow={item}
                    peerAudio={item.hasAudio()}
                    peerVideo={item.hasVideo()}
                    trackUrl={new MediaStream(item.getTracks()).toURL()}
                    pressEvent={() => {turnPortrait(index-1)}}
                />
            )
        }
    }

    return (
        <Pressable style={{flex: 1}} onPress={() => {setHideBar();}}>
            <FlatList
                data={streamData}
                renderItem={renderItem}
                numColumns={column}
                key={column === 3 ? 'v' : 'h'}
                keyExtractor={((item, index) => index)}
            />
        </Pressable>
    )
})