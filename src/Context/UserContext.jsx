import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged } from "../config/firebase.config";

const UserContext = createContext();

const useUserContext = () => useContext(UserContext);

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const getCurrentUser = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        console.log("Please login!");
      }
    });
  };

  useEffect(() => {
    getCurrentUser();
  }, [user]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export { useUserContext, UserContextProvider };
