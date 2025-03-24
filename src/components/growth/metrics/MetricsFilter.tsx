
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Link2, PlusCircle } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface MetricsFilterProps {
  showCoreMetricsOnly: boolean;
  setShowCoreMetricsOnly: (value: boolean) => void;
  filterLinked: boolean;
  setFilterLinked: (value: boolean) => void;
  onAddMetric: () => void;
}

const MetricsFilter = ({ 
  showCoreMetricsOnly, 
  setShowCoreMetricsOnly, 
  filterLinked, 
  setFilterLinked,
  onAddMetric
}: MetricsFilterProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">Growth Metrics</h2>
        <p className="text-gray-500 mt-1">Track key metrics related to your growth model</p>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={showCoreMetricsOnly}
              onCheckedChange={setShowCoreMetricsOnly}
            >
              Show only core metrics
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterLinked}
              onCheckedChange={setFilterLinked}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Show only metrics linked to scaling
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button onClick={onAddMetric} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Metric
        </Button>
      </div>
    </div>
  );
};

export default MetricsFilter;
