import { Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { useContext, useState } from "react";

import Ionicons from 'react-native-vector-icons/Ionicons';
import { config } from "../core/constants/Config";
import { navigate } from "../core/helpers/RootNavigation";
import { useChat } from "../core/contexts/ChatProvider";

export default Header = ({ roomInf, exit }) => {
  

  const [showInf, setShowInf] = useState(false);
  const {chatId} = useChat();

  return (
    <View style={headerStyle.wholeContainer}>
      <TouchableOpacity
        style={headerStyle.headerIconContainer}
        onPress={() => {
          navigate("CHAT", { chatId });
        }}>
        <Ionicons
          name={'arrow-back-outline'}
          size={24}
          color={'#fff'}
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
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
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
            style={{ flex: 1 }}
            onPress={() => {
              setShowInf(false);
            }}
          />
        </View>
      </Modal>
    </View>
  );
};


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