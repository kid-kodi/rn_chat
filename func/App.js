import { Text, SafeAreaView } from 'react-native'
import { useEffect } from 'react'
import { setupFirebaseMessaging } from './services/NotificationService';

export default function App() {

  useEffect(() => {
    setupFirebaseMessaging();
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>App</Text>
    </SafeAreaView>
  )
}