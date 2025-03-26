
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Info, BarChart2, Book, Beaker, ArrowUpRight, Lightbulb } from 'lucide-react';
import { Experiment, Hypothesis } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

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
    if (!relatedHypothesis) return;
    
    // Navigate to the correct validation page based on hypothesis phase
    if (relatedHypothesis.phase === 'problem') {
      navigate('/problem-validation');
    } else {
      navigate('/solution-validation');
    }
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section with Progress */}
      <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
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
          <div className="flex items-start justify-between">
            <ExperimentStatusIndicator 
              experiment={experiment}
              isGrowthExperiment={isGrowthExperiment}
            />
            
            <ExperimentStatusActions 
              experiment={experiment} 
              refreshData={handleRefresh} 
              onEdit={onEdit} 
              isGrowthExperiment={isGrowthExperiment}
            />
          </div>
          
          {relatedHypothesis && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {relatedHypothesis.phase === 'problem' ? (
                    <Lightbulb className="h-5 w-5 text-blue-500 mr-2" />
                  ) : (
                    <Beaker className="h-5 w-5 text-purple-500 mr-2" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-blue-700">
                      Linked to {relatedHypothesis.phase === 'problem' ? 'Problem' : 'Solution'} Hypothesis
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">{relatedHypothesis.statement}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7 flex items-center bg-white"
                  onClick={navigateToHypothesis}
                >
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Info className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">Experiment Overview</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-semibold mb-2">Hypothesis</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {experiment.hypothesis}
                </p>
              </div>
              
              <div>
                <h3 className="text-md font-semibold mb-2">Method</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {experiment.method}
                </p>
              </div>
              
              <div>
                <h3 className="text-md font-semibold mb-2">Success Criteria</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {experiment.metrics}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <BarChart2 className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Results & Insights</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-semibold mb-2">Results</h3>
                {experiment.results ? (
                  <p className="text-gray-700 whitespace-pre-line">
                    {experiment.results}
                  </p>
                ) : (
                  <p className="text-amber-600 bg-amber-50 p-3 rounded-md text-sm">
                    No results have been recorded for this experiment yet.
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-md font-semibold mb-2">Insights</h3>
                {experiment.insights ? (
                  <p className="text-gray-700 whitespace-pre-line">
                    {experiment.insights}
                  </p>
                ) : (
                  <p className="text-amber-600 bg-amber-50 p-3 rounded-md text-sm">
                    No insights have been recorded for this experiment yet.
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-md font-semibold mb-2">Next Steps</h3>
                {experiment.decisions ? (
                  <p className="text-gray-700 whitespace-pre-line">
                    {experiment.decisions}
                  </p>
                ) : (
                  <p className="text-amber-600 bg-amber-50 p-3 rounded-md text-sm">
                    No decisions or next steps have been recorded yet.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Journal Section - Only for regular experiments */}
      {!isGrowthExperiment && (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Book className="h-5 w-5 text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold">Experiment Journal</h2>
            </div>
            
            <ExperimentJournal 
              experiment={experiment} 
              refreshExperiment={onRefresh}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExperimentDetailView;
