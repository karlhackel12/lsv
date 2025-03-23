
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LikelihoodType } from './types';

interface LikelihoodFieldProps {
  value: LikelihoodType;
  onChange: (value: LikelihoodType) => void;
}

const LikelihoodField = ({ value, onChange }: LikelihoodFieldProps) => {
  return (
    <div>
      <Label htmlFor="likelihood" className="text-sm font-medium">Likelihood</Label>
      <Select 
        value={value} 
        onValueChange={(value: LikelihoodType) => onChange(value)}
      >
        <SelectTrigger id="likelihood">
          <SelectValue placeholder="Select likelihood" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LikelihoodField;
