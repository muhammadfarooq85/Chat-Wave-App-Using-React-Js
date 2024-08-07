import React, { forwardRef } from "react";
import { Input } from "@material-tailwind/react";

const InputComp = forwardRef(
  ({ inputType, inputPlaceholder, ...props }, ref) => {
    return (
      <Input
        size="lg"
        type={inputType}
        placeholder={inputPlaceholder}
        className="!border !border-tertiary text-gray-900 ring-4 ring-transparent  placeholder:text-certiary placeholder:opacity-100 focus:!border-secondary focus:!border-t-secondary focus:ring-gray-900/10"
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
