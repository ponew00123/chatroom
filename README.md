# React Firebase Chatroom

Software Studio 2023 Spring Midterm Project. This project is a responsive private chatroom built with React and Firebase Authentication/Realtime Database.

## Implemented features

| Requirement | Status | Notes |
| --- | :---: | --- |
| Email sign up / sign in | ✅ | Firebase Email/Password authentication |
| Firebase Hosting | ✅ | [midterm-f2199.web.app](https://midterm-f2199.web.app) |
| Authenticated database read/write | ✅ | Room and message rules are in `database.rules.json` |
| Responsive Web Design | ✅ | Desktop two-column layout and mobile layout under 760px |
| Private chatrooms | ✅ | A room can be created for two registered users |
| Message history and realtime updates | ✅ | Messages are loaded and synchronized with Firebase listeners |
| React | ✅ | Components and UI state are implemented in `index.js` and `public/src/component/` |
| Google sign in | ✅ | Enable Google provider in Firebase Console before use |
| CSS transition effects | ✅ | Login panel and button transitions are defined in `public/index.css` |
| Input safety | ✅ | Messages are rendered as React text nodes instead of `innerHTML` |
| Browser notification | ❌ | Not implemented |
| Bonus features (images, video, GIF, chatbot, block/unsend/search) | ❌ | Not implemented |

## How to use

1. Open the [deployed website](https://midterm-f2199.web.app).
2. Register or sign in with Email/Password. Google sign in is also available when enabled in Firebase Authentication.
3. To create a private room, enter a room name and the other user's registered Email, then click **建立私人聊天室**.
4. The invited user must have signed in at least once so that their Firebase user profile exists.
5. Select a room from the left panel. Messages sent by you appear on the right; messages from the other member appear on the left.
6. Click **登出** to sign out.

## Data model

```text
users/{uid}
userRooms/{uid}/{roomId}
rooms/{roomId}
  members/{uid}
  messages/{messageId}
```

Only members of a room can read the room and add messages. Message text is rendered through React, which prevents submitted HTML from being interpreted as markup.

## Local development

```powershell
npm install
npm run build
```

The Webpack output is written to `public/compiled.js`, which is the file served by Firebase Hosting.

## Deployment

```powershell
firebase login
firebase deploy --only hosting,database
```

The Firebase project is configured in `.firebaserc` and the Hosting public directory is `public`.
