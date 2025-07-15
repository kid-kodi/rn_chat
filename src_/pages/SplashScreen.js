import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Animated, Dimensions, View } from 'react-native';
import { MaskedMyMeeting } from "../components/MaskedText";
import { config, config_key } from "../Constants";
import { getFromStorage } from "../utils/StorageUtils";
import { autoLogin, getAvatar } from "../service/UserService";
import { SafeAreaView } from 'react-native-safe-area-context';

const windowHeight = Dimensions.get('window').height;

const Splash = ({ animateEnd }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  const autoLoginAndReadStorage = async () => {
    const response = await autoLogin();
    config_key.email = await getFromStorage(config.emailIndex);

    if (response == null || response.status !== 200) {
      return false;
    }

    const avatarResponse = await getAvatar();
    if (avatarResponse == null || avatarResponse.status !== 200) {
      console.log('获取头像失败');
    } else {
      config_key.avatarUri = config.baseURL + avatarResponse.data.path;
    }

    config_key.token = await getFromStorage(config.tokenIndex);
    config_key.username = await getFromStorage(config.usernameIndex);
    config_key.userId = Number.parseInt(await getFromStorage(config.userIdIndex));

    const camera = await getFromStorage(config.cameraIndex);
    config_key.camera = camera === 'true';

    const microphone = await getFromStorage(config.microphoneIndex);
    config_key.microphone = microphone === 'true';

    return true;
  };

  useEffect(() => {
    const init = async () => {
      const autoStatus = await autoLoginAndReadStorage();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        if (animateEnd) {
          animateEnd(autoStatus);
        }
      });
    };
    init();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: windowHeight * 0.11 }} />
      <Animated.View style={{ 
        height: windowHeight * 0.31, 
        justifyContent: "center", 
        alignItems: "center",
        opacity: fadeAnim 
      }}>
        <ActivityIndicator />
      </Animated.View>
      <View style={{ height: windowHeight * 0.52 }} />
    </View>
  );
};

const SplashScreen = ({ navigation }) => {
  const handleAnimateEnd = (autoStatus) => {
    if (autoStatus) {
      navigation.navigate('Tab');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Splash animateEnd={handleAnimateEnd} />
    </SafeAreaView>
  );
};

export default SplashScreen;