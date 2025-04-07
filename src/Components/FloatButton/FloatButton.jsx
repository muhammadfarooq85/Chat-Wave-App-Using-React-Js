// Libraries Imports
import PropTypes from "prop-types";
import { FloatButton, Popover } from "antd";
import { MdShare } from "react-icons/md";
// Local Imports
import SocialShareComp from "../SocialShare/SocialShare";

function FloatBtnComp({ clickOnFloatBtn }) {
  const shareUrl = "https://chatt-wave.vercel.app";
  const shareTitle = "A free and easy tool for real time Chat.";

  const content = <SocialShareComp url={shareUrl} title={shareTitle} />;

  return (
    <Popover content={content} trigger="click" className="dark:bg-[#444444]">
      <FloatButton onClick={clickOnFloatBtn} icon={<MdShare />} />
    </Popover>
  );
}

FloatBtnComp.propTypes = {
  clickOnFloatBtn: PropTypes.func,
};

export default FloatBtnComp;
