
import React, { useState } from 'react';
import Card from './Card';
import { RotateCcw, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PivotOptionForm from './forms/PivotOptionForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PivotOption {
  id: number;
  originalId?: string;
  type: string;
  description: string;
  trigger: string;
  likelihood: 'high' | 'medium' | 'low';
}

interface PivotSectionProps {
  pivotOptions: PivotOption[];
  refreshData: () => void;
  projectId: string;
}

const PivotSection = ({ pivotOptions, refreshData, projectId }: PivotSectionProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPivotOption, setSelectedPivotOption] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pivotOptionToDelete, setPivotOptionToDelete] = useState<any>(null);

  const handleCreateNew = () => {
    setSelectedPivotOption(null);
    setIsFormOpen(true);
  };

  const handleEdit = (pivotOption: PivotOption) => {
    // Find original pivot option with string ID for database operations
    const originalPivotOption = {
      ...pivotOption,
      id: pivotOption.originalId
    };
    setSelectedPivotOption(originalPivotOption);
    setIsFormOpen(true);
  };

  const handleDelete = (pivotOption: PivotOption) => {
    setPivotOptionToDelete({
      ...pivotOption,
      id: pivotOption.originalId
    });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pivotOptionToDelete) return;
    
    try {
      const { error } = await supabase
        .from('pivot_options')
        .delete()
        .eq('id', pivotOptionToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: 'Pivot option deleted',
        description: 'The pivot option has been successfully deleted.',
      });
      
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPivotOptionToDelete(null);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Pivot Framework</h2>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pivot Option
        </Button>
      </div>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          A pivot is a structured course correction designed to test a new fundamental hypothesis about the product, business model, or engine of growth.
        </p>
      </Card>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-200">
        <h3 className="text-xl font-bold mb-5 text-validation-gray-900">Pivot Decision Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-validation-gray-800 mb-3">When to Persist</h4>
            <ul className="list-disc pl-5 space-y-2 text-validation-gray-600">
              <li>Core value hypothesis is validated</li>
              <li>Engagement metrics trending positively</li>
              <li>Customer acquisition cost decreasing</li>
              <li>Validated path to sustainable unit economics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-validation-gray-800 mb-3">When to Pivot</h4>
            <ul className="list-disc pl-5 space-y-2 text-validation-gray-600">
              <li>Core value hypothesis invalidated</li>
              <li>Engagement persistently below targets</li>
              <li>High acquisition costs with no downward trend</li>
              <li>Conversion rates below viability thresholds</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-validation-gray-900">Potential Pivot Options</h3>
      </div>
      
      {pivotOptions.length === 0 ? (
        <Card className="p-12 text-center animate-slideUpFade mb-8">
          <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No Pivot Options Yet</h3>
          <p className="text-validation-gray-600 mb-6">Plan ahead by identifying potential pivot strategies.</p>
          <Button 
            className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Pivot Option
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {pivotOptions.map((option, index) => (
            <Card 
              key={option.id} 
              className="p-6 animate-slideUpFade" 
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
              hover={true}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-lg text-validation-gray-900">{option.type}</h4>
                <div className="flex space-x-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    option.likelihood === 'high' 
                      ? 'bg-validation-red-50 text-validation-red-700 border border-validation-red-200' 
                      : option.likelihood === 'medium' 
                        ? 'bg-validation-yellow-50 text-validation-yellow-700 border border-validation-yellow-200' 
                        : 'bg-validation-green-50 text-validation-green-700 border border-validation-green-200'
                  }`}>
                    {option.likelihood} likelihood
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEdit(option)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
                    onClick={() => handleDelete(option)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              <p className="text-validation-gray-600 mb-5">{option.description}</p>
              <div className="bg-validation-gray-50 p-4 rounded-lg border border-validation-gray-200">
                <p className="text-sm font-semibold text-validation-red-600 mb-1">Trigger Point:</p>
                <p className="text-validation-gray-700 text-sm">{option.trigger}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <div className="flex justify-center mt-8">
        <button className="bg-white border border-validation-gray-200 hover:bg-validation-gray-50 text-validation-gray-700 font-medium py-2.5 px-5 rounded-lg flex items-center transition-colors duration-300 shadow-subtle">
          <RotateCcw className="h-4 w-4 mr-2" />
          Schedule Pivot/Persevere Meeting
        </button>
      </div>

      {/* Pivot Option Form Dialog */}
      <PivotOptionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={refreshData}
        pivotOption={selectedPivotOption}
        projectId={projectId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this pivot option. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-validation-red-600 hover:bg-validation-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PivotSection;
