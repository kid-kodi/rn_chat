import {
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {moderateScale} from '../assets/styles/responsiveSize';
import Screen from '../core/components/Screen';

import Contacts from 'react-native-contacts';
import {useApi} from '../core/contexts/ApiProvider';
import {PermissionsAndroid} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DataItem from '../core/components/DataItem';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../core/components/CustomHeaderButton';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default function ContactList() {
  const navigation = useNavigation();
  const api = useApi();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Contacts',
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="Nouveau contact"
              iconName="user-plus"
              onPress={() => console.log('first')}
            />
          </HeaderButtons>
        );
      },
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          if (Platform.OS === 'android') {
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
              {
                title: 'Contacts',
                message: 'ContactsList app would like to access your contacts.',
                buttonPositive: 'Accept',
              },
            ).then(value => {
              if (value === 'granted') {
                Contacts.getAll().then((contacts) => {
                  setContacts(contacts)
                });
              }
            });
          } else {
            Contacts.getAll().then((contacts) => {
              setContacts(contacts)
            });
          }
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }, []),
  );

  const sections = React.useMemo(() => {
    if (!contacts) {
      return null;
    }

    const sectionsMap = contacts.reduce((acc, contact) => {
      const {familyName} = contact;
      const [firstLetter] = familyName;

      return Object.assign(acc, {
        [firstLetter]: [...(acc[firstLetter] || []), contact],
      });
    }, {});

    return Object.entries(sectionsMap)
      .map(([letter, items]) => ({
        letter,
        items: items.sort((a, b) => a.familyName.localeCompare(b.familyName)),
      }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
  }, [contacts]);

  if (!sections) {
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
    );
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <SafeAreaView style={{backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={styles.container}>
        {sections.map(({letter, items}) => (
          <View style={styles.section} key={letter}>
            <Text style={styles.sectionTitle}>{letter}</Text>
            <View style={styles.sectionItems}>
              {items.map(
                (
                  {givenName, familyName, phoneNumbers, thumbnailPath},
                  index,
                ) => {
                  const name = `${givenName} ${familyName}`;
                  const phone = phoneNumbers.length
                    ? phoneNumbers[0].number
                    : '-';
                  const img = thumbnailPath;

                  return (
                    <View key={index} style={styles.cardWrapper}>
                      <TouchableOpacity
                        onPress={() => {
                          // handle onPress
                        }}>
                        <View style={styles.card}>
                          {img ? (
                            <Image
                              alt=""
                              resizeMode="cover"
                              source={{uri: img}}
                              style={styles.cardImg}
                            />
                          ) : (
                            <View style={[styles.cardImg, styles.cardAvatar]}>
                              <Text style={styles.cardAvatarText}>
                                {name[0]}
                              </Text>
                            </View>
                          )}

                          <View style={styles.cardBody}>
                            <Text style={styles.cardTitle}>{name}</Text>

                            <Text style={styles.cardPhone}>{phone}</Text>
                          </View>

                          <View style={styles.cardAction}>
                            <FeatherIcon
                              color="#9ca3af"
                              name="chevron-right"
                              size={22}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                },
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 12,
    paddingLeft: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingBottom: 5,
  },
  sectionItems: {
    marginTop: 8,
  },
  container: {
    paddingHorizontal: 0,
  },
  title: {
    fontFamily: 'medium',
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  card: {
    paddingVertical: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardImg: {
    width: 42,
    height: 42,
    borderRadius: 50,
  },
  cardAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9ca1ac',
  },
  cardAvatarText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardBody: {
    marginRight: 'auto',
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  cardPhone: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#616d79',
    marginTop: 3,
  },
  cardAction: {
    paddingRight: 16,
  },
});
