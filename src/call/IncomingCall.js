import {View, Text, StyleSheet, Modal, Pressable} from 'react-native';
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';

export default function IncomingCall({userName, isCalling, onDecline, onAccept}) {
  return (
    <Modal transparent={true} animationType="slide" visible={!!isCalling}>
      <View style={styles.bg}>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.phoneNumber}>Appel Entrant...</Text>

        <View style={[styles.row, {marginTop: 'auto'}]}>
          {/* <View style={styles.iconContainer}>
            <Ionicons name="alarm" color="white" size={30} />
            <Text style={styles.iconText}>Remind me</Text>
          </View>
          <View style={styles.iconContainer}>
            <Entypo name="message" color="white" size={30} />
            <Text style={styles.iconText}>Message</Text>
          </View> */}
        </View>

        <View style={styles.row}>
          {/* Decline Button */}
          {onDecline && <Pressable onPress={onDecline} style={styles.iconContainer}>
            <View style={styles.iconButtonContainer}>
              <Feather name="x" color="white" size={40} />
            </View>
            <Text style={styles.iconText}>Refuser</Text>
          </Pressable>}

          {/* Accept Button */}
          {onAccept && <Pressable onPress={onAccept} style={styles.iconContainer}>
            <View
              style={[
                styles.iconButtonContainer,
                {backgroundColor: '#2e7bff'},
              ]}>
              <Feather name="check" color="white" size={40} />
            </View>
            <Text style={styles.iconText}>Accepter</Text>
          </Pressable>}
        </View>
      </View>
    </Modal>
  )
}


const styles = StyleSheet.create({
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 100,
    marginBottom: 15,
  },
  phoneNumber: {
    fontSize: 20,
    color: 'white',
  },
  bg: {
    backgroundColor: '#000',
    flex: 1,
    alignItems: 'center',
    padding: 10,
    paddingBottom: 50,
  },

  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconText: {
    color: 'white',
    marginTop: 10,
  },
  iconButtonContainer: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 50,
    margin: 10,
  },
});