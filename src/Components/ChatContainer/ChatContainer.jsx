// Libraries Imports
import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Sidebar,
  Search,
  Conversation,
  Avatar,
  ConversationList,
  ConversationHeader,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { Tooltip } from "react-tooltip";
import { toast } from "react-toastify";
import { formatDistance } from "date-fns";
import { useDebounce } from "use-debounce";
import { IoSettingsOutline } from "react-icons/io5";
import { RiLogoutCircleLine } from "react-icons/ri";
import { MdOutlineDeleteSweep } from "react-icons/md";
// Lcoal Imports
import {
  auth,
  signOut,
  collection,
  query,
  getDoc,
  where,
  db,
  addDoc,
  onSnapshot,
  orderBy,
  updateDoc,
  serverTimestamp,
  doc,
  deleteDoc,
} from "../../Config/firebase.config";
import { UserContext } from "../../Context/UserContext";
import AccountSettingsModal from "../AccountSettingsModal/AccountSettingsModal";
import LoaderComp from "../Loader/Loader";

function UserChat() {
  const [messageInputValue, setMessageInputValue] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState({});
  const [chatContainerStyle, setChatContainerStyle] = useState({});
  const [conversationContentStyle, setConversationContentStyle] = useState({});
  const [conversationAvatarStyle, setConversationAvatarStyle] = useState({});
  const [searchStyle, setSearchStyle] = useState({});
  const [loading, setLoading] = useState(true);
  const [loginUser, setLoginUser] = useState({});
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [value] = useDebounce(messageInputValue, 4000);
  const [open, setOpen] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const { user, isUser } = useContext(UserContext);

  useEffect(() => {
    if (isUser) {
      getCurrentUsersChats();
      getCurrentLoginUser();
    }
  }, [isUser]);

  useEffect(() => {
    const chatIdParam = searchParams.get("chatId");
    if (chatIdParam) {
      const selectedChat = chats.find((chat) => chat.id === chatIdParam);
      if (selectedChat) {
        setCurrentChat(selectedChat);
        getAllMessages();
      }
    } else {
      if (chats.length > 0) {
        const defaultChat = chats[0];
        setCurrentChat(defaultChat);
        searchParams.set("chatId", defaultChat.id);
        navigate(`/chat/?${searchParams}`);
        getAllMessages();
      }
    }
  }, [searchParams, chats]);

  const handleBackClick = () => setSidebarVisible(!sidebarVisible);
  const handleConversationClick = useCallback(() => {
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  }, [sidebarVisible]);

  useEffect(() => {
    if (sidebarVisible) {
      setSidebarStyle({
        display: "flex",
        flexBasis: "auto",
        width: "100%",
        maxWidth: "100%",
      });
      setConversationContentStyle({
        display: "flex",
      });
      setSearchStyle({
        display: "flex",
      });
      setConversationAvatarStyle({
        marginRight: "1em",
      });
      setChatContainerStyle({
        display: "none",
      });
    } else {
      setSidebarStyle({});
      setSearchStyle({});
      setConversationContentStyle({});
      setConversationAvatarStyle({});
      setChatContainerStyle({});
    }
  }, [
    setSearchStyle,
    sidebarVisible,
    setSidebarVisible,
    setConversationContentStyle,
    setConversationAvatarStyle,
    setSidebarStyle,
    setChatContainerStyle,
  ]);

  // Get Current Login user
  const getCurrentLoginUser = async () => {
    const currentUserDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(currentUserDocRef);
    if (docSnap.exists()) {
      setLoginUser({ ...docSnap.data(), id: docSnap.id });
      setLoading(false);
    } else {
      console.log("No such document!");
    }
  };

  // Get current Users
  const getCurrentUsersChats = async () => {
    const q = query(
      collection(db, "users"),
      where("userSignupEmail", "!=", user?.email)
    );
    onSnapshot(q, (querySnapshot) => {
      let usersChat = [];
      querySnapshot.forEach((doc) => {
        usersChat.push({ ...doc.data(), id: doc.id });
      });
      setChats(usersChat);
      // Check if we have a chatId in the params
      const chatIdParam = searchParams.get("chatId");
      if (chatIdParam) {
        const selectedChat = usersChat.find((chat) => chat.id === chatIdParam);
        if (selectedChat) {
          setCurrentChat(selectedChat);
          getAllMessages();
        }
      } else {
        if (usersChat.length > 0) {
          const defaultChat = usersChat[0];
          setCurrentChat(defaultChat);
          searchParams.set("chatId", defaultChat.id);
          navigate(`/chat/?${searchParams}`);
          getAllMessages();
        }
      }
      setLoading(false);
    });
  };

  // Getting chat id of two users
  const chatId = (currentId) => {
    if (!user || !currentId) return "";
    return user.uid < currentId
      ? `${user.uid}${currentId}`
      : `${currentId}${user.uid}`;
  };

  // Sending Message
  const onSend = async () => {
    const newMessage = {
      message: messageInputValue,
      sentTime: new Date().toISOString(),
      sender: user.uid,
      receiver: currentChat.id,
      chatId: chatId(currentChat.id),
      timeStamp: serverTimestamp(),
      sending: true,
    };

    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessageInputValue("");

    try {
      const docRef = await addDoc(collection(db, "messages"), newMessage);
      await updateDoc(doc(db, "messages", docRef.id), { sending: false });
      setChatMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.sentTime === newMessage.sentTime
            ? { ...msg, sending: false }
            : msg
        )
      );

      updateDoc(doc(db, "users", currentChat.id), {
        [`lastMessages.${chatId(currentChat.id)}`]: {
          lastMessage: newMessage.message,
          chatId: chatId(currentChat.id),
        },
      });
      updateDoc(doc(db, "users", user.uid), {
        [`lastMessages.${chatId(currentChat.id)}`]: {
          lastMessage: newMessage.message,
          chatId: chatId(currentChat.id),
        },
      });

      toast.success("Message Sent!");
    } catch (error) {
      toast.error("Message sending failed!");
    }
  };

  // Get All Messages
  const getAllMessages = async () => {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId(currentChat.id)),
      orderBy("timeStamp", "asc")
    );
    onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          ...doc.data(),
          id: doc.id,
          direction: doc.data().sender === user.uid ? "outgoing" : "incoming",
        });
      });
      setChatMessages(messages);
    });
  };

  useEffect(() => {
    if (currentChat.id) {
      getAllMessages();
    }
  }, [currentChat]);

  const setTyping = async (typing) => {
    const isTyping =
      currentChat?.isTyping?.[chatId(currentChat?.id)]?.[user?.uid];

    if (!isTyping && typing) {
      await updateDoc(doc(db, "users", currentChat?.id), {
        [`isTyping.${chatId(currentChat?.id)}.${user?.uid}`]: typing,
      });
      await updateDoc(doc(db, "users", user?.uid), {
        [`isTyping.${chatId(currentChat?.id)}.${user?.uid}`]: typing,
      });
    }
    if (!typing) {
      await updateDoc(doc(db, "users", currentChat?.id), {
        [`isTyping.${chatId(currentChat?.id)}.${user?.uid}`]: typing,
      });
      await updateDoc(doc(db, "users", user?.uid), {
        [`isTyping.${chatId(currentChat?.id)}.${user?.uid}`]: typing,
      });
    }
  };

  useEffect(() => {
    if (messageInputValue) {
      setTyping(true);
    }
    if (value === messageInputValue) {
      setTyping(false);
    }
  }, [messageInputValue, value]);

  // Modal Fn
  const handleOpen = () => setOpen(!open);

  // Deleting a message
  const handleDelete = async (messageId) => {
    try {
      await deleteDoc(doc(db, "messages", messageId));
      setChatMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
      toast.success("Message deleted!");
    } catch (error) {
      toast.error("Failed to delete message!");
    }
  };

  // Searching user
  useEffect(() => {
    if (searchUser === "") {
      setFilteredChats(chats);
    } else {
      setFilteredChats(
        chats.filter((chat) =>
          chat.userName.toLowerCase().includes(searchUser.toLowerCase())
        )
      );
    }
  }, [searchUser, chats]);

  const isTyping =
    currentChat?.isTyping?.[chatId(currentChat.id)]?.[currentChat.id];

  // Logout User
  const logout = () => {
    try {
      signOut(auth);
      toast.success("Logout successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Please try again!");
    }
  };

  // Showing loader
  if (loading) {
    return (
      <div className="loader-container">
        <LoaderComp />
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
      }}
    >
      <MainContainer responsive>
        <Sidebar position="left" scrollable={false} style={sidebarStyle}>
          <ConversationHeader>
            <Avatar
              src={`https://ui-avatars.com/api/?background=random&color=fff&name=${
                loginUser?.userName ?? "loading..."
              }`}
              name={`${loginUser?.userName ?? "loading..."}`}
            />
            <ConversationHeader.Content
              userName={`${loginUser?.userName ?? "loading..."}`}
            />
            <ConversationHeader.Actions className="flex justify-center items-center gap-2">
              <RiLogoutCircleLine
                onClick={logout}
                data-tooltip-id="logoutTooltip"
                data-tooltip-content="Logout"
                className="text-sertiary"
                cursor={"pointer"}
                data-tip
                data-for="logoutTip"
                size={30}
              />
              <Tooltip id="logoutTooltip" />
              <IoSettingsOutline
                onClick={handleOpen}
                data-tooltip-id="infoTooltip"
                data-tooltip-content="Account Settings"
                className="text-sertiary"
                cursor={"pointer"}
                size={30}
              />
              <Tooltip id="infoTooltip" />
            </ConversationHeader.Actions>
          </ConversationHeader>
          <Search
            style={searchStyle}
            placeholder="Search..."
            value={searchUser}
            onClearClick={() => setSearchUser("")}
            onChange={(e) => setSearchUser(e)}
          />
          <ConversationList>
            {filteredChats?.map((user) => (
              <Conversation
                style={{
                  backgroundColor:
                    searchParams.get("chatId") === user?.id ? "#d2d2d2" : "",
                }}
                key={user?.id}
                onClick={() => {
                  handleConversationClick();
                  setCurrentChat(user);
                  searchParams.set("chatId", user?.id);
                  navigate(`/chat/?${searchParams}`);
                }}
              >
                <Avatar
                  src={`https://ui-avatars.com/api/?background=random&color=fff&name=${user?.userName}`}
                  name={`${user?.userName ?? "loading..."}`}
                  status="available"
                  style={conversationAvatarStyle}
                />
                <Conversation.Content
                  name={`${user?.userName || "loading..."}`}
                  info={`${
                    user?.lastMessages?.[chatId(user?.id)]?.lastMessage ||
                    "No last mesage yet"
                  }`}
                  style={conversationContentStyle}
                />
              </Conversation>
            ))}
          </ConversationList>
        </Sidebar>
        <ChatContainer style={chatContainerStyle}>
          <ConversationHeader>
            <ConversationHeader.Back
              onClick={handleBackClick}
              className="backBtn"
            />
            <Avatar
              src={`https://ui-avatars.com/api/?background=random&color=fff&name=${
                currentChat?.userName || "loading..."
              }`}
              name={`${currentChat?.userName || "laoding..."}`}
            />
            <ConversationHeader.Content
              userName={`${currentChat?.userName || "loading..."}`}
            />
            <ConversationHeader.Actions>
              <h1 className="text-lg md:text-xl text-white">
                Give a star on{" "}
                <a
                  href="https://github.com/muhammadfarooq85/Chat-Wave-App-Using-React-Js"
                  target="_blank"
                >
                  Github⭐
                </a>
              </h1>
            </ConversationHeader.Actions>
          </ConversationHeader>
          <MessageList
            typingIndicator={
              isTyping ? (
                <TypingIndicator
                  content={`${
                    loginUser?.userName + " is typing" || "loading..."
                  }`}
                />
              ) : (
                false
              )
            }
          >
            {chatMessages?.length === 0 ? (
              <Message
                className="text-2xl font-bold text-center flex justify-center items-center h-screen"
                model={{
                  message: `Start a quick conversation with your friends, relatives etc. Please share this app.`,
                }}
              />
            ) : (
              ""
            )}
            {chatMessages.map((chatMessage, i) => (
              <Message key={i} model={chatMessage}>
                <Avatar
                  src={`https://ui-avatars.com/api/?background=random&color=fff&name=${
                    user?.uid === chatMessage?.sender
                      ? loginUser?.userName
                      : currentChat?.userName
                  }`}
                />
                <Message.Footer
                  sender={
                    chatMessage?.sender === user?.uid && (
                      <MdOutlineDeleteSweep
                        size={20}
                        data-tooltip-id="deleteTooltip"
                        data-tooltip-content="Delete chat"
                        onClick={() => handleDelete(chatMessage?.id)}
                        cursor="pointer"
                        title="Delete message"
                      />
                    )
                  }
                  sentTime={
                    chatMessage.sending
                      ? "sending..."
                      : formatDistance(
                          new Date(chatMessage.sentTime),
                          new Date(),
                          {
                            addSuffix: true,
                          }
                        )
                  }
                />
              </Message>
            ))}
            <Tooltip id="deleteTooltip" />
          </MessageList>
          <MessageInput
            placeholder="Type message here..."
            value={messageInputValue}
            onChange={(val) => setMessageInputValue(val)}
            onSend={onSend}
          />
        </ChatContainer>
      </MainContainer>
      <AccountSettingsModal
        open={open}
        setOpen={setOpen}
        handleOpen={handleOpen}
      />
    </div>
  );
}

export default UserChat;
