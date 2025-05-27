import React from "react";

interface Tab {
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: any;
  setActiveTab?: any;
}

const Tabs: React.FC<TabsProps> = ({ tabs, setActiveTab, activeTab }) => {
  return (
    <div className="flex gap-2 md:gap-4">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`text-sm md:text-base border-b-[3px] text-darkBlack py-2 md:py-3 px-3 md:px-5 ${
            activeTab === index
              ? "border-primary font-semibold bg-lightPurple rounded-t-[12px]"
              : "border-transparent"
          } ${setActiveTab ? "cursor-pointer" : "cursor-auto"}`}
          onClick={() => (setActiveTab ? setActiveTab(index) : undefined)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
