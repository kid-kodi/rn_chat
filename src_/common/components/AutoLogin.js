import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useUser } from '../contexts/UserProvider';

export default function AutoLogin() {
    const {autoLogin} = useUser();

    useEffect(() =>{
        autoLogin()
    }, [])
    
  return (
    <View>
      <ActivityIndicator animating />
    </View>
  )
}