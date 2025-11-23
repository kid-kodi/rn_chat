import {View, ActivityIndicator} from 'react-native';
import Colors from '../../common/constants/Colors';
import CommonStyles from '../../common/constants/CommonStyles';

export default function SplashScreen() {
  return (
    <View style={CommonStyles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
