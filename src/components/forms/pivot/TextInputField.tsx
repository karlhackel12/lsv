
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TextInputFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}

const TextInputField = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  required = false
}: TextInputFieldProps) => {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      {multiline ? (
        <Textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <Input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
};

export default TextInputField;
