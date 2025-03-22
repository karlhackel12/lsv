
import React, { useState } from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import { Lightbulb, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import HypothesisForm from './forms/HypothesisForm';
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
import { TEMPLATE_VALUE_HYPOTHESES, TEMPLATE_GROWTH_HYPOTHESES } from '@/types/pivot';

interface Hypothesis {
  id: number;
  originalId?: string;
  category: string;
  statement: string;
  experiment: string;
  criteria: string;
  status: 'validated' | 'validating' | 'not-started' | 'invalid';
  result: string | null;
  evidence: string | null;
}

interface HypothesesSectionProps {
  hypotheses: Hypothesis[];
  refreshData: () => void;
  projectId: string;
}

const HypothesesSection = ({ hypotheses, refreshData, projectId }: HypothesesSectionProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hypothesisToDelete, setHypothesisToDelete] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleCreateNew = () => {
    setSelectedHypothesis(null);
    setIsFormOpen(true);
  };

  const handleEdit = (hypothesis: Hypothesis) => {
    // Find original hypothesis with string ID for database operations
    const originalHypothesis = {
      ...hypothesis,
      id: hypothesis.originalId
    };
    setSelectedHypothesis(originalHypothesis);
    setIsFormOpen(true);
  };

  const handleDelete = (hypothesis: Hypothesis) => {
    setHypothesisToDelete({
      ...hypothesis,
      id: hypothesis.originalId
    });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!hypothesisToDelete) return;
    
    try {
      const { error } = await supabase
        .from('hypotheses')
        .delete()
        .eq('id', hypothesisToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: 'Hypothesis deleted',
        description: 'The hypothesis has been successfully deleted.',
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
      setHypothesisToDelete(null);
    }
  };

  const updateHypothesisStatus = async (hypothesis: Hypothesis, newStatus: 'validated' | 'validating' | 'not-started' | 'invalid') => {
    try {
      const { error } = await supabase
        .from('hypotheses')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', hypothesis.originalId);
      
      if (error) throw error;
      
      toast({
        title: 'Status updated',
        description: `Hypothesis status changed to ${newStatus}.`,
      });
      
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Hypothesis Testing</h2>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Hypothesis
        </Button>
      </div>

      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg mb-4">
          Track and validate key business assumptions using the Build-Measure-Learn cycle. Hypotheses should be specific, testable, and have clear success criteria.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          {showTemplates ? 'Hide Templates' : 'Show Templates'}
        </Button>
        
        {showTemplates && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Value Hypothesis Templates</h4>
              <ul className="space-y-2 text-sm">
                {TEMPLATE_VALUE_HYPOTHESES.map((template, index) => (
                  <li key={index} className="p-2 bg-blue-50 rounded border border-blue-100">
                    {template}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Growth Hypothesis Templates</h4>
              <ul className="space-y-2 text-sm">
                {TEMPLATE_GROWTH_HYPOTHESES.map((template, index) => (
                  <li key={index} className="p-2 bg-green-50 rounded border border-green-100">
                    {template}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      {hypotheses.length === 0 ? (
        <Card className="p-12 text-center animate-slideUpFade">
          <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No Hypotheses Yet</h3>
          <p className="text-validation-gray-600 mb-6">Start by adding your first business hypothesis to test.</p>
          <Button 
            className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Hypothesis
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {hypotheses.map((hypothesis, index) => (
            <Card 
              key={hypothesis.id} 
              className="p-6 animate-slideUpFade" 
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
              hover={true}
            >
              <div className="flex justify-between mb-4">
                <span className={`text-xs font-semibold inline-block px-3 py-1 rounded-full ${
                  hypothesis.category === 'value' 
                    ? 'bg-validation-blue-50 text-validation-blue-700 border border-validation-blue-200' 
                    : 'bg-validation-gray-50 text-validation-gray-700 border border-validation-gray-200'
                }`}>
                  {hypothesis.category === 'value' ? 'Value Hypothesis' : 'Growth Hypothesis'}
                </span>
                <div className="flex space-x-2">
                  <StatusBadge status={hypothesis.status} />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEdit(hypothesis)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
                    onClick={() => handleDelete(hypothesis)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-4 text-validation-gray-900">{hypothesis.statement}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Experiment</p>
                  <p className="text-validation-gray-700 mb-4">{hypothesis.experiment}</p>
                  
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Success Criteria</p>
                  <p className="text-validation-gray-700">{hypothesis.criteria}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Results</p>
                  <p className="text-validation-gray-700 mb-4">
                    {hypothesis.result || 'No results yet'}
                  </p>
                  
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Evidence</p>
                  <p className="text-validation-gray-700">
                    {hypothesis.evidence || 'No evidence collected yet'}
                  </p>
                </div>
              </div>
              {(hypothesis.status === 'validating' || hypothesis.status === 'not-started') && (
                <div className="mt-6 flex justify-end gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleEdit(hypothesis)}
                  >
                    Update Results
                  </Button>
                  {hypothesis.status === 'not-started' && (
                    <Button 
                      className="bg-validation-blue-600 hover:bg-validation-blue-700"
                      onClick={() => updateHypothesisStatus(hypothesis, 'validating')}
                    >
                      Start Experiment
                    </Button>
                  )}
                  {hypothesis.status === 'validating' && (
                    <div className="flex gap-2">
                      <Button 
                        className="bg-validation-green-600 hover:bg-validation-green-700"
                        onClick={() => updateHypothesisStatus(hypothesis, 'validated')}
                      >
                        Mark Validated
                      </Button>
                      <Button 
                        className="bg-validation-red-600 hover:bg-validation-red-700"
                        onClick={() => updateHypothesisStatus(hypothesis, 'invalid')}
                      >
                        Mark Invalid
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Hypothesis Form Dialog */}
      <HypothesisForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={refreshData}
        hypothesis={selectedHypothesis}
        projectId={projectId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this hypothesis and all associated data. 
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

export default HypothesesSection;
