import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Ic_calender2 from "../../assets/images/Ic_calender2.svg";

interface DateTimePickerComponentProps {
  selectedDate: any;
  onDateChange: (date: Date | null) => void;
  dateFormat?: string;
  placeholderText?: string;
  className?: string;
  minDate?: Date;
}

const DateTimePickerComponent: React.FC<DateTimePickerComponentProps> = ({
  selectedDate,
  onDateChange,
  dateFormat = "dd.MM.yyyy | HH:mm",
  placeholderText = "Select date and time",
  className,
  minDate,
}) => {
  const CustomInput = ({
    value,
    onClick,
  }: {
    value: string;
    onClick: () => void;
  }) => {
    return (
      <div
        style={{ position: "relative" }}
        className={`${className} cursor-pointer flex items-center gap-2 w-full`}
        onClick={onClick}
      >
        <input
          type="text"
          value={value}
          placeholder={placeholderText}
          readOnly
          className="text-base focus-within:outline-none w-full bg-transparent"
        />
        <img src={Ic_calender2} alt="Calendar icon" />
      </div>
    );
  };

  return (
    <>
      <div className="custom-datepicker-wrapper w-full">
        <DatePicker
          selected={selectedDate}
          onChange={onDateChange}
          dateFormat={dateFormat}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Time"
          customInput={
            <CustomInput
              value={
                selectedDate
                  ? new Intl.DateTimeFormat("default", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(selectedDate)
                  : ""
              }
              onClick={() => {}}
            />
          }
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          className="w-full flex"
          minDate={minDate}
        />
      </div>
    </>
  );
};

export default DateTimePickerComponent;
