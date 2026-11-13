import { useId } from 'react';
import { Select } from '@evoker/react';

/** Shared demo control; Evoker owns popup styling, focus and selection behavior. */
export function SelectControl({ label, value, options, onValueChange }: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) {
  const id = useId();
  return <div className="select-control"><label htmlFor={id}>{label}</label>
    <Select.Root value={value} items={options} onValueChange={next => { if (next !== null) onValueChange(next); }}>
      <Select.Trigger id={id} aria-label={label}><Select.Value /><Select.Icon aria-hidden="true">⌄</Select.Icon></Select.Trigger>
      <Select.Portal><Select.Positioner><Select.Content><Select.List>
        {options.map(option => <Select.Item key={option.value} value={option.value}><Select.ItemText>{option.label}</Select.ItemText></Select.Item>)}
      </Select.List></Select.Content></Select.Positioner></Select.Portal>
    </Select.Root>
  </div>;
}
