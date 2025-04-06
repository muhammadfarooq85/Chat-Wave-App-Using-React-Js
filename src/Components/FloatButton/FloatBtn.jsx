import { FloatButton, Popover } from "antd";
import { MdShare } from "react-icons/md";
import SocialShareComp from "../Share/SocialShare";

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

export default FloatBtnComp;
