import React, { useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import InputComp from "../../Components/Input/InputComp";
import ButtonComp from "../../Components/Button/ButtonComp";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "../../config/firebase.config";
import { toast } from "react-toastify";

function UserSignupPage() {
  const [type, setType] = useState("Sign Up");

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

  const onSubmitSignUp = async (data) => {
    let { userName, userSignupEmail, userSignupPassword } = data;
    await createUserWithEmailAndPassword(
      auth,
      userSignupEmail,
      userSignupPassword
    )
      .then((userCredential) => {
        const user = userCredential.user;
        toast.success("You are registered successfully!");
        userName("");
        userSignupPassword("");
        userSignupEmail("");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === "auth/email-already-in-use") {
          toast.error("Email already registerd. Please login!");
          return;
        }
        toast.error("Please try again.");
      });
  };

  const onSubmitSignIn = async (data) => {
    let { userSigninEmail, userSigninPassword } = data;
    await signInWithEmailAndPassword(auth, userSigninEmail, userSigninPassword)
      .then((userCredential) => {
        const user = userCredential.user;
        toast.success("Signin successfully!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.success("Invalid password or email.");
      });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card color="transparent" className="p-10" shadow={true}>
        <Typography variant="h4" color="blue-gray">
          {type}
        </Typography>
        <Typography color="gray" className="mt-1 font-normal">
          {type === "Sign Up"
            ? "Nice to meet you! Enter your details to register."
            : "Welcome back! Please Login to continue."}
        </Typography>
        {type === "Sign Up" && (
          <form
            className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96"
            onSubmit={handleSubmitSignUp(onSubmitSignUp)}
          >
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Your Name
              </Typography>
              <InputComp
                inputType="text"
                inputPlaceholder="Type user name"
                {...registerSignUp("userName", {
                  required: "Name is required",
                })}
              />
              {errorsSignUp.userName && (
                <Typography color="red" className="text-sm">
                  {errorsSignUp.userName.message}
                </Typography>
              )}
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Your Email
              </Typography>
              <InputComp
                inputType="email"
                inputPlaceholder="Type email"
                {...registerSignUp("userSignupEmail", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                    message: "Invalid email address.",
                  },
                })}
              />
              {errorsSignUp.userSignupEmail && (
                <Typography color="red" className="text-sm">
                  {errorsSignUp.userSignupEmail.message}
                </Typography>
              )}
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Password
              </Typography>
              <InputComp
                inputType="password"
                inputPlaceholder="Type password"
                {...registerSignUp("userSignupPassword", {
                  required: "Password is required.",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
              />
              {errorsSignUp.userSignupPassword && (
                <Typography color="red" className="text-sm">
                  {errorsSignUp.userSignupPassword.message}
                </Typography>
              )}
            </div>
            <ButtonComp title="SignUp" btnType="submit" />
            <Typography color="red" className="mt-4 text-center font-normal">
              Already have an account?
              <a
                className="font-medium cursor-pointer"
                onClick={() => setType("Sign In")}
              >
                Sign In
              </a>
            </Typography>
          </form>
        )}

        {type === "Sign In" && (
          <form
            className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96"
            onSubmit={handleSubmitSignIn(onSubmitSignIn)}
          >
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Your Email
              </Typography>
              <InputComp
                inputType="email"
                inputPlaceholder="Type email"
                {...registerSignIn("userSigninEmail", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                    message: "Invalid email address.",
                  },
                })}
              />
              {errorsSignIn.userSigninEmail && (
                <Typography color="red" className="text-sm">
                  {errorsSignIn.userSigninEmail.message}
                </Typography>
              )}
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Password
              </Typography>
              <InputComp
                inputType="password"
                inputPlaceholder="Type password"
                {...registerSignIn("userSigninPassword", {
                  required: "Password is required.",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
              />
              {errorsSignIn.userSigninPassword && (
                <Typography color="red" className="text-sm">
                  {errorsSignIn.userSigninPassword.message}
                </Typography>
              )}
            </div>
            <ButtonComp title="SignIn" btnType="submit" />
            <Typography color="red" className="mt-4 text-center font-normal">
              Not have an account?
              <a
                className="font-medium cursor-pointer"
                onClick={() => setType("Sign Up")}
              >
                Sign Up
              </a>
            </Typography>
          </form>
        )}
      </Card>
    </div>
  );
}

export default UserSignupPage;
