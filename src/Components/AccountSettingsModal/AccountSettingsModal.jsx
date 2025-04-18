// Libraries Imports
import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { GiCancel } from "react-icons/gi";
import { RxUpdate } from "react-icons/rx";
// Local Imports
import {
  updateDoc,
  doc,
  db,
  auth,
  updatePassword,
} from "../../Config/firebase.config";
import InputComp from "../Input/Input";
import ButtonComp from "../Button/Button";
import SelectInputComp from "../SelectInput/SelectInput";

function AccountSettingsModalComp({ open, handleOpen }) {
  const {
    handleSubmit: handleSubmitUserStatus,
    formState: { errors: errorsSubmitUserStatus },
    reset: userStatusReset,
    control,
  } = useForm({
    defaultValues: {
      userStatus: "",
    },
    mode: "onBlur",
  });
  const {
    register: changeUserName,
    handleSubmit: handleSubmitUserName,
    formState: { errors: errorsSubmitUserName },
    reset: nameReset,
  } = useForm();
  const {
    register: changeUserPassword,
    handleSubmit: handleSubmitUserPassword,
    formState: { errors: errorsSubmitUserPassword },
    reset: passwordReset,
  } = useForm();
  const [isUserStatusUpdating, setIsUserStatusUpdating] = useState(false);
  const [isNameChanging, setIsNameChanging] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  const onSubmitUserStatus = async (data) => {
    let { userStatus } = data;
    console.log(userStatus);

    try {
      setIsUserStatusUpdating(true);
      const userStatusRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userStatusRef, {
        userStatus,
      });
      handleOpen();
      toast.success("Your status is updated successfully!");
      userStatusReset();
    } catch (error) {
      toast.error("Please try again!");
    } finally {
      setIsUserStatusUpdating(false);
    }
  };

  const onSubmitUserName = async (data) => {
    let { userName } = data;
    const userNameRef = doc(db, "users", auth.currentUser.uid);
    try {
      setIsNameChanging(true);
      await updateDoc(userNameRef, {
        userName,
      });
      handleOpen();
      toast.success("Your name is updated successfully!");
      nameReset();
    } catch (error) {
      toast.error("Please try again!");
    } finally {
      setIsNameChanging(false);
    }
  };

  const onSubmitUserPassword = async (data) => {
    let { userPassword } = data;
    try {
      setIsPasswordChanging(true);
      await updatePassword(auth.currentUser, userPassword);
      const userPasswordRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userPasswordRef, {
        userSignupPassword: userPassword,
      });
      handleOpen();
      toast.success("Your password is updated successfully!");
      passwordReset();
    } catch (error) {
      toast.error("Please try again!");
    } finally {
      setIsPasswordChanging(false);
    }
  };

  return (
    <>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Account Settings</DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmitUserStatus(onSubmitUserStatus)}>
            <div className="flex flex-col justify-center items-start gap-2">
              <Controller
                name="userStatus"
                control={control}
                rules={{
                  required: "Status is required",
                }}
                render={({ field }) => (
                  <SelectInputComp
                    name={field.name}
                    isError={!!errorsSubmitUserStatus.userStatus}
                    value={field.value}
                    setValue={field.onChange}
                  />
                )}
              />
              {errorsSubmitUserStatus.userStatus && (
                <Typography color="red" className="text-sm font-medium">
                  {errorsSubmitUserStatus.userStatus.message}
                </Typography>
              )}
              <div>
                <ButtonComp
                  title="Update Status"
                  btnType="submit"
                  classes={"mb-6"}
                  btnDisabled={isUserStatusUpdating}
                  btnIcon={<RxUpdate size={20} />}
                />
              </div>
            </div>
          </form>
          <form onSubmit={handleSubmitUserName(onSubmitUserName)}>
            <div className="flex flex-col justify-center items-start gap-2">
              <div className="w-full">
                <InputComp
                  inputType="text"
                  inputPlaceholder="Enter new name"
                  {...changeUserName("userName", {
                    required: "Name is required.",
                  })}
                />
              </div>
              {errorsSubmitUserName.userName && (
                <Typography color="red" className="text-sm font-medium">
                  {errorsSubmitUserName.userName.message}
                </Typography>
              )}
              <div>
                <ButtonComp
                  title="Update Name"
                  btnType="submit"
                  btnDisabled={isNameChanging}
                  btnIcon={<RxUpdate size={20} />}
                />
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
                  inputPlaceholder="Enter new password"
                  {...changeUserPassword("userPassword", {
                    required: "Password is required.",
                    pattern: {
                      value:
                        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                      message:
                        "Password must be at least 8 to 20 characters long. It must contain at least one letter, one special character and one digit.",
                    },
                  })}
                />
              </div>
              {errorsSubmitUserPassword.userPassword && (
                <Typography color="red" className="text-sm font-medium">
                  {errorsSubmitUserPassword.userPassword.message}
                </Typography>
              )}
              <div>
                <ButtonComp
                  title="Update Password"
                  btnType="submit"
                  btnDisabled={isPasswordChanging}
                  btnIcon={<RxUpdate size={20} />}
                />
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <ButtonComp
            classes="!w-[50%]"
            title="Cancel"
            btnIcon={<GiCancel size={20} />}
            btnType="button"
            btnClick={handleOpen}
          />
        </DialogFooter>
      </Dialog>
    </>
  );
}
AccountSettingsModalComp.propTypes = {
  open: PropTypes.bool.isRequired,
  handleOpen: PropTypes.func.isRequired,
};

export default AccountSettingsModalComp;
