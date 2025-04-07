// Libraries Imports
import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
// Local Imports
import { auth, onAuthStateChanged } from "../Config/firebase.config";

const UserContext = createContext();

const useUserContext = () => useContext(UserContext);

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const getCurrentUser = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  };

  useEffect(() => {
    getCurrentUser();
  }, [user]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { useUserContext, UserContextProvider };
