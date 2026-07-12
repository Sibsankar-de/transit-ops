export type SelectOptionType = {
  key: string;
  value: string;
} | string;

export type SelectType = {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  options?: SelectOptionType[];
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholderClass?: string;
  className?: string;
  dropdownClass?: string;
};