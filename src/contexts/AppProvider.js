import { createContext, useContext } from 'react';
import { Toast, ToastProvider } from 'react-native-toast-notifications';
import ApiProvider from './ApiProvider';
import SocketProvider from './SocketProvider';
import UserProvider from './UserProvider';
import ChatProvider from './ChatProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MenuProvider } from 'react-native-popup-menu';
import MessageProvider from './MessageProvider';

const AppContext = createContext();

export default function AppProvider({ children }) {

  return (
    <ToastProvider>
      <ApiProvider>
        <SocketProvider>
          <UserProvider>
            <ChatProvider>
              <MessageProvider>
                <SafeAreaProvider>
                  <MenuProvider>
                    {children}
                  </MenuProvider>
                </SafeAreaProvider>
              </MessageProvider>
            </ChatProvider>
          </UserProvider>
        </SocketProvider>
      </ApiProvider>
    </ToastProvider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
