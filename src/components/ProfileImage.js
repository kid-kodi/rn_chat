import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

import defaultProfile from '../assets/images/defaultProfile.jpeg';
import Colors from '../constants/Colors';
import {hasAndroidPermission} from '../utils/ImagePickerUtil';
import ImagePicker from 'react-native-image-crop-picker';
import {useApi} from '../contexts/ApiProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_API_URL} from '@env';
import {useUser} from '../contexts/UserProvider';
import {useChat} from '../contexts/ChatProvider';

export default function ProfileImage(props) {
  const source = props.uri ? {uri: props.uri} : defaultProfile;

  const [image, setImage] = useState(source);
  const [isLoading, setIsLoading] = useState(false);

  const showEditButton = props.showEditButton && props.showEditButton === true;
  const showRemoveButton =
    props.showRemoveButton && props.showRemoveButton === true;
  const chat = props.chat;

  const api = useApi();
  const {update} = useUser();
  const {updateChatData} = useChat();

  const pickImage = async () => {
    await hasAndroidPermission();
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(async image => {
        setIsLoading(true);

        const data = new FormData();
        data.append('image', {
          fileName: 'image',
          name: 'image.png',
          type: 'image/png',
          uri:
            Platform.OS == 'android'
              ? image.path
              : image.path.replace('file://', ''),
        });

        let token = await AsyncStorage.getItem('user');

        const response = await api.post('/api/files/upload-image', data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        // update chat profile image
        if (chat) {
          const update_response = await updateChatData(chat._id, {
            image: response.data._id,
          });
          if (!update_response.success) {
            Alert.alert(update_response.error.message);
          }
        } else {
          // update user profile image
          const update_response = await update({
            profilePicture: response.data.name,
          });
          if (!update_response.success) {
            Alert.alert(update_response.error.message);
          }
        }
        setImage({uri: `${BASE_API_URL}/image/${response.data.name}`});
        setIsLoading(false);
      })
      .catch(error => {
        console.log('error riased', error);
        setIsLoading(false);
      });
  };

  const Container = props.onPress || showEditButton ? TouchableOpacity : View;

  return (
    <Container style={props.style} onPress={props.onPress || pickImage}>
      {isLoading ? (
        <View
          height={props.size}
          width={props.size}
          style={styles.loadingContainer}>
          <ActivityIndicator size={'small'} color={Colors.primary} />
        </View>
      ) : (
        <Image
          style={{...styles.image, ...{width: props.size, height: props.size}}}
          source={image}
        />
      )}

      {showEditButton && !isLoading && (
        <View style={styles.editIconContainer}>
          <Icon name="pencil" size={15} color="black" />
        </View>
      )}

      {showRemoveButton && !isLoading && (
        <View style={styles.removeIconContainer}>
          <Icon name="close" size={15} color="black" />
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 42,
    height: 42,
    borderRadius: 50,
    borderColor: Colors.grey,
    borderWidth: 1,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.lightGrey,
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIconContainer: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: Colors.lightGrey,
    borderRadius: 20,
    padding: 3,
  },
});
