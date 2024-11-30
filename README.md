on DEV clear cache on IP change
yarn start --reset-cache

<!-- Implement Video Call with media soup server -->
--> Install Mediasoup Client OK
--> get RTP capabilities
--> Create and load device
--> Request Server Transport Params and create Transport
--> Connect Transport
--> Create Producer

pour installer from PC to mobile
yarn android --mode release


1 - cd android
2 - ./gradlew assembleRelease
3 - You can find the generated APK at android/app/build/outputs/apk/app-release.apk.


if Error

:app:processReleaseResources FAILED
FAILURE: Build failed with an exception.
* What went wrong:
Execution failed for task ‘:app:processReleaseResources’.
> com.android.ide.common.process.ProcessException: Failed to execute aapt


1 - cd ..
2 - rm -rf android/app/src/main/res/drawable-*
3 - react-native bundle --platform android --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/build/intermediates/res/merged/release/
4 - cd android && ./gradlew assembleRelease



as a user i need to register to the application
as a user i need to login to the application
as a user i nedd to find other users of the app
as a user i need to start conversation with other users
as a user i need to find all conversation i have 

register, login, users, chat, messages, call

register a user

frontend
create an interface for register a user

backedn

login to the application.
find users
create chat
find chat
delete chat
view chat
create a message
view message
delete message
start call
accept call
refused call
create notification
find notification
view notiffication
delete notification
