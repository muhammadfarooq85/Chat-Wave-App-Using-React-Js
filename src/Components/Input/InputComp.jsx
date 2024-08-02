import React, { forwardRef } from "react";
import { Input } from "@material-tailwind/react";

const InputComp = forwardRef(
  ({ inputType, inputPlaceholder, ...props }, ref) => {
    return (
      <Input
        size="lg"
        type={inputType}
        placeholder={inputPlaceholder}
        className="!border !border-gray-300 text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 placeholder:opacity-100 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10"
        labelProps={{
          className: "hidden",
        }}
        containerProps={{ className: "min-w-[100px]" }}
        ref={ref}
        {...props}
      />
    );
  }
);

export default InputComp;
