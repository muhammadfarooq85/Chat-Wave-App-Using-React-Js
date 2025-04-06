import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";
import UserSignupPage from "../Pages/SignupLogin/SignupLogin";
import ChatPage from "../Pages/Chat/Chat";
import { useEffect, useState } from "react";
import { onAuthStateChanged, auth } from "../config/firebase.config";
import LoaderComp from "../Components/Loader/Loader";

function RouterComp() {
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUser(true);
      } else {
        setIsUser(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <LoaderComp />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserSignupPage />} />
        <Route
          path="/chat"
          element={isUser ? <ChatPage /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RouterComp;
