# Convo Chat

A polished, responsive demo chat app built with plain HTML, CSS, and vanilla JavaScript. It runs entirely in your browser and does not connect to a server.

## Run with VS Code Live Server

1. Open this folder in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. Open `index.html`, then select **Go Live** in the status bar (or right-click the file and choose **Open with Live Server**).
4. The app opens in your browser. You can also open `index.html` directly, but Live Server provides a more consistent local development experience.

## Features

- Six seeded contacts with initials, message previews, timestamps, and unread badges.
- Desktop contacts and conversation panels; mobile contacts-first navigation with a back button.
- Search contacts as you type.
- Select a conversation to mark it read.
- Send a message with the button or Enter; use Shift+Enter for a line break.
- Clear a conversation only after confirming the action.
- Conversations, unread counts, and the selected contact persist in browser LocalStorage.
- Accessible labels, keyboard focus styles, live status feedback, and empty states.
- Responsive layouts, reduced-motion support, and safe text rendering for messages.

## Limitations

- This is a local-only interface demo: messages are not delivered to anyone, and there is no real-time messaging, account, or backend.
- Seed conversations are sample content. Sending a message only adds it to the conversation stored in this browser.
- Data is specific to the browser and device. Clearing site data removes saved conversations.

## Test checklist

- [ ] Open the app and confirm the contacts and initial sample messages appear.
- [ ] Search for a contact, try a no-match query, and clear the search.
- [ ] Select different contacts and confirm their unread badges clear.
- [ ] Send a message with Enter and the Send button; verify blank messages are not sent.
- [ ] Enter a line break with Shift+Enter and confirm it is retained in the sent message.
- [ ] Reload the page and confirm messages and selected conversation persist.
- [ ] Clear a conversation, cancel once, then confirm the action and verify the empty state.
- [ ] At a narrow mobile width, confirm contacts show first and Back returns to the list.
- [ ] Use Tab and Enter to navigate; confirm visible focus and accessible button names.
- [ ] With browser developer tools, verify the page has no console errors and that message text is rendered as text.
