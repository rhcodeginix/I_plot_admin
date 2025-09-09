import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { cn } from "../../../lib/utils";

type InventoryItem = {
  id: string;
  data: { navn: string };
};

interface InventoryPopupProps {
  inventory: InventoryItem[];
  onSubmitCategories?: any;
}

export const InventoryPopup: React.FC<InventoryPopupProps> = ({
  inventory,
  onSubmitCategories,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedCats, setSelectedCats] = React.useState<string[]>([]);

  const toggleOption = (val: string) => {
    setSelectedCats((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const selectedLabels = inventory
    .filter((inv) => selectedCats.includes(inv.id))
    .map((inv) => inv.data?.navn);

  const handleReset = () => {
    setSelectedCats([]);
  };

  const handleSubmit = () => {
    if (onSubmitCategories) {
      const formattedCategories: any = inventory
        .filter((inv: any) => selectedCats.includes(inv.id))
        .map((inv: any) => ({
          id: inv.id,
          navn: inv.data.navn,
          produkter: inv.data.produkter || [],
          isSelected: false,
        }));

      onSubmitCategories(formattedCategories);
    }
    setSelectedCats([]);
  };

  return (
    <>
      <h4 className="mb-4 text-darkBlack font-medium text-xl">
        Velg kategorier fra inventory
      </h4>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-[8px] border border-gray1 bg-background px-3 py-2 text-base text-left",
              "placeholder:text-[#667085] placeholder:text-opacity-55 focus:outline-none"
            )}
          >
            <span className="truncate">
              {selectedLabels.length > 0
                ? selectedLabels.join(", ")
                : "Velg kategorier"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-[8px] border border-gray1 bg-white shadow-md p-1"
          side="bottom"
          align="start"
        >
          <div className="max-h-60 overflow-y-auto">
            {inventory.map((inv) => {
              const isSelected = selectedCats.includes(inv.id);
              return (
                <div
                  key={inv.id}
                  className={cn(
                    "flex cursor-pointer items-center rounded-[6px] px-3 py-2 text-base hover:bg-[#EAECF0]",
                    isSelected && "font-medium"
                  )}
                  onClick={() => toggleOption(inv.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="mr-2 h-4 w-4 rounded accent-primary"
                  />
                  {inv.data?.navn}
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleReset}
          className="border border-gray1 rounded-[8px] px-4 py-2 text-sm"
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          className="bg-primary text-white rounded-[8px] px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedCats.length > 0 ? false : true}
        >
          Submit
        </button>
      </div>
    </>
  );
};
