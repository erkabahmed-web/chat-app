"use strict";

const STORAGE_KEY = "convo-chat-state-v1";
const MAX_MESSAGE_LENGTH = 2000;

const contacts = [
  { id: "maya", name: "Maya Chen", color: "linear-gradient(145deg, #f3a98f, #d87883)", unread: 2 },
  { id: "noah", name: "Noah Williams", color: "linear-gradient(145deg, #81c9bd, #49a99b)", unread: 0 },
  { id: "amina", name: "Amina Patel", color: "linear-gradient(145deg, #bba3ea, #8974d0)", unread: 1 },
  { id: "leo", name: "Leo Martin", color: "linear-gradient(145deg, #f3c878, #df9951)", unread: 0 },
  { id: "sofia", name: "Sofia Rivera", color: "linear-gradient(145deg, #85b5e9, #5686cb)", unread: 0 },
  { id: "oliver", name: "Oliver Brooks", color: "linear-gradient(145deg, #dd9bb8, #c36c94)", unread: 0 }
];

const now = Date.now();
const minutesAgo = (minutes) => new Date(now - minutes * 60_000).toISOString();
const initialConversations = {
  maya: [
    { sender: "them", text: "Hey! How was the little bookstore you found?", timestamp: minutesAgo(178) },
    { sender: "me", text: "So lovely. I could have stayed there all afternoon 📚", timestamp: minutesAgo(165) },
    { sender: "them", text: "We should go together next time!", timestamp: minutesAgo(24) }
  ],
  noah: [
    { sender: "them", text: "I sent over the photos from Saturday. The sunset came out so well!", timestamp: minutesAgo(392) },
    { sender: "me", text: "Just saw them — that golden light is unreal.", timestamp: minutesAgo(375) }
  ],
  amina: [
    { sender: "them", text: "Found a new recipe for that lemon cake you liked 🍋", timestamp: minutesAgo(1440) },
    { sender: "me", text: "Please send it my way when you get a chance!", timestamp: minutesAgo(1418) }
  ],
  leo: [
    { sender: "me", text: "Are we still on for the gallery this weekend?", timestamp: minutesAgo(2880) },
    { sender: "them", text: "Absolutely. I bookmarked the new exhibition too.", timestamp: minutesAgo(2822) }
  ],
  sofia: [
    { sender: "them", text: "Thanks again for helping me move those plants 🌿", timestamp: minutesAgo(10080) },
    { sender: "me", text: "Anytime! Your balcony is going to look amazing.", timestamp: minutesAgo(10032) }
  ],
  oliver: [
    { sender: "them", text: "Have you tried the new coffee place on Pine Street?", timestamp: minutesAgo(20160) }
  ]
};

const appShell = document.querySelector(".app-shell");
const contactList = document.querySelector("#contact-list");
const contactSearch = document.querySelector("#contact-search");
const contactCount = document.querySelector("#contact-count");
const contactsEmpty = document.querySelector("#contacts-empty");
const emptyView = document.querySelector("#empty-view");
const conversationView = document.querySelector("#conversation-view");
const activeAvatar = document.querySelector("#active-avatar");
const activeName = document.querySelector("#active-name");
const messageList = document.querySelector("#message-list");
const messageEmpty = document.querySelector("#message-empty");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const clearButton = document.querySelector("#clear-button");
const backButton = document.querySelector("#back-button");
const appStatus = document.querySelector("#app-status");

const state = loadState();
let activeContactId = state.activeContactId;
let storageWarning = state.warning;

function getContact(contactId) {
  return contacts.find((contact) => contact.id === contactId) || null;
}

function createSeedConversations() {
  return Object.fromEntries(
    Object.entries(initialConversations).map(([contactId, messages]) => [
      contactId,
      messages.map((message) => ({ ...message }))
    ])
  );
}

function isValidMessage(message) {
  return message &&
    (message.sender === "me" || message.sender === "them") &&
    typeof message.text === "string" &&
    message.text.length <= MAX_MESSAGE_LENGTH &&
    typeof message.timestamp === "string" &&
    !Number.isNaN(Date.parse(message.timestamp));
}

function loadState() {
  const fallback = {
    conversations: createSeedConversations(),
    unread: Object.fromEntries(contacts.map((contact) => [contact.id, contact.unread])),
    activeContactId: null,
    warning: ""
  };

  let saved;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return fallback;
    saved = JSON.parse(raw);
  } catch {
    return { ...fallback, warning: "Saved chat data could not be read. Fresh demo conversations are shown." };
  }

  if (!saved || saved.version !== 1 || !saved.conversations || typeof saved.conversations !== "object") {
    return { ...fallback, warning: "Saved chat data was invalid. Fresh demo conversations are shown." };
  }

  const conversations = {};
  const unread = {};
  for (const contact of contacts) {
    const messages = saved.conversations[contact.id];
    if (!Array.isArray(messages) || !messages.every(isValidMessage)) {
      return { ...fallback, warning: "Saved chat data was invalid. Fresh demo conversations are shown." };
    }
    conversations[contact.id] = messages.map(({ sender, text, timestamp }) => ({ sender, text, timestamp }));

    const unreadCount = saved.unread && saved.unread[contact.id];
    unread[contact.id] = Number.isInteger(unreadCount) && unreadCount >= 0 ? unreadCount : 0;
  }

  return {
    conversations,
    unread,
    activeContactId: getContact(saved.activeContactId) ? saved.activeContactId : null,
    warning: ""
  };
}

function saveState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      conversations: state.conversations,
      unread: state.unread,
      activeContactId
    }));
    storageWarning = "";
    return true;
  } catch {
    storageWarning = "Changes could not be saved in this browser. Check your storage settings.";
    announce(storageWarning);
    return false;
  }
}

function announce(message) {
  appStatus.textContent = "";
  window.setTimeout(() => {
    appStatus.textContent = message;
  }, 20);
}

function getInitials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function formatMessageTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(timestamp));
}

function getLastMessage(contactId) {
  const messages = state.conversations[contactId];
  return messages[messages.length - 1] || null;
}

function renderContacts() {
  const query = contactSearch.value.trim().toLocaleLowerCase();
  const visibleContacts = contacts.filter((contact) => contact.name.toLocaleLowerCase().includes(query));
  contactList.replaceChildren();
  contactCount.textContent = `${visibleContacts.length}`;
  contactsEmpty.hidden = visibleContacts.length !== 0;

  for (const contact of visibleContacts) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `contact-item${contact.id === activeContactId ? " is-active" : ""}`;
    item.setAttribute("aria-label", `${contact.name}${state.unread[contact.id] ? `, ${state.unread[contact.id]} unread messages` : ""}`);
    item.setAttribute("aria-current", contact.id === activeContactId ? "true" : "false");

    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.style.background = contact.color;
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = getInitials(contact.name);

    const copy = document.createElement("span");
    copy.className = "contact-copy";
    const topline = document.createElement("span");
    topline.className = "contact-topline";
    const name = document.createElement("span");
    name.className = "contact-name";
    name.textContent = contact.name;
    const time = document.createElement("span");
    time.className = "contact-time";
    const lastMessage = getLastMessage(contact.id);
    time.textContent = lastMessage ? formatTime(lastMessage.timestamp) : "";
    topline.append(name, time);

    const bottomline = document.createElement("span");
    bottomline.className = "contact-bottomline";
    const preview = document.createElement("span");
    preview.className = "contact-preview";
    preview.textContent = lastMessage ? `${lastMessage.sender === "me" ? "You: " : ""}${lastMessage.text.replace(/\s+/g, " ")}` : "No messages yet";
    bottomline.append(preview);

    if (state.unread[contact.id] > 0) {
      const badge = document.createElement("span");
      badge.className = "unread-badge";
      badge.textContent = `${state.unread[contact.id]}`;
      badge.setAttribute("aria-hidden", "true");
      bottomline.append(badge);
    }

    copy.append(topline, bottomline);
    item.append(avatar, copy);
    item.addEventListener("click", () => selectContact(contact.id));
    contactList.append(item);
  }
}

function renderMessages() {
  const messages = state.conversations[activeContactId] || [];
  messageList.replaceChildren();
  messageEmpty.hidden = messages.length !== 0;
  messageList.hidden = messages.length === 0;

  for (const message of messages) {
    const row = document.createElement("div");
    row.className = `message-row${message.sender === "me" ? " is-sent" : ""}`;
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = message.text;
    const time = document.createElement("time");
    time.className = "message-time";
    time.dateTime = message.timestamp;
    time.textContent = formatMessageTime(message.timestamp);
    row.append(bubble, time);
    messageList.append(row);
  }
  messageList.scrollTop = messageList.scrollHeight;
}

function renderConversation() {
  const contact = getContact(activeContactId);
  const hasSelection = Boolean(contact);
  emptyView.hidden = hasSelection;
  conversationView.hidden = !hasSelection;
  appShell.classList.toggle("show-conversation", hasSelection);
  if (!contact) return;

  activeAvatar.textContent = getInitials(contact.name);
  activeAvatar.style.background = contact.color;
  activeName.textContent = contact.name;
  messageInput.value = "";
  updateSendButton();
  renderMessages();
}

function selectContact(contactId) {
  if (!getContact(contactId)) return;
  activeContactId = contactId;
  state.unread[contactId] = 0;
  saveState();
  renderContacts();
  renderConversation();
  messageInput.focus();
}

function updateSendButton() {
  sendButton.disabled = !messageInput.value.trim();
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !activeContactId) return;
  if (text.length > MAX_MESSAGE_LENGTH) {
    announce(`Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
    return;
  }

  state.conversations[activeContactId].push({
    sender: "me",
    text,
    timestamp: new Date().toISOString()
  });
  saveState();
  messageInput.value = "";
  messageInput.style.height = "";
  updateSendButton();
  renderMessages();
  renderContacts();
  messageInput.focus();
}

function clearConversation() {
  const contact = getContact(activeContactId);
  if (!contact) return;
  const confirmed = window.confirm(`Clear the conversation with ${contact.name}? This cannot be undone.`);
  if (!confirmed) return;
  state.conversations[contact.id] = [];
  state.unread[contact.id] = 0;
  saveState();
  renderMessages();
  renderContacts();
  announce(`Conversation with ${contact.name} cleared.`);
}

function showContacts() {
  appShell.classList.remove("show-conversation");
  contactList.querySelector(".contact-item.is-active")?.focus();
}

contactSearch.addEventListener("input", renderContacts);
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 130)}px`;
  updateSendButton();
});
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    sendMessage();
  }
});
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});
clearButton.addEventListener("click", clearConversation);
backButton.addEventListener("click", showContacts);

renderContacts();
renderConversation();
if (activeContactId && window.matchMedia("(max-width: 760px)").matches) {
  appShell.classList.remove("show-conversation");
}
if (storageWarning) announce(storageWarning);
