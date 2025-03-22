
import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { Hypothesis } from '@/types/database';
import HypothesisCard from './HypothesisCard';

interface HypothesisListProps {
  hypotheses: Hypothesis[];
  onEdit: (hypothesis: Hypothesis) => void;
  onDelete: (hypothesis: Hypothesis) => void;
  onStatusChange: (hypothesis: Hypothesis, newStatus: 'validated' | 'validating' | 'not-started' | 'invalid') => void;
}

const HypothesisList = ({ hypotheses, onEdit, onDelete, onStatusChange }: HypothesisListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [filteredHypotheses, setFilteredHypotheses] = useState<Hypothesis[]>(hypotheses);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...hypotheses];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        hypothesis => 
          hypothesis.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hypothesis.experiment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hypothesis.criteria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(hypothesis => hypothesis.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(hypothesis => hypothesis.category === categoryFilter);
    }
    
    setFilteredHypotheses(filtered);
  }, [hypotheses, searchTerm, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-validation-gray-400" />
          <Input
            placeholder="Search hypotheses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-8 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="validating">Validating</option>
              <option value="validated">Validated</option>
              <option value="invalid">Invalid</option>
            </select>
            <Filter className="absolute right-3 top-3 h-4 w-4 text-validation-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-8 appearance-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="value">Value</option>
              <option value="growth">Growth</option>
            </select>
            <Filter className="absolute right-3 top-3 h-4 w-4 text-validation-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredHypotheses.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg border border-validation-gray-200 shadow-sm">
            <p className="text-validation-gray-500">No hypotheses found matching your criteria.</p>
          </div>
        ) : (
          filteredHypotheses.map((hypothesis) => (
            <HypothesisCard
              key={hypothesis.id}
              hypothesis={hypothesis}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HypothesisList;
