// /**
//  * source: https://github.com/shadcn-ui/ui/issues/66#issuecomment-1718329393
//  */
// import * as React from "react";
// import { cn } from "@/lib/utils";

// import { Check, X, ChevronsUpDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Badge } from "@/components/ui/badge";

// export type OptionType = {
//   label: string;
//   value: string;
// };

// interface MultiSelectProps {
//   options: OptionType[];
//   selected: string[];
//   onChange: React.Dispatch<React.SetStateAction<string[]>>;
//   className?: string;
// }

// function MultiSelect({
//   options,
//   selected,
//   onChange,
//   className,
//   ...props
// }: MultiSelectProps) {
//   const [open, setOpen] = React.useState(false);

//   const handleUnselect = (item: string) => {
//     onChange(selected.filter((i) => i !== item));
//   };

//   return (
//     <Popover open={open} onOpenChange={setOpen} {...props}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           className={`w-full justify-between ${selected.length > 1 ? "h-full" : "h-10"}`}
//           onClick={() => setOpen(!open)}
//         >
//           <div className="flex flex-wrap gap-1">
//             all selected
//             {/* {selected.map((item) => (
//               <Badge
//                 variant="secondary"
//                 key={item}
//                 className="mb-1 mr-1"
//                 onClick={() => handleUnselect(item)}
//               >
//                 {item}
//                 <button
//                   className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       handleUnselect(item);
//                     }
//                   }}
//                   onMouseDown={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                   }}
//                   onClick={() => handleUnselect(item)}
//                 >
//                   <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
//                 </button>
//               </Badge>
//             ))} */}
//           </div>
//           <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-full p-0">
//         <Command className={className}>
//           <CommandInput placeholder="Search ..." />
//           <CommandEmpty>No item found.</CommandEmpty>
//           <CommandGroup className="max-h-64 overflow-auto">
//             {options?.map((option) => {
//               console.log(
//                 "HERE: ",
//                 selected,
//                 option,
//                 option.value,
//                 selected.includes(option.value),
//               );
//               // return <CommandItem key={option.value}>{option.label}</CommandItem>;
//               return (
//                 <div
//                   className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
//                   key={option.value}
//                   onClick={() => {
//                     onChange(
//                       selected.includes(option.value)
//                         ? selected.filter((item) => item !== option.value)
//                         : [...selected, option.value],
//                     );
//                     setOpen(true);
//                   }}
//                 >
//                   <Check
//                     className={cn(
//                       "mr-2 h-4 w-4",
//                       selected.includes(option.value)
//                         ? "opacity-100"
//                         : "opacity-0",
//                     )}
//                   />
//                   {option.label}
//                 </div>
//               );
//             })}
//           </CommandGroup>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }

// export { MultiSelect };

import * as React from "react";
import { cn } from "@/lib/utils";

import { Check, X, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  selectAll: boolean;
}

function MultiSelect({
  options,
  selected = [],
  onChange,
  className,
  selectAll,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [allSelected, setAllSelected] = React.useState(false);

  React.useEffect(() => {
    if (selectAll) {
      if (selected.length === options.length) {
        setAllSelected(true);
      } else {
        setAllSelected(false);
      }
    }
  }, [selectAll, selected, options]);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      const allValues = options.map((option) => option.value);
      onChange(allValues);
    }
    setAllSelected(!allSelected);
  };

  const selectedString = React.useMemo(() => {
    if (selected.length === 0) return "NONE";
    // if (selected.length === 1) return selected[0];

    if (selected.length === options.length) return "all";
    return selected.length + "";
  }, [selected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${
            selected.length > 1 ? "h-full" : "h-10"
          }`}
          onClick={() => setOpen(!open)}
        >
          Events Select ({selectedString}
          )
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className={className}>
          <CommandInput placeholder="Search ..." />

          <CommandGroup className="max-h-64 overflow-auto">
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              onClick={handleSelectAll}
            >
              {allSelected ? "Unselect All" : "Select All"}
            </div>

            {options.map((option) => (
              <div
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                key={option.value}
                onClick={() => {
                  onChange(
                    selected.includes(option.value)
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value],
                  );
                  setOpen(true);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {option.label}
              </div>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };
