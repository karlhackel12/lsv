import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, BarChart2, Book } from 'lucide-react';
import { Experiment, Hypothesis } from '@/types/database';
import { useNavigate } from 'react-router-dom';

// Import refactored components
import ExperimentHeader from './detail/ExperimentHeader';
import ExperimentProgressBar from './detail/ExperimentProgressBar';
import ExperimentStatusIndicator from './detail/ExperimentStatusIndicator';
import ExperimentStatusActions from './ExperimentStatusActions';
import ExperimentOverviewTab from './detail/ExperimentOverviewTab';
import ExperimentResultsTab from './detail/ExperimentResultsTab';
import ExperimentJournal from './ExperimentJournal';

interface ExperimentDetailViewProps {
  experiment: Experiment;
  onEdit: () => void;
  onClose?: () => void;
  relatedHypothesis: Hypothesis | null;
  onRefresh?: () => void;
  projectId?: string;
  isGrowthExperiment?: boolean;
}

const ExperimentDetailView: React.FC<ExperimentDetailViewProps> = ({
  experiment,
  onEdit,
  onClose,
  relatedHypothesis,
  onRefresh,
  projectId,
  isGrowthExperiment = false
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  const navigateToHypothesis = () => {
    if (relatedHypothesis) {
      navigate('/hypotheses');
    }
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section with Progress */}
      <Card className="overflow-hidden">
        <div className="bg-gray-50 p-6 border-b">
          <ExperimentHeader 
            experiment={experiment} 
            onEdit={onEdit} 
            hasRelatedHypothesis={!!relatedHypothesis}
            isGrowthExperiment={isGrowthExperiment}
          />
          <ExperimentProgressBar experiment={experiment} />
        </div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              <div>
                <ExperimentStatusIndicator 
                  experiment={experiment}
                  isGrowthExperiment={isGrowthExperiment}
                />
                
                <div className="mt-4">
                  <ExperimentStatusActions 
                    experiment={experiment} 
                    refreshData={handleRefresh} 
                    onEdit={() => onEdit()} 
                    isGrowthExperiment={isGrowthExperiment}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Results & Insights
          </TabsTrigger>
          {!isGrowthExperiment && (
            <TabsTrigger value="journal" className="flex items-center">
              <Book className="h-4 w-4 mr-2" />
              Journal
            </TabsTrigger>
          )}
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <ExperimentOverviewTab 
            experiment={experiment}
            relatedHypothesis={relatedHypothesis}
            projectId={projectId}
            onRefresh={handleRefresh}
            navigateToHypothesis={navigateToHypothesis}
            isGrowthExperiment={isGrowthExperiment}
          />
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results">
          <ExperimentResultsTab 
            experiment={experiment}
            isGrowthExperiment={isGrowthExperiment}
          />
        </TabsContent>
        
        {/* Journal Tab - Only for regular experiments */}
        {!isGrowthExperiment && (
          <TabsContent value="journal" className="space-y-6">
            <ExperimentJournal 
              experiment={experiment} 
              refreshExperiment={onRefresh}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ExperimentDetailView;
