
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Experiment, ExperimentTemplate } from '@/types/database';
import { adaptExperiments } from '@/utils/experiment-adapter';
import { FlaskConical, Info, ArrowLeft } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import { Button } from '@/components/ui/button';
import ExperimentForm from '@/components/forms/ExperimentForm';
import { Card, CardContent } from '@/components/ui/card';
import ExperimentDetailView from '@/components/experiments/ExperimentDetailView';
import DeleteExperimentDialog from '@/components/experiments/DeleteExperimentDialog';
import TemplateSelector from '@/components/experiments/TemplateSelector';
import { useExperimentTemplates } from '@/hooks/use-experiment-templates';
import ExperimentList from '@/components/experiments/ExperimentList'; // Add this import
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

const ExperimentsPage = () => {
  const { currentProject } = useProject();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<Experiment | null>(null);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExperimentTemplate | null>(null);
  
  const { templates, isLoading: isLoadingTemplates } = useExperimentTemplates();
  
  const rawStatus = searchParams.get('status');
  const statusFilter = rawStatus && ['planned', 'in-progress', 'completed'].includes(rawStatus) 
    ? rawStatus as 'planned' | 'in-progress' | 'completed'
    : null;
  
  const fetchExperiments = async () => {
    try {
      setIsLoading(true);
      
      if (!currentProject) return;
      
      let query = supabase
        .from('experiments')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false });
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching experiments:', error);
        return;
      }
      
      const processedData = adaptExperiments(data || []);
      
      console.log("Fetched experiments:", processedData);
      setExperiments(processedData);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentProject) {
      fetchExperiments();
    }
  }, [currentProject, statusFilter]);
  
  useEffect(() => {
    const experimentId = searchParams.get('id');
    if (experimentId && experiments.length > 0) {
      const experiment = experiments.find(e => e.id === experimentId);
      if (experiment) {
        setSelectedExperiment(experiment);
        setViewMode('detail');
      }
    }
  }, [searchParams, experiments]);
  
  useEffect(() => {
    const createParam = searchParams.get('create');
    if (createParam === 'true') {
      handleCreateNew();
    }
  }, [searchParams]);
  
  if (!currentProject) {
    return <div>Select a project to view experiments</div>;
  }
  
  const handleCreateNew = () => {
    setIsFormOpen(true);
  };
  
  const handleTemplateSelected = (template: ExperimentTemplate) => {
    setSelectedTemplate(template);
    setIsTemplateSelectorOpen(false);
    
    setSelectedExperiment({
      id: '',
      title: template.name,
      description: template.description || '',
      hypothesis: template.hypothesis_template || '',
      method: template.method || '',
      status: 'planned',
      category: template.category || 'problem',
      project_id: currentProject.id,
      metrics: [''], // Ensure metrics is an array
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Experiment);
    
    setIsFormOpen(true);
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTemplate(null);
    const params = new URLSearchParams(searchParams);
    params.delete('create');
    setSearchParams(params);
  };
  
  const handleFormSave = (experiment: Experiment) => {
    fetchExperiments();
    setIsFormOpen(false);
    setSelectedTemplate(null);
  };
  
  const handleEdit = (experiment: Experiment) => {
    setSearchParams({ id: experiment.id });
    setSelectedExperiment(experiment);
    setIsFormOpen(true);
  };
  
  const handleDelete = (experiment: Experiment) => {
    setExperimentToDelete(experiment);
    setIsDeleteDialogOpen(true);
  };
  
  const handleViewDetail = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setViewMode('detail');
    setSearchParams({ id: experiment.id });
  };
  
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedExperiment(null);
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    setSearchParams(params);
  };
  
  return (
    <div className="space-y-6">
      {viewMode === 'list' ? (
        <>
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">{currentProject.name}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Experiments</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Experiments</h1>
                    <p className="text-gray-600 mt-1 max-w-2xl">
                      Design and run experiments to validate your hypotheses and collect 
                      evidence to make informed decisions about your product.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateNew} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 h-auto"
                  size="lg"
                >
                  Create New Experiment
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <ExperimentList 
            experiments={experiments}
            refreshData={fetchExperiments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateNew={handleCreateNew}
            onViewDetail={handleViewDetail}
            isGrowthExperiment={false}
          />
        </>
      ) : (
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={handleBackToList}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experiments
          </Button>
          
          {selectedExperiment && (
            <ExperimentDetailView 
              experiment={selectedExperiment}
              onEdit={() => handleEdit(selectedExperiment)}
              onClose={handleBackToList}
              relatedHypothesis={null}
              onRefresh={fetchExperiments}
              projectId={currentProject.id}
            />
          )}
        </div>
      )}
      
      <ExperimentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        experiment={selectedExperiment}
        projectId={currentProject.id}
      />

      <DeleteExperimentDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        experimentToDelete={experimentToDelete}
        refreshData={fetchExperiments}
      />
      
      <TemplateSelector
        open={isTemplateSelectorOpen}
        onOpenChange={setIsTemplateSelectorOpen}
        templates={templates}
        onSelectTemplate={handleTemplateSelected}
        isLoading={isLoadingTemplates}
      />
    </div>
  );
};

export default ExperimentsPage;
