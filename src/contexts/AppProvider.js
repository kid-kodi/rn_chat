import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext, useContext, useEffect, useState} from 'react';

const AppContext = createContext();

export default function AppProvider({children}) {
  const [firstLaunch, setFirstLaunch] = useState(true);

  useEffect(() => {
    async function setData() {
      const appData = await AsyncStorage.getItem('appLaunched');
      if (appData == null) {
        setFirstLaunch(true);
      } else {
        setFirstLaunch(false);
      }
    }
    setData();
  }, []);

  const handleSetFirstLaunch = async () => {
    await AsyncStorage.setItem('appLaunched', 'true');
    setFirstLaunch(false);
  };

  return (
    <AppContext.Provider value={{firstLaunch, handleSetFirstLaunch}}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
