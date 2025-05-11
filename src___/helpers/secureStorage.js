import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  IS_FIRST_TIME: 'is_first_time',
  LANGUAGE: 'language',
  THEME: 'theme',
};


export const secureStorage = {
  async setItem(key, value) {
    try {
      await RNSecureStorage.setItem(STORAGE_KEYS[key], value, { accessible: ACCESSIBLE.WHEN_UNLOCKED });
    } catch (error) {
      console.log('Error storing value:', error);
    }
  },

  async getItem(key) {
    try {
      return await RNSecureStorage.getItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.log(`Error retrieving value: ${STORAGE_KEYS[key]}`, error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await RNSecureStorage.removeItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.log('Error removing value:', error);
    }
  },

  async setObject(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await RNSecureStorage.setItem(STORAGE_KEYS[key], jsonValue, { accessible: ACCESSIBLE.WHEN_UNLOCKED });
    } catch (error) {
      console.log('Error storing object:', error);
    }
  },

  async getObject(key) {
    try {
      const jsonValue = await RNSecureStorage.getItem(STORAGE_KEYS[key]);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.log('Error retrieving object:', error);
      return null;
    }
  },

  async clearAll() {
    try {
      await RNSecureStorage.clear();
    } catch (error) {
      console.log('Error clearing all:', error);
    }
  }
};