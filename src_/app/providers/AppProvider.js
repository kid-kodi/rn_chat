import {createContext, useContext} from 'react';
import {ToastProvider} from 'react-native-toast-notifications';
import ApiProvider from './ApiProvider';
import MessageProvider from './MessageProvider';
import {ThemeProvider} from './ThemeProvider';
import {ConversationProvider} from './ConversationProvider';
import SocketProvider from './SocketProvider';
import UserProvider from './UserProvider';
import ChatProvider from './ChatProvider';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MenuProvider} from 'react-native-popup-menu';

const AppContext = createContext();

export default function AppProvider({children}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ApiProvider>
          <SocketProvider>
            <UserProvider>
              <ConversationProvider>
                <ChatProvider>
                  <MessageProvider>
                    <SafeAreaProvider>
                      <MenuProvider>
                        {children}
                      </MenuProvider>
                    </SafeAreaProvider>
                  </MessageProvider>
                </ChatProvider>
              </ConversationProvider>
            </UserProvider>
          </SocketProvider>
        </ApiProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
