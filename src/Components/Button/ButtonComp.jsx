import { Button } from "@material-tailwind/react";

function ButtonComp({ classes, title, btnClick, btnType }) {
  return (
    <div>
      <Button
        className={`mt-6 ${classes}`}
        fullWidth
        type={btnType}
        onClick={btnClick}
      >
        {title}
      </Button>
    </div>
  );
}

export default ButtonComp;
