import { useState } from 'react';

import KYButton from '../../../components/KYButton';
import KYText from '../../../components/KYText';
import KYTextInput from '../../../components/KYTextInput';
import KYScreen from '../../../components/KYScreen';
import { useNavigation } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';
import useRTLStyles from './styles';
import useIsRTL from '../../../hooks/useIsRTL';
import { useTheme } from '../../../contexts/ThemeProvider';
import KYHeader from '../../../components/KYHeader';

import Icon from "react-native-vector-icons/Feather"


// create a component
const Register = () => {
  const isRTL = useIsRTL();
  const { theme } = useTheme();
  const styles = useRTLStyles(isRTL, theme);

  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };



  return (
    <KYScreen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <KYHeader customStyle={styles.header} />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.headerContainer}>
            <KYText text="REGISTER" style={styles.headerTitle} />
            <View style={styles.loginContainer}>
              <KYText text="ALREADY_HAVE_ACCOUNT" style={styles.loginText} />
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <KYText text="LOG_IN" style={styles.loginLink} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <KYText text="FULL_NAME" style={styles.label} />
              <KYTextInput
                placeholder="YOUR_NAME"
                value={formData.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <KYText text="EMAIL_ADDRESS" style={styles.label} />
              <KYTextInput
                placeholder="YOUR_EMAIL"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <KYText text="PHONE_NUMBER" style={styles.label} />
              <KYTextInput
                placeholder="YOUR_PHONE"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <KYText text="PASSWORD" style={styles.label} />
              <KYTextInput
                placeholder="WRITE_HERE"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry={!showPassword}
                rightIcon={<Icon name='eye' size={30} />}
                onRightIconPress={() => setShowPassword(!showPassword)}

              />
            </View>

            <View style={styles.inputGroup}>
              <KYText text="CONFIRM_PASSWORD" style={styles.label} />
              <KYTextInput
                placeholder="WRITE_HERE"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                rightIcon={<Icon name='eye' size={30} />}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </View>

            <KYButton
              title="NEXT"
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </KYScreen>
  );
};

export default Register;