import { Search } from "lucide-react";
import React from "react";
import clsx from "clsx";
import { Input, InputType } from "./Input";

export const SearchInput = ({ ...props }: InputType) => {
  return (
    <Input
      type="search"
      className={clsx("w-full", props.className)}
      icon={<SearchIcon />}
      {...props}
    />
  );
};

export const SearchIcon = () => (
  <Search
    size={19}
    strokeWidth={2.5}
    className={clsx(
      "text-muted-foreground transition-colors duration-200",
      "group-focus-within:text-primary",
    )}
  />
);