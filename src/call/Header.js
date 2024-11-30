import { Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { useState } from "react";

import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from "moment";
import { config } from "../core/constants/Config";

export default Header = ({roomInf, exit}) => {
    const headerStyle = StyleSheet.create({
      wholeContainer: {
        flex: 1,
        flexDirection: 'row',
      },
      headerIconContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
      },
      titleContainer: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center',
      },
      title: {
        fontSize: 18,
        color: config.qGreen,
      },
      buttonContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
      },
      exitButton: {
        backgroundColor: '#e00000',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 9,
        paddingRight: 9,
      },
      exitText: {
        color: 'white',
      },
    });
  
    const infStyle = StyleSheet.create({
      infContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginLeft: 30,
        marginRight: 30,
      },
      infText: {
        margin: 5,
      },
    });
  
    const [showInf, setShowInf] = useState(false);
  
    return (
      <View style={headerStyle.wholeContainer}>
        <TouchableOpacity
          style={headerStyle.headerIconContainer}
          onPress={() => {
            setShowInf(true);
          }}>
          <Ionicons
            name={'information-circle-outline'}
            size={20}
            color={'#cccccc'}
          />
        </TouchableOpacity>
        <View style={headerStyle.titleContainer}>
          <Text style={headerStyle.title}>{roomInf}</Text>
        </View>
        <View style={headerStyle.buttonContainer}>
          <TouchableHighlight style={headerStyle.exitButton} onPress={exit}>
            <Text style={headerStyle.exitText}>Quitter</Text>
          </TouchableHighlight>
        </View>
        <Modal
          animationType={'slide'}
          visible={showInf}
          transparent={true}
          onRequestClose={() => {
            setShowInf(false);
          }}>
          <View style={{flex: 1}}>
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => {
                setShowInf(false);
              }}
            />
            <View style={infStyle.infContainer}>
              <Text style={infStyle.infText}>
                {roomInf}
              </Text>
              <Text style={infStyle.infText}>
                {roomInf}
              </Text>
            </View>
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => {
                setShowInf(false);
              }}
            />
          </View>
        </Modal>
      </View>
    );
  };