/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import Ic_close_black from "../../assets/images/Ic_close_black.svg";
import Ic_down_arrow from "../../assets/images/Ic_down_arrow.svg";
import { Check } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  onChange: (selectedOptions: Option[]) => void;
  placeholder: string;
  className: string;
  value?: any;
  disabled?: any;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  onChange,
  placeholder,
  className,
  value = [],
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleOption = (option: Option) => {
    const updatedSelection = selectedOptions?.some(
      (item) => item.value === option.value
    )
      ? selectedOptions.filter((item) => item.value !== option.value)
      : [...selectedOptions, option];

    setSelectedOptions(updatedSelection);
    onChange(updatedSelection);
  };

  const handleRemoveOption = (option: Option) => {
    const updatedSelection = selectedOptions.filter(
      (item) => item.value !== option.value
    );

    setSelectedOptions(updatedSelection);
    onChange(updatedSelection);
  };

  useEffect(() => {
    if (Array.isArray(value)) {
      const optionsFromValue = value?.map((val: any) => {
        const foundOption = options.find((option) => option.value === val);
        return foundOption ? foundOption : { value: val, label: val };
      });

      if (optionsFromValue?.length > 0) {
        setSelectedOptions(optionsFromValue);
      }
    }
  }, [value, options]);
  const scrollRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (selectedOptions && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [selectedOptions]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div
          className={`flex gap-2 justify-between items-center py-1 px-3 focus:border-1 border rounded-[8px] h-12 ${className} ${
            isOpen && "border"
          } ${
            disabled
              ? "cursor-not-allowed bg-[#F5F5F5] text-gray hover:border-gray7"
              : "cursor-pointer border-gray7"
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div
            className="text-gray flex items-center gap-2 whitespace-nowrap overflow-x-auto overFlowXScroll py-1"
            ref={scrollRef}
          >
            {selectedOptions?.length > 0 && (
              <div className="flex gap-2 items-center">
                {selectedOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center bg-gray3 text-gray rounded-[8px] px-2 py-[1px] gap-[4px] whitespace-nowrap w-max"
                  >
                    {option.label}
                    <img
                      src={Ic_close_black}
                      alt="close"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option);
                      }}
                      className="cursor-pointer w-4 h-4"
                    />
                  </div>
                ))}
              </div>
            )}
            {placeholder}
          </div>
          <img
            src={Ic_down_arrow}
            alt="arrow"
            className={`${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
        {isOpen && (
          <div className="absolute z-10 top-[40px] lg:top-[48px] left-0 w-full mt-1 bg-white border border-gray1 rounded-[8px] shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between gap-2 p-2 cursor-pointer text-black`}
                onClick={() => handleToggleOption(option)}
              >
                {option.label}
                <div className="">
                  {selectedOptions?.some(
                    (item) => item.value === option.value
                  ) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
