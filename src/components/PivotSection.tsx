
import React from 'react';
import { Loader2 } from 'lucide-react';
import PivotOptionForm from './forms/PivotOptionForm';
import PivotTriggerForm from './forms/PivotTriggerForm';
import { PivotOption } from '@/types/database';
import IntroSection from './pivot/IntroSection';
import ActiveTriggers from './pivot/ActiveTriggers';
import MetricsAtRisk from './pivot/MetricsAtRisk';
import PivotOptions from './pivot/PivotOptions';
import ScheduleButton from './pivot/ScheduleButton';
import DeletePivotDialog from './pivot/DeletePivotDialog';
import { usePivotSection } from '@/hooks/usePivotSection';

interface PivotSectionProps {
  pivotOptions: PivotOption[];
  refreshData: () => void;
  projectId: string;
}

const PivotSection = ({ pivotOptions, refreshData, projectId }: PivotSectionProps) => {
  const {
    isFormOpen,
    isTriggerFormOpen,
    selectedPivotOption,
    selectedTrigger,
    isDeleteDialogOpen,
    pivotOptionToDelete,
    metrics,
    metricTriggers,
    activeTriggers,
    isLoadingTriggers,
    metricsAtRisk,
    handleCreateNew,
    handleEdit,
    handleAddTrigger,
    handleEditTrigger,
    handleDelete,
    confirmDelete,
    setIsFormOpen,
    setIsTriggerFormOpen,
    setIsDeleteDialogOpen
  } = usePivotSection(projectId, pivotOptions);

  if (isLoadingTriggers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading pivot options...</span>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <IntroSection onCreateNew={handleCreateNew} />
      
      <ActiveTriggers 
        activeTriggers={activeTriggers} 
        onEditTrigger={handleEditTrigger} 
        onReviewOption={handleEdit} 
      />
      
      <MetricsAtRisk 
        metrics={metricsAtRisk} 
        hasActiveTriggers={activeTriggers.length > 0} 
      />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-validation-gray-900">Potential Pivot Options</h3>
      </div>
      
      <PivotOptions 
        pivotOptions={pivotOptions}
        metrics={metrics}
        metricTriggers={metricTriggers}
        onAddTrigger={handleAddTrigger}
        onEditTrigger={handleEditTrigger}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />
      
      <ScheduleButton />

      {isFormOpen && (
        <PivotOptionForm
          isOpen={isFormOpen}
          pivotOption={selectedPivotOption}
          projectId={projectId}
          metrics={metrics}
          onSave={refreshData}
          onClose={() => setIsFormOpen(false)}
        />
      )}
      
      {isTriggerFormOpen && (
        <PivotTriggerForm
          isOpen={isTriggerFormOpen}
          pivotTrigger={selectedTrigger}
          projectId={projectId}
          metrics={metrics}
          onSave={refreshData}
          onClose={() => setIsTriggerFormOpen(false)}
        />
      )}

      <DeletePivotDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          confirmDelete();
          refreshData();
        }}
        pivotOption={pivotOptionToDelete}
      />
    </div>
  );
};

export default PivotSection;
