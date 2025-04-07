// Libraries Imports
import PropTypes from "prop-types";
// Local Imports
import { Button } from "@material-tailwind/react";

function ButtonComp({
  classes,
  title,
  btnClick,
  btnType,
  btnIcon,
  btnDisabled,
}) {
  return (
    <>
      <Button
        className={`flex items-center justify-center gap-3 bg-primary tracking-wider ${classes}`}
        fullWidth
        disabled={btnDisabled}
        type={btnType}
        onClick={btnClick}
      >
        {btnIcon}
        {title}
      </Button>
    </>
  );
}

ButtonComp.propTypes = {
  classes: PropTypes.string,
  title: PropTypes.string.isRequired,
  btnClick: PropTypes.func,
  btnType: PropTypes.string.isRequired,
  btnIcon: PropTypes.node,
  btnDisabled: PropTypes.bool,
};

export default ButtonComp;
