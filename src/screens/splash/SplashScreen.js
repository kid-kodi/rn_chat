import {View, ActivityIndicator} from 'react-native';
import Colors from '../../constants/Colors';
import CommonStyles from '../../constants/CommonStyles';

export default function SplashScreen() {
  return (
    <View style={CommonStyles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
