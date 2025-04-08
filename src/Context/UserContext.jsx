// Libraries Imports
import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
// Local Imports
import { auth, onAuthStateChanged } from "../Config/firebase.config";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUser, setIsUser] = useState(false);

  const getCurrentUser = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsUser(true);
      } else {
        setUser(null);
        setIsUser(false);
      }
    });
  };

  useEffect(() => {
    getCurrentUser();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, isUser }}>
      {children}
    </UserContext.Provider>
  );
};

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { UserContext, UserContextProvider };
