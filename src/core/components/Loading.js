import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function Loading() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}>
      <ActivityIndicator />
    </View>
  )
}

const styles = StyleSheet.create({})