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
  Loader,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { formatDistance } from "date-fns";
import { RiLogoutCircleLine, RiInformationLine } from "react-icons/ri";
import { IoChevronBackSharp } from "react-icons/io5";
import {
  auth,
  signOut,
  collection,
  getDocs,
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
} from "../../config/firebase.config";
import { useUserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import UserModalComp from "../LoginUserModal/UserModal";

function UserChat() {
  const [messageInputValue, setMessageInputValue] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState({});
  const [chatContainerStyle, setChatContainerStyle] = useState({});
  const [conversationContentStyle, setConversationContentStyle] = useState({});
  const [conversationAvatarStyle, setConversationAvatarStyle] = useState({});
  const [loading, setLoading] = useState(true);
  const [loginUser, setLoginUser] = useState({});
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [value] = useDebounce(messageInputValue, 2000);
  const [open, setOpen] = useState(false);
  const user = useUserContext();

  useEffect(() => {
    if (user) {
      getCurrentUsersChats();
      getCurrentLoginUser();
    }
  }, [user]);

  const handleBackClick = () => setSidebarVisible(!sidebarVisible);
  const handleConversationClick = useCallback(() => {
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  }, [sidebarVisible, setSidebarVisible]);

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
      setConversationAvatarStyle({
        marginRight: "1em",
      });
      setChatContainerStyle({
        display: "none",
      });
    } else {
      setSidebarStyle({});
      setConversationContentStyle({});
      setConversationAvatarStyle({});
      setChatContainerStyle({});
    }
  }, [
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
      console.log("Document data:", docSnap.data());
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
      searchParams.set("chatId", usersChat[0].id);
      navigate(`/chat/?${searchParams}`);
      setChats(usersChat);
      setCurrentChat(usersChat[0]);
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
  const onSend = () => {
    setMessageInputValue("");
    try {
      addDoc(collection(db, "messages"), {
        message: messageInputValue,
        sentTime: new Date().toISOString(),
        sender: user.uid,
        receiver: currentChat.id,
        chatId: chatId(currentChat.id),
        timeStamp: serverTimestamp(),
      });

      updateDoc(doc(db, "users", currentChat.id), {
        [`lastMessages.${chatId(currentChat.id)}`]: {
          lastMessage: messageInputValue,
          chatId: chatId(currentChat.id),
        },
      });
      updateDoc(doc(db, "users", user.uid), {
        [`lastMessages.${chatId(currentChat.id)}`]: {
          lastMessage: messageInputValue,
          chatId: chatId(currentChat.id),
        },
      });
      toast.success("Message Sent!");
    } catch (error) {
      console.log("Please try again.", error);
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
    getAllMessages();
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

  const handleOpen = () => setOpen(!open);

  // Showing loader
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }
  console.log("chats", chats);

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
            <ConversationHeader.Actions className="flex justify-center items-center gap-1">
              <RiLogoutCircleLine
                onClick={logout}
                className="text-sertiary"
                cursor={"pointer"}
                size={30}
              />
              <RiInformationLine
                onClick={handleOpen}
                className="text-sertiary"
                cursor={"pointer"}
                size={30}
              />
            </ConversationHeader.Actions>
          </ConversationHeader>
          <Search placeholder="Search..." />
          <ConversationList>
            {chats.map((v) => (
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
                  sentTime={formatDistance(new Date(v.sentTime), new Date(), {
                    addSuffix: true,
                  })}
                />
              </Message>
            ))}
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
