// Libraries Imports
import { useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { SiGnuprivacyguard } from "react-icons/si";
import { AiOutlineLogin } from "react-icons/ai";
import { FaCashRegister } from "react-icons/fa6";
import { FaKeycdn } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
// Local Imports
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  setDoc,
  doc,
} from "../../Config/firebase.config";
import InputComp from "../../Components/Input/Input";
import ButtonComp from "../../Components/Button/Button";
import FloatBtnComp from "../../Components/FloatButton/FloatButton";

function UserSignupPage() {
  const [type, setType] = useState("Sign up");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSignin, setIsSignin] = useState(false);
  const navigate = useNavigate();

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: errorsSignUp },
    reset: signinFormReset,
  } = useForm();

  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: errorsSignIn },
    reset: registerFormReset,
  } = useForm();

  //Registering User
  const onSubmitSignUp = async (data) => {
    let { userSignupEmail, userSignupPassword } = data;
    setIsRegistering(true);
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
        registerFormReset();
      })
      .catch((error) => {
        const errorCode = error?.code;
        if (errorCode === "auth/email-already-in-use") {
          toast.error("Email already registered. Please login!");
          return;
        }
        toast.error("Please try again!");
      })
      .finally(() => {
        setIsRegistering(false);
      });
  };

  // Sign in user
  const onSubmitSignIn = async (data) => {
    let { userSigninEmail, userSigninPassword } = data;
    setIsSignin(true);
    await signInWithEmailAndPassword(auth, userSigninEmail, userSigninPassword)
      .then(() => {
        toast.success("Sign-in successful!");
        navigate("/chat");
        signinFormReset();
      })
      .catch(() => {
        toast.error("Invalid password or email!");
      })
      .finally(() => {
        setIsSignin(false);
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
                        value:
                          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                        message:
                          "Password must be at least 8 to 20 characters long. It must contain at least one letter, one special character and one digit.",
                      },
                    })}
                  />
                  {errorsSignUp.userSignupPassword && (
                    <Typography color="red" className="text-sm font-medium">
                      {errorsSignUp.userSignupPassword.message}
                    </Typography>
                  )}
                </div>
                <ButtonComp
                  title="Sign Up"
                  btnType="submit"
                  btnDisabled={isRegistering}
                  btnIcon={<FaCashRegister size={20} />}
                />
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
                <ButtonComp
                  title="Sign In"
                  btnType="submit"
                  btnDisabled={isSignin}
                  btnIcon={<FaKeycdn size={20} />}
                />
                <Typography className="mt-4 text-certiary text-center font-normal">
                  {"Don't have an account?"}
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
