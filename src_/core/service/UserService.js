import {
  getFromStorage,
  removeFromStorage,
  setInStorage,
} from '../helpers/StorageUtils';
import {FileMimeType, config, config_key} from '../../Constants';
import {getRequest, postFormData, postRequest} from '../helpers/Utils';

export const loginService = async (email, password) => {
  const url = '/api/auth/login';
  const user = {};
  user.email = email;
  user.password = password;
  const response = await postRequest(url, user);
  if (response == null) {
    return false;
  }

  if (response.status === 200) {
    const user = response.data.user;
    // console.log(user.token)
    // console.log(user.token)
    //后端用户名保存叫nickname
    await setInStorage(config.usernameIndex, user.username);
    await setInStorage(config.emailIndex, user.email);
    await setInStorage(config.userIdIndex, user._id);
    await setInStorage(config.tokenIndex, response.data.token);
    config_key.username = user.username;
    config_key.userId = user._id;
    config_key.email = user.email;
    config_key.token = response.data.token;

    const avatarResponse = await getAvatar();
    if (avatarResponse == null || avatarResponse.status !== 200) {
      // toast.show('获取头像失败', {type: 'warning', duration: 1300, placement: 'top'})
      console.log('获取头像失败');
    } else {
      config_key.avatarUri = config.baseURL + avatarResponse.data.path;
    }

    return true;
  } else {
    return false;
  }
};

export const autoLogin = async () => {
  const url = '/api/auth/me';
  return await getRequest(url);
};

export const logout = async () => {
  config_key.token = null;
  config_key.username = null;
  config_key.userId = null;
  config_key.avatarUri = null;
  await removeFromStorage(config.usernameIndex);
  await removeFromStorage(config.userIdIndex);
  await removeFromStorage(config.tokenIndex);
};

export const registerService = async userInf => {
  const url = `/api/auth/me/update/${userInf.id}`;
  return await postRequest(url, userInf);
};

export const emailCheck = async email => {
  const url = '/api/auth/register';
  const data = {email: email};
  return await postRequest(url, data);
};

export const verifyCode = async (activationToken, code) => {
  const url = '/api/auth/activation';
  const data = {
    activation_token: activationToken,
    activation_code: code,
  };
  return await postRequest(url, data);
};

export const uploadAvatar = async image => {
  const extension = FileMimeType[image.mime];
  const url =
    '/api/auth/portrait?token=' + (await getFromStorage(config.tokenIndex));
  let data = new FormData();
  data.append('file', {
    uri: image.path,
    name:
      config_key.username + 'avatar' + image.modificationDate + '.' + extension,
    type: image.mime,
  });
  const postConfig = {
    headers: {'Content-Type': 'multipart/form-data'},
  };
  return await postFormData(url, data, postConfig);
};

export const getAvatar = async () => {
  const token = await getFromStorage(config.tokenIndex);
  const url = '/api/auth/portrait?token=' + token;
  return await getRequest(url);
};

export const changeUsername = async value => {
  const url = '/nickname';
  const data = {
    token: config_key.token,
    nickname: value,
  };
  const response = await postRequest(url, data);
  if (response.status === 200) {
    await setInStorage(config.usernameIndex, value);
    config_key.username = value;
    return true;
  } else {
    return false;
  }
};
