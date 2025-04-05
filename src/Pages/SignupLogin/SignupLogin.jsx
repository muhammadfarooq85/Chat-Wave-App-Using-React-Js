import React, { useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import InputComp from "../../Components/Input/InputComp";
import ButtonComp from "../../Components/Button/ButtonComp";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  setDoc,
  doc,
} from "../../config/firebase.config";
import { toast } from "react-toastify";
import { SiGnuprivacyguard } from "react-icons/si";
import { AiOutlineLogin } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import FloatBtnComp from "../../Components/FloatButton/FloatBtn";

function UserSignupPage() {
  const [type, setType] = useState("Sign up");
  const navigate = useNavigate();

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: errorsSignUp },
  } = useForm();

  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: errorsSignIn },
  } = useForm();

  //Registering User
  const onSubmitSignUp = async (data) => {
    let { userName, userSignupEmail, userSignupPassword } = data;
    await createUserWithEmailAndPassword(
      auth,
      userSignupEmail,
      userSignupPassword
    )
      .then(async (userCredential) => {
        const res = userCredential.user;
        await setDoc(doc(db, "users", res.uid), { ...data, userUid: res.uid });
        toast.success("You are registered successfully!");
        setType("Sign in");
        userName = "";
        userSignupPassword = "";
        userSignupEmail = "";
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === "auth/email-already-in-use") {
          toast.error("Email already registered. Please login!");
          return;
        }
        toast.error("Please try again.");
        console.log(error);
      });
  };

    //Sign in user
    const onSubmitSignIn = async (data) => {
      let { userSigninEmail, userSigninPassword } = data;
      await signInWithEmailAndPassword(auth, userSigninEmail, userSigninPassword)
        .then((userCredential) => {
          const user = userCredential.user;
          toast.success("Sign-in successful!");
          navigate("/chat");
          userSigninEmail = "";
          userSigninPassword = "";
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          toast.error("Invalid password or email.");
        });
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 ml-10 mr-10">
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-2xl overflow-hidden mainForm">
        <div
          className="hidden md:block w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486848538113-ce1a4923fbc5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fEFic3RyYWN0JTIwQmFja2dyb3VuZCUyMGNoYXR8ZW58MHx8MHx8fDA%3D')`,
          }}
        ></div>
        <div className="w-full md:w-1/2 p-8 formPadding">
          <Card className="p-4" shadow={false}>
            <div className="mb-4">
              {type === "Sign up" ? (
                <SiGnuprivacyguard color="black " size={40} />
              ) : (
                <AiOutlineLogin color="black " size={40} />
              )}
            </div>
            <Typography className="font-bold text-4xl text-black">
              {type}
            </Typography>
            <Typography className="mt-2">
              {type === "Sign up" ? (
                <span className="text-black text-lg font-medium">
                  Create an Account and start your chat.
                </span>
              ) : (
                <span className="text-black text-xl font-medium">
                  Welcome back! Please login to continue.
                </span>
              )}
            </Typography>
            {type === "Sign up" && (
              <form
                className="mt-8 mb-2 w-full"
                onSubmit={handleSubmitSignUp(onSubmitSignUp)}
              >
                <div className="mb-4 flex flex-col gap-2">
                  <Typography
                    variant="h6"
                    className="mb-1 text-certiary font-bold"
                  >
                    Your Name
                  </Typography>
                  <InputComp
                    inputType="text"
                    inputPlaceholder="Type user name"
                    {...registerSignUp("userName", {
                      required: "Name is required.",
                    })}
                  />
                  {errorsSignUp.userName && (
                    <Typography color="red" className="text-sm font-medium">
                      {errorsSignUp.userName.message}
                    </Typography>
                  )}
                  <Typography className="mb-1 font-bold text-certiary ">
                    Your Email
                  </Typography>
                  <InputComp
                    inputType="email"
                    inputPlaceholder="Type email"
                    {...registerSignUp("userSignupEmail", {
                      required: "Email is required.",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                        message: "Invalid email address.",
                      },
                    })}
                  />
                  {errorsSignUp.userSignupEmail && (
                    <Typography color="red" className="text-sm font-medium">
                      {errorsSignUp.userSignupEmail.message}
                    </Typography>
                  )}
                  <Typography className="mb-1 font-bold text-certiary">
                    Password
                  </Typography>
                  <InputComp
                    inputType="password"
                    inputPlaceholder="Type password"
                    {...registerSignUp("userSignupPassword", {
                      required: "Password is required.",
                      pattern: {
                        value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                        message:
                          "Password must be at least 8 to 20 characters long. It must be only letters, special characters and numbers.",
                      },
                    })}
                  />
                  {errorsSignUp.userSignupPassword && (
                    <Typography color="red" className="text-sm font-medium">
                      {errorsSignUp.userSignupPassword.message}
                    </Typography>
                  )}
                </div>
                <ButtonComp title="Sign Up" btnType="submit" />
                <Typography className="mt-4 text-center text-certiary font-normal">
                  Already have an account?
                  <a
                    className="ml-1 cursor-pointer text-certiary font-bold"
                    onClick={() => setType("Sign in")}
                  >
                    Sign in
                  </a>
                </Typography>
              </form>
            )}
            {type === "Sign in" && (
              <form
                className="mt-8 mb-2 w-full"
                onSubmit={handleSubmitSignIn(onSubmitSignIn)}
              >
                <div className="mb-4 flex flex-col gap-2">
                  <Typography className="mb-1 text-certiary font-bold">
                    Your Email
                  </Typography>
                  <InputComp
                    inputType="email"
                    inputPlaceholder="Type email"
                    {...registerSignIn("userSigninEmail", {
                      required: "Email is required.",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                        message: "Invalid email address.",
                      },
                    })}
                  />
                  {errorsSignIn.userSigninEmail && (
                    <Typography color="red" className="text-sm font-medium">
                      {errorsSignIn.userSigninEmail.message}
                    </Typography>
                  )}
                  <Typography className="mb-1 text-certiary font-bold">
                    Password
                  </Typography>
                  <InputComp
                    inputType="password"
                    inputPlaceholder="Type password"
                    {...registerSignIn("userSigninPassword", {
                      required: "Password is required.",
                      minLength: {
                        message: "Invalid password",
                      },
                    })}
                  />
                  {errorsSignIn.userSigninPassword && (
                    <Typography color="red" className="text-sm font-medium">
                      {errorsSignIn.userSigninPassword.message}
                    </Typography>
                  )}
                </div>
                <ButtonComp title="Sign In" btnType="submit" />
                <Typography className="mt-4 text-certiary text-center font-normal">
                  Don't have an account?
                  <a
                    className="ml-1 cursor-pointer text-certiary font-bold"
                    onClick={() => setType("Sign up")}
                  >
                    Sign up
                  </a>
                </Typography>
              </form>
            )}
          </Card>
        </div>
      </div>
      <FloatBtnComp />
    </div>
  );
}

export default UserSignupPage;
