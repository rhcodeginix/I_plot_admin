import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Ic_calendar from "../../assets/images/Ic_calendar.svg";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  dateFormat?: string;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  dateFormat = "yyyy/MM/dd",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-[9px] border border-gray1 bg-white rounded-md cursor-pointer ${className}`}
      >
        <img src={Ic_calendar} alt="Calendar icon" />
        <input
          type="text"
          value={
            startDate && endDate
              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : "Velg periode"
          }
          readOnly
          className="text-sm font-medium w-[200px] focus:outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute top-auto" style={{ zIndex: 99999 }}>
          <DatePicker
            selected={startDate}
            onChange={(dates: [any, any]) => {
              const [start, end] = dates;
              onDateChange(start, end);
              if (start && end) setIsOpen(false);
            }}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            dateFormat={dateFormat}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </div>
      )}
    </div>
  );
};
export default DateRangePicker;
