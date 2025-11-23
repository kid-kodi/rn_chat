import {StyleSheet, Text, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import {Tip} from './components/Tip';
import {useNavigation, useRoute} from '@react-navigation/native';
import {TextButton} from './components/MyButton';
import { config_key } from '../Constants';

const changeFunctions = [
  async value => {
    // return await changeUsername(value);
  },
  async value => {
    return true;
  },
];

export default function EditProfileScreen() {
  const [state, setState] = useState({contentsCount: 0, text: null, tip: null});
  const navigation = useNavigation();
  const route = useRoute();

  const type = route.params.type;

  const title = type === 'name' ? 'Modifier le profil' : 'changer le mot de passe';

  navigation.setOptions({
    title: title,
    headerLeft: () => {
      return (
        <TextButton
          text={'Annuler'}
          pressEvent={() => {
            navigation.pop();
          }}
        />
      );
    },
    headerRight: () => {
      return <TextButton text={'Enregistrer'} pressEvent={onCommit} />;
    },
  });

  if (type === 'name') {
    setState({
      ...state,
      contentsCount: 0,
    });
  } else if (type === 'password') {
    setState({
      ...state,
      contentsCount: 1,
    });
  }

  const onCommit = async () => {
    const {text, contentsCount} = state;
    const filled = !(text == null || text.length === 0);
    if (!filled) {
      setState({
        ...state,
        tip: 'Ne peux pas être vide',
      });
    } else {
      if (await changeFunctions[contentsCount](text)) {
        props.navigation.pop();
      } else {
        toast.show('ne pas réussir à modifier', {
          type: 'danger',
          duration: 1000,
          placement: 'top',
        });
      }
    }
  };

  const autoCheck = value => {
    //todo: check username duplicated
  };

  const textChange = value => {
    if (state.contentsCount === 0) {
      autoCheck(value);
    }

    const tip =
      value == null || value.length === 0 ? 'Ne peux pas être vide' : null;
    setState({
      ...state,
      text: value,
      tip: tip,
    });
  };

  return (
    <View style={{margin: 10}}>
      <Tip text={state.tip} warning={true} />
      <TextInput
        placeholder={
          state.contentsCount === 1 ? null : config_key.username
        }
        maxLength={15}
        multiline={false}
        onChangeText={textChange}
        keyboardType={'default'}
        style={{
          backgroundColor: 'white',
          borderRadius: 10,
          fontSize: 16,
          color: 'black',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
