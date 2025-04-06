import { useState, useEffect, useCallback } from "react";
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
  VoiceCallButton,
  VideoCallButton,
  ConversationHeader,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
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
} from "../../config/firebase.config";
import { useUserContext } from "../../Context/UserContext";
import { formatDistance } from "date-fns";
import { RiLogoutCircleLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import UserModalComp from "../LoginUserModal/UserModal";
import { Tooltip } from "react-tooltip";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineDeleteSweep } from "react-icons/md";
import FloatBtnComp from "../FloatButton/FloatBtn";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
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
  const [value] = useDebounce(messageInputValue, 2000);
  const [open, setOpen] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const user = useUserContext();

  useEffect(() => {
    if (user) {
      getCurrentUsersChats();
      getCurrentLoginUser();
    }
  }, [user]);

  useEffect(() => {
    const chatIdParam = searchParams.get("chatId");
    if (chatIdParam) {
      const selectedChat = chats.find((chat) => chat.id === chatIdParam);
      if (selectedChat) {
        setCurrentChat(selectedChat);
        getAllMessages(); // Fetch messages for the selected chat
      }
    } else {
      // Default to the first chat if no chatIdParam is present
      if (chats.length > 0) {
        const defaultChat = chats[0];
        setCurrentChat(defaultChat);
        searchParams.set("chatId", defaultChat.id);
        navigate(`/chat/?${searchParams}`);
        getAllMessages(); // Fetch messages for the default chat
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
      where("userSignupEmail", "!=", user.email)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
              src={`https://ui-avatars.com/api/?background=random&color=fff&name=${loginUser.userName}`}
              name={`${loginUser.userName}`}
            />
            <ConversationHeader.Content userName={`${loginUser.userName}`} />
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
            {filteredChats.map((v) => (
              <Conversation
                style={{
                  backgroundColor:
                    searchParams.get("chatId") === v.id ? "#f3f3f3" : "",
                }}
                key={v.id}
                onClick={() => {
                  handleConversationClick();
                  setCurrentChat(v);
                  searchParams.set("chatId", v.id);
                  navigate(`/chat/?${searchParams}`);
                }}
              >
                <Avatar
                  src={`https://ui-avatars.com/api/?background=random&color=fff&name=${v.userName}`}
                  name={`${v.userName}`}
                  status="available"
                  style={conversationAvatarStyle}
                />
                <Conversation.Content
                  name={`${v.userName}`}
                  info={`${v?.lastMessages?.[chatId(v.id)]?.lastMessage || ""}`}
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
              src={`https://ui-avatars.com/api/?background=random&color=fff&name=${currentChat.userName}`}
              name={`${currentChat.userName}`}
            />
            <ConversationHeader.Content userName={`${currentChat.userName}`} />
          </ConversationHeader>
          <MessageList
            typingIndicator={
              <TypingIndicator content={`${loginUser.userName}`} />
            }
          >
            {chatMessages.length === 0 ? (
              <Message
                className="text-2xl font-medium text-center flex justify-center items-center h-screen"
                model={{
                  message: `Start a Conversation! Connect and  chat with your friends
                anytime.`,
                }}
              />
            ) : (
              ""
            )}
            {chatMessages.map((v, i) => (
              <Message key={i} model={v}>
                <Avatar
                  src={`https://ui-avatars.com/api/?background=random&color=fff&name=${
                    user.uid === v.sender
                      ? loginUser.userName
                      : currentChat.userName
                  }`}
                />
                <Message.Footer
                  sender={
                    v.sender === user.uid && (
                      <MdOutlineDeleteSweep
                        size={20}
                        data-tooltip-id="deleteTooltip"
                        data-tooltip-content="Delete chat"
                        onClick={() => handleDelete(v.id)}
                        cursor="pointer"
                        title="Delete Message"
                      />
                    )
                  }
                  sentTime={
                    v.sending
                      ? "sending..."
                      : formatDistance(new Date(v.sentTime), new Date(), {
                          addSuffix: true,
                        })
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
      <UserModalComp open={open} setOpen={setOpen} handleOpen={handleOpen} />
    </div>
  );
}

export default UserChat;
