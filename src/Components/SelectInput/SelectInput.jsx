// Libraries Imports
import PropTypes from "prop-types";
import { Select, Option } from "@material-tailwind/react";

function SelectInputComp({ isError, name, value, setValue }) {
  return (
    <div className="w-full">
      <Select
        name={name}
        label="Select Status"
        error={isError}
        value={value}
        onChange={(val) => setValue(val)}
        color="blue"
        size="lg"
      >
        <Option value="available">Available</Option>
        <Option value="unavailable">Unavailable</Option>
        <Option value="away">Away</Option>
      </Select>
    </div>
  );
}

SelectInputComp.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  isError: PropTypes.bool,
  name: PropTypes.string.isRequired,
};

export default SelectInputComp;
