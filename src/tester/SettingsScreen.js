import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingsScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);

  const logOut = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => console.log("User logged out") }
      ]
    );
  };

  const renderSettingItem = ({ icon, title, value, onValueChange, showToggle = true, onPress }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Icon name={icon} size={22} color="#007AFF" style={styles.settingIcon} />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      {showToggle ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#D1D1D6", true: "#34C759" }}
          ios_backgroundColor="#D1D1D6"
        />
      ) : (
        <Icon name="chevron-forward-outline" size={20} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem({
              icon: 'moon-outline',
              title: 'Dark Mode',
              value: darkMode,
              onValueChange: setDarkMode
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem({
              icon: 'notifications-outline',
              title: 'Push Notifications',
              value: notifications,
              onValueChange: setNotifications
            })}
            {renderSettingItem({
              icon: 'volume-high-outline',
              title: 'Sound Effects',
              value: soundEffects,
              onValueChange: setSoundEffects
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem({
              icon: 'checkmark-done-outline',
              title: 'Read Receipts',
              value: readReceipts,
              onValueChange: setReadReceipts
            })}
            {renderSettingItem({
              icon: 'ellipse-outline',
              title: 'Online Status',
              value: onlineStatus,
              onValueChange: setOnlineStatus
            })}
            {renderSettingItem({
              icon: 'lock-closed-outline',
              title: 'Privacy & Security',
              showToggle: false,
              onPress: () => navigation.navigate('PrivacySecurity')
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem({
              icon: 'person-outline',
              title: 'Profile',
              showToggle: false,
              onPress: () => navigation.navigate('Profile')
            })}
            {renderSettingItem({
              icon: 'chatbubble-outline',
              title: 'Chats',
              showToggle: false,
              onPress: () => navigation.navigate('ChatSettings')
            })}
            {renderSettingItem({
              icon: 'help-circle-outline',
              title: 'Help & Support',
              showToggle: false,
              onPress: () => navigation.navigate('HelpSupport')
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 16,
    backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#FFFFFF',
    borderBottomWidth: Platform.OS === 'ios' ? 0 : 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#000000',
  },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  versionContainer: {
    marginTop: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  versionText: {
    color: '#8E8E93',
    fontSize: 13,
  },
});

export default SettingsScreen;