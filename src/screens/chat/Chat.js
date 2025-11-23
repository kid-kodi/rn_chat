import { View, Text, SafeAreaView } from 'react-native'
import { styles } from './chatStyles'

export default function Chat({ route, navigation }) {
  // ==================== Route Params ====================
  const userId = route?.params?.userId;
  const chatId = route?.params?.chatId;
  return (
    <SafeAreaView style={styles.container}>
      <Text>UserId {userId}</Text>
      <Text>ChatId {chatId}</Text>
    </SafeAreaView>
  )
}