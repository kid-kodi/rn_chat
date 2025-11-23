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

iPhone 11 Pro Max: 6.5-inch Super Retina XDR display
iPhone XS Max: 6.5-inch Super Retina display
iPhone XR: Also has a 6.5-inch display 

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



[
    {
      id: 1,
      name: 'Alice Johnson',
      chatName: 'Alice Johnson',
      isGroup: false,
      avatar: null,
      lastMessage: 'Hey, how are you?',
      lastMessageStatus: 'read',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 min ago
      unread: 0,
      users: [{firstName: 'Alice', lastName: 'Johnson'}],
    },
    {
      id: 2,
      name: 'Project Team',
      chatName: 'Project Team',
      isGroup: true,
      avatar: null,
      lastMessage: "Let's meet at 3pm.",
      lastMessageStatus: 'delivered',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      unread: 3,
      users: [
        {firstName: 'Bob', lastName: 'Smith'},
        {firstName: 'Carol', lastName: 'Lee'},
      ],
    },
    {
      id: 3,
      name: 'Bob Smith',
      chatName: 'Bob Smith',
      isGroup: false,
      avatar: null,
      lastMessage: 'See you soon!',
      lastMessageStatus: 'sent',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      unread: 1,
      users: [{firstName: 'Bob', lastName: 'Smith'}],
    },
    {
      id: 4,
      name: 'Carol Lee',
      chatName: 'Carol Lee',
      isGroup: false,
      avatar: null,
      lastMessage: 'Can you send the file?',
      lastMessageStatus: 'delivered',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      unread: 0,
      users: [{firstName: 'Carol', lastName: 'Lee'}],
    },
    {
      id: 5,
      name: 'Family Group',
      chatName: 'Family Group',
      isGroup: true,
      avatar: null,
      lastMessage: 'Dinner at 7?',
      lastMessageStatus: 'read',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      unread: 2,
      users: [
        {firstName: 'Alice', lastName: 'Johnson'},
        {firstName: 'Bob', lastName: 'Smith'},
        {firstName: 'Carol', lastName: 'Lee'},
      ],
    },
    {
      id: 6,
      name: 'David Kim',
      chatName: 'David Kim',
      isGroup: false,
      avatar: null,
      lastMessage: 'Thanks!',
      lastMessageStatus: 'sent',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      unread: 0,
      users: [{firstName: 'David', lastName: 'Kim'}],
    },
    {
      id: 7,
      name: 'Eve Martinez',
      chatName: 'Eve Martinez',
      isGroup: false,
      avatar: null,
      lastMessage: 'Let me know.',
      lastMessageStatus: 'read',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      unread: 0,
      users: [{firstName: 'Eve', lastName: 'Martinez'}],
    },
    {
      id: 8,
      name: 'Work Buddies',
      chatName: 'Work Buddies',
      isGroup: true,
      avatar: null,
      lastMessage: 'Lunch break?',
      lastMessageStatus: 'delivered',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(), // 15 hours ago
      unread: 4,
      users: [
        {firstName: 'Alice', lastName: 'Johnson'},
        {firstName: 'David', lastName: 'Kim'},
      ],
    },
    {
      id: 9,
      name: 'Frank Zhang',
      chatName: 'Frank Zhang',
      isGroup: false,
      avatar: null,
      lastMessage: 'See you tomorrow.',
      lastMessageStatus: 'sent',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
      unread: 0,
      users: [{firstName: 'Frank', lastName: 'Zhang'}],
    },
    {
      id: 10,
      name: 'Grace Hopper',
      chatName: 'Grace Hopper',
      isGroup: false,
      avatar: null,
      lastMessage: 'Happy Birthday!',
      lastMessageStatus: 'read',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      unread: 0,
      users: [{firstName: 'Grace', lastName: 'Hopper'}],
    },
    {
      id: 11,
      name: 'Holiday Plans',
      chatName: 'Holiday Plans',
      isGroup: true,
      avatar: null,
      lastMessage: 'Tickets booked!',
      lastMessageStatus: 'delivered',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      unread: 5,
      users: [
        {firstName: 'Eve', lastName: 'Martinez'},
        {firstName: 'Grace', lastName: 'Hopper'},
      ],
    },
    {
      id: 12,
      name: 'Ivy Chen',
      chatName: 'Ivy Chen',
      isGroup: false,
      avatar: null,
      lastMessage: 'Let’s catch up soon.',
      lastMessageStatus: 'sent',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
      unread: 0,
      users: [{firstName: 'Ivy', lastName: 'Chen'}],
    },
    {
      id: 13,
      name: 'Jason Bourne',
      chatName: 'Jason Bourne',
      isGroup: false,
      avatar: null,
      lastMessage: 'Mission accomplished.',
      lastMessageStatus: 'read',
      lastMessageTime: new Date(
        Date.now() - 1000 * 60 * 60 * 120,
      ).toISOString(), // 5 days ago
      unread: 0,
      users: [{firstName: 'Jason', lastName: 'Bourne'}],
    },
  ]