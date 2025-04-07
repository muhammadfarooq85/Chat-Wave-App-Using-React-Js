// Libraries Imports
import { useState, useEffect, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
// Local Imports
import { onAuthStateChanged, auth } from "../Config/firebase.config";
import LoaderComp from "../Components/Loader/Loader";
const SignupLoginPage = lazy(() => import("../Pages/SignupLogin/SignupLogin"));
const ChatPage = lazy(() => import("../Pages/Chat/Chat"));

function RouterComp() {
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(true);
  console.log("Hello...");

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
    <Suspense
      fallback={
        <div className="loader-container">
          <LoaderComp />
        </div>
      }
    >
      <Routes>
        <Route
          path="/"
          element={isUser ? <Navigate to="/chat" /> : <SignupLoginPage />}
        />
        <Route
          path="/chat"
          element={isUser ? <ChatPage /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default RouterComp;
