import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_API_URL } from '@env';
import { hasAndroidPermission } from '../../utils/ImagePickerUtil';
import ImagePicker from 'react-native-image-crop-picker';

import { useApi } from '../../contexts/ApiProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';

import Strings from '../../constants/Strings';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useChat } from '../../contexts/ChatProvider';
import { useUser } from '../../contexts/UserProvider';
import Input from '../../components/Input';

const Schema = Yup.object().shape({
  chatName: Yup.string().required(Strings.GROUP_NAME_ERROR),
});


export default function GroupInfoScreen({ route, navigation }) {

  const [image, setImage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const { create } = useChat();
  const { user } = useUser();

  const newChatUsers = route.params.users.map(u => u._id);

  const api = useApi();

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

        console.log(response)


        setImage({ uri: `${BASE_API_URL}/image/${response.data.name}` });
        setIsLoading(false);
      })
      .catch(error => {
        console.log('error riased', error);
        setIsLoading(false);
      });
  };

  const formik = useFormik({
    initialValues: {
      chatName: '',
    },
    validationSchema: Schema,
    onSubmit: async values => {
      const chatName = values.chatName;
      newChatUsers.push(user._id);
      const response = await create(newChatUsers, chatName, true);
      if (response.success) {
        navigation.navigate('CHAT', { chatId: response._id });
      } else {
        toast.show(response.message, {
          type: 'danger',
          duration: 5000,
          placement: 'top',
        });
      }
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Conversation</Text>
      </View>

      {isLoading && <View
        height={12}
        width={12}
        style={styles.loadingContainer}>
        <ActivityIndicator size={'small'} color={Colors.primary} />
      </View>}

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={image} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="camera" size={30} color="#999" />
            <Text style={styles.placeholderText}>Ajouter une photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <Input
        label="Nom du groupe"
        placeholder={Strings.GROUP_NAME}
        errorText={formik.errors.chatName}
        onChangeText={formik.handleChange('chatName')}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={formik.handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitText}>Créer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});