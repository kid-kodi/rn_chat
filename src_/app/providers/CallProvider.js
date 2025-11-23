import {useState} from 'react';
import {createContext, useContext, useEffect} from 'react';
import InCallManager from 'react-native-incall-manager';

const CallContext = createContext();

export default function CallProvider({children}) {
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    InCallManager.start();
    InCallManager.setKeepScreenOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    return () => {
      InCallManager.stop();
    };
  }, []);

  return (
    <CallContext.Provider
      value={{InCallManager, incomingCall, setIncomingCall}}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext);
}
