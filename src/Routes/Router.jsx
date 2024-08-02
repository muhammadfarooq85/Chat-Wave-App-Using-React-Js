import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserSignupPage from "../Pages/SignupLogin/SignupLogin";

function RouterComp() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserSignupPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default RouterComp;
