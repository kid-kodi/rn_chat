import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useUser} from './contexts/UserProvider';
import {TouchableItem} from './components/Item';
import ImageCropPicker from 'react-native-image-crop-picker';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import {useNavigation} from '@react-navigation/native';

export default function UserSettingScreen() {
  const {user} = useUser();
  const navigation = useNavigation();

  const avatarSettings = () => {
    ImageCropPicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true,
      cropperActiveWidgetColor: '#059677',
    })
      .then(async image => {
        // const response = await uploadAvatar(image);
        // if (response == null || response.status !== 201) {
        //   // toast.show('上传失败', {type: 'danger', duration: 1300, placement: 'top'});
        //   console.log("Échec du téléchargement de l'avatar");
        // } else {
        //   await this.refreshAvatar();
        // }
      })
      .catch(e => {
        console.log(e);
      });
  };

  const usernameSettings = type => {
    navigation.navigate('EDIT_PROFILE', {type: type});
  };

  return (
    <View>
      <View style={styles.itemContainer}>
        <TouchableItem
          text={'Avatar'}
          pressEvent={avatarSettings}
          rightComponent={
            <Image
              source={
                user.profilePicture
                  ? {uri: user.profilePicture}
                  : require('../assets/images/defaultProfile.jpeg')
              }
              style={{width: 60, height: 60, borderRadius: 10}}
            />
          }
        />
      </View>
      <View style={{height: 30}} />
      <View style={styles.itemContainer}>
        <View style={{flexDirection: 'row', padding: 15, alignItems: 'center'}}>
          <Text style={{fontSize: 16, textAlign: 'left', marginLeft: 10}}>
            E-Mail
          </Text>
          <View style={{alignItems: 'flex-end', flex: 1}}>
            <Text>{user.email}</Text>
          </View>
        </View>
        <Divider style={styles.divider} />
        <TouchableItem
          text={"Nom d'utilisateur"}
          pressEvent={() => {
            usernameSettings('name');
          }}
          rightComponent={<Text>{user.fullName}</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: 'white',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  divider: {
    marginLeft: 20,
    marginRight: 20,
  },
});
