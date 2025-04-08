// Libraries Imports
import { useNavigate } from "react-router-dom";
import { Typography, Card } from "@material-tailwind/react";
import { FaRegHandBackFist } from "react-icons/fa6";
// Local Imports
import ButtonComp from "../../Components/Button/Button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 ml-10 mr-10">
      <div className="min-w-20 p-8">
        <Card className="p-4" shadow={false}>
          <div className="mb-4 flex justify-center items-center">
            <Typography className="font-bold text-5xl text-black">
              404
            </Typography>
          </div>
          <Typography className="mt-2 text-2xl text-black font-medium text-center">
            Oops! The page you are looking for does not exist.
          </Typography>
          <div className="mt-8 text-center">
            <ButtonComp
              btnClick={handleGoHome}
              title="Go back to Home"
              btnType="button"
              btnIcon={<FaRegHandBackFist size={20} />}
            >
              Go Back to Home
            </ButtonComp>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFoundPage;
