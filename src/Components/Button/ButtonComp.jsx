import { Button } from "@material-tailwind/react";


function ButtonComp({ classes, title, btnClick, btnType, btnIcon }) {
  return (
    <div>
      <Button
        className={`mt-6 flex items-center justify-center gap-3 ${classes} bg-primary  tracking-widest`}
        fullWidth
        type={btnType}
        onClick={btnClick}
      >
        {title}
        {btnIcon}
      </Button>
    </div>
  );
}

export default ButtonComp;
