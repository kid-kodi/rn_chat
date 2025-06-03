import { StyleSheet, Text, View } from 'react-native'
import Colors from '../constants/Colors';
import { TouchableOpacity } from 'react-native';
import { useUser } from '../contexts/UserProvider';
import { BASE_API_URL } from '@env';
import CustomImageView from './CustomImage';
import { moderateScale } from '../assets/styles/responsiveSize';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Navbar({ navigation }) {
  const { user } = useUser();

  return (
    <>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.customHeaderInfo} onPress={() => navigation.navigate('PROFILE')}>
          <View style={styles.avatarStatusContainer}>
            <CustomImageView
              source={`${BASE_API_URL}/image/${user?.profilePicture}`}
              firstName={user?.fullName}
              size={50}
              fontSize={25}
            />
            <View style={styles.statusDot} />
          </View>
          <View>
            <Text style={styles.customHeaderInfoPrimary} numberOfLines={1} ellipsizeMode="tail">{user?.fullName}</Text>
            <Text style={styles.customHeaderInfoSecondary}>partagez votre activité.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('NOTIFICATION')}>
          <Ionicons name="notifications-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>


    </>

  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 70,
    alignItems: "center",
    rowGap: 16,
    padding: moderateScale(16)
  },

  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: "center",
    gap: 16,
    flex: 1
  },
  infoPrimary: {
    fontWeight: "bold",
    fontSize: 16,
    color: Colors.textColor
  },
  infoSecondary: {
    color: Colors.textColor
  },
  right: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 50,
    height: 50,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 15
  },
  customHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  customHeaderInfoPrimary: {
    fontSize: 14,
    color: Colors.textColor,
    fontWeight: "bold"
  },
  customHeaderInfoSecondary: {
    fontSize: 14,
    color: Colors.secondaryTextColor
  },
  avatarStatusContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 5
  },
  searchInputContainer: {
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 44,
    flex: 1
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.extraLightGrey,
    height: 44,
    width: 44,
    borderRadius: 15,
  }
});