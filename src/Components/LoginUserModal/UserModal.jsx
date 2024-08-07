import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";
import InputComp from "../Input/InputComp";
import ButtonComp from "../Button/ButtonComp";
import { useForm } from "react-hook-form";
import {
  updateDoc,
  doc,
  db,
  auth,
  updatePassword,
} from "../../config/firebase.config";
import { toast } from "react-toastify";

export default function UserModalComp({ open, setOpen, handleOpen }) {
  const {
    register: changeUserName,
    handleSubmit: handleSubmitUserName,
    formState: { errors: errorsSubmitUserName },
  } = useForm();

  const {
    register: changeUserPassword,
    handleSubmit: handleSubmitUserPassword,
    formState: { errors: errorsSubmitUserPassword },
  } = useForm();

  const onSubmitUserName = async (data) => {
    let { userName } = data;
    const userNameRef = doc(db, "users", auth.currentUser.uid);
    try {
      await updateDoc(userNameRef, {
        userName,
      });
      handleOpen();
      toast.success("Your username updated successfully!");
      userName = "";
    } catch (error) {
      toast.error("Please try again!");
    }
  };

  const onSubmitUserPassword = async (data) => {
    let { userPassword } = data;
    try {
      await updatePassword(auth.currentUser, userPassword);
      const userPasswordRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userPasswordRef, {
        userSignupPassword: userPassword,
      });
      handleOpen();
      toast.success("Your password updated successfully!");
      userPassword = "";
    } catch (error) {
      toast.error("Please try again!");
    }
  };

  return (
    <>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Account Settings</DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmitUserName(onSubmitUserName)}>
            <div className="flex flex-col justify-center items-start">
              <div className="w-full">
                <InputComp
                  inputType="text"
                  inputPlaceholder="Change your username"
                  {...changeUserName("userName", {
                    required: "Username is required.",
                  })}
                />
              </div>
              {errorsSubmitUserName.userName && (
                <Typography color="red" className="text-sm font-medium">
                  {errorsSubmitUserName.userName.message}
                </Typography>
              )}
              <div className="w-[40%]">
                <ButtonComp title="Change Name" btnType="submit" />
              </div>
            </div>
          </form>
          <form
            onSubmit={handleSubmitUserPassword(onSubmitUserPassword)}
            className="mt-6"
          >
            <div className="flex flex-col justify-center items-start gap-2">
              <div className="w-full">
                <InputComp
                  inputType="password"
                  inputPlaceholder="Type your password"
                  {...changeUserPassword("userPassword", {
                    required: "Password is required and.",
                    pattern: {
                      value: /^(?=.*[A-Z])[0-9A-Z]{8,10}$/,
                      message:
                        "Password must be at least 8 to 10 characters long with at least one UpperCase letter",
                    },
                  })}
                />
              </div>
              {errorsSubmitUserPassword.userPassword && (
                <Typography color="red" className="text-sm font-medium">
                  {errorsSubmitUserPassword.userPassword.message}
                </Typography>
              )}
              <div className="w-[40%]">
                <ButtonComp title="Change Password" btnType="submit" />
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleOpen} className="mr-1">
            <span>Cancel</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
