/**
 * @file checkStorage.ts
 * @description Utility functions for managing and retrieving persisted application state from secure storage.
 * This module is responsible for initializing the app with user preferences stored in secure storage.
 */

import i18next from "i18next";
import { secureStorage } from "./secureStorage";

/**
 * Retrieves persisted application state from secure storage and initializes the Redux store.
 * 
 * @async
 * @function getLocalItem
 * @description This function runs at application startup to:
 *  1. Check if the app is running for the first time
 *  2. Load and apply the user's preferred language
 *  3. Load and apply the user's preferred theme
 * 
 * @throws {Error} Will log any errors encountered during retrieval or dispatch
 * @returns {Promise<void>}
 * 
 * @example
 * // Called in App.tsx useEffect
 * getLocalItem();
 */
export const getLocalItem = async () => {
  try {
    // Check if this is the first time the app has been run
    const isFirstTime = await secureStorage.getItem('IS_FIRST_TIME');

    console.log('isFirstTime', isFirstTime);

    // Get saved language preferences
    const language = await secureStorage.getObject('LANGUAGE');
    console.log('language', language);

    // Get saved theme preferences
    const theme = await secureStorage.getItem('THEME');
    console.log('theme', theme);

    // Update first time flag in Redux store
    if (isFirstTime) {
      // dispatch(changeFirstTime(true));
    }

    // Apply saved language if it exists
    if (language) {
      // Change i18next language
      i18next.changeLanguage(language.sortName);
      // Update Redux store with language preference
      // dispatch(saveDefaultLanguage(language));
    }

    // Apply saved theme if it exists, otherwise set default light theme
    if (theme) {
      // dispatch(saveDefaultTheme({ myTheme: theme }));
    } else {
      // Set default theme if none exists
      const systemTheme = 'light';
      await secureStorage.setItem('THEME', systemTheme);
      // dispatch(saveDefaultTheme({ myTheme: systemTheme }));
    }
  } catch (error) {
    console.log(error);
  }
}           