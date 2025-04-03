
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProject } from '@/hooks/use-project';

interface ProjectSelectorProps {
  currentProjectId: string;
  onProjectChange: (projectId: string) => void;
}

const ProjectSelector = ({ currentProjectId, onProjectChange }: ProjectSelectorProps) => {
  const { projects, isLoading } = useProject();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentProjectId);

  useEffect(() => {
    setValue(currentProjectId);
  }, [currentProjectId]);

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[200px] justify-start">
        <span className="animate-pulse">Loading projects...</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between truncate"
        >
          {value
            ? projects.find((project) => project.id === value)?.name || "Select project"
            : "Select project"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandEmpty>No project found.</CommandEmpty>
          <CommandGroup>
            {projects.map((project) => (
              <CommandItem
                key={project.id}
                value={project.id}
                onSelect={(currentValue) => {
                  setValue(currentValue);
                  onProjectChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === project.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">{project.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ProjectSelector;
