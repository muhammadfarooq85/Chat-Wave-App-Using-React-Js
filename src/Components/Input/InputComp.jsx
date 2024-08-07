import React, { forwardRef, useState } from "react";
import { Input } from "@material-tailwind/react";
import { HiEye, HiEyeOff } from "react-icons/hi";

const InputComp = forwardRef(
  ({ inputType, inputPlaceholder, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
      setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
      <div className="relative">
        <Input
          size="lg"
          type={inputType === "password" && showPassword ? "text" : inputType}
          placeholder={inputPlaceholder}
          className="!border !border-tertiary text-gray-900 ring-4 ring-transparent  placeholder:text-certiary placeholder:opacity-100 focus:!border-secondary focus:!border-t-secondary focus:ring-gray-900/10"
          labelProps={{
            className: "hidden",
          }}
          containerProps={{ className: "min-w-[100px]" }}
          ref={ref}
          {...props}
        />
        {inputType === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
            onClick={toggleShowPassword}
          >
            {showPassword ? <HiEyeOff /> : <HiEye />}
          </button>
        )}
      </div>
    );
  }
);

export default InputComp;
