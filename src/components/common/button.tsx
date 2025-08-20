import React from "react";
import { useNavigate } from "react-router-dom";

interface ButtonProps {
  text: string;
  className: string;
  type?: "button" | "submit" | "reset";
  onClick?: any;
  path?: string;
  icon?: any;
}

const Button: React.FC<ButtonProps> = ({
  text,
  className,
  type,
  onClick,
  path,
  icon,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    } else {
      onClick?.();
    }
  };

  return (
    <button
      className={`${className} text-base whitespace-nowrap px-3 md:px-4 py-[10px] h-[40px] flex items-center justify-center`}
      type={type || "button"}
      onClick={handleClick}
    >
      {icon && icon}
      {text}
    </button>
  );
};

export default Button;
