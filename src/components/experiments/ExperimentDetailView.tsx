
import React, { useState } from 'react';
import { Button } from '@/components/ui/card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  LinkIcon, 
  FileText, 
  Beaker, 
  CheckCircle, 
  CircleX, 
  CalendarClock, 
  BarChart2,
  Book, 
  Layers,
  Info
} from 'lucide-react';
import { Experiment, Hypothesis } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import ExperimentConnectionsPanel from './ExperimentConnectionsPanel';
import ExperimentJournal from './ExperimentJournal';
import ExperimentStatusActions from './ExperimentStatusActions';

interface ExperimentDetailViewProps {
  experiment: Experiment;
  onEdit: () => void;
  onClose?: () => void;
  relatedHypothesis: Hypothesis | null;
  onRefresh?: () => void;
  projectId?: string;
}

const ExperimentDetailView: React.FC<ExperimentDetailViewProps> = ({
  experiment,
  onEdit,
  onClose,
  relatedHypothesis,
  onRefresh,
  projectId
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate experiment progress based on status and completed fields
  const calculateProgress = () => {
    switch(experiment.status) {
      case 'planned': return 10;
      case 'in-progress': 
        return experiment.results ? 75 : 50;
      case 'completed': return 100;
      default: return 10;
    }
  };
  
  const progress = calculateProgress();
  
  const navigateToHypothesis = () => {
    if (relatedHypothesis) {
      navigate('/hypotheses');
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  // Generate appropriate indicator based on experiment status
  const renderStatusIndicator = () => {
    if (experiment.status === 'completed') {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>Experiment completed</span>
        </div>
      );
    } else if (experiment.status === 'in-progress') {
      return (
        <div className="flex items-center space-x-2 text-amber-600">
          <Beaker className="h-5 w-5" />
          <span>Experiment in progress</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <FileText className="h-5 w-5" />
          <span>Experiment planned</span>
        </div>
      );
    }
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section with Progress */}
      <Card className="overflow-hidden">
        <div className="bg-gray-50 p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{experiment.title}</h1>
              <div className="flex items-center mt-2 space-x-3 text-sm text-gray-500">
                <StatusBadge status={experiment.status} />
                <span className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-1" />
                  {new Date(experiment.updated_at).toLocaleDateString()}
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {experiment.category || 'Experiment'}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onEdit} 
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Experiment
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Experiment Progress</span>
              <span className="text-sm">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Planning</span>
              <span className="text-xs text-gray-500">In Progress</span>
              <span className="text-xs text-gray-500">Completed</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              <div>
                {renderStatusIndicator()}
                
                <div className="mt-4">
                  <ExperimentStatusActions 
                    experiment={experiment} 
                    refreshData={handleRefresh} 
                    onEdit={onEdit} 
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
          <TabsTrigger value="journal" className="flex items-center">
            <Book className="h-4 w-4 mr-2" />
            Journal
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Hypothesis</h2>
            <p className="text-gray-700 mb-4">{experiment.hypothesis}</p>
            
            {relatedHypothesis && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <LinkIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="text-sm font-medium text-blue-700">Linked to Hypothesis</h3>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7 bg-white"
                    onClick={navigateToHypothesis}
                  >
                    View Hypothesis
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-700">{relatedHypothesis.statement}</p>
                  <div className="flex items-center mt-2">
                    <StatusBadge status={relatedHypothesis.status as any} />
                    <span className="text-xs text-gray-500 ml-2">
                      Last updated: {new Date(relatedHypothesis.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Experiment Method</h2>
              <p className="text-gray-700 whitespace-pre-line">{experiment.method}</p>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Success Criteria</h2>
              <p className="text-gray-700 whitespace-pre-line">{experiment.metrics}</p>
            </Card>
          </div>
          
          {/* Connections Panel */}
          {projectId && (
            <ExperimentConnectionsPanel
              experiment={experiment}
              projectId={projectId}
              relatedHypothesis={relatedHypothesis}
              onRefresh={handleRefresh}
            />
          )}
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start">
              <div className="mr-4">
                <Beaker className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Results</h2>
                {experiment.results ? (
                  <p className="text-gray-700 whitespace-pre-line">{experiment.results}</p>
                ) : (
                  <div className="flex items-center p-4 bg-gray-50 rounded-md text-gray-500 border border-gray-200">
                    <Info className="h-5 w-5 mr-2 text-blue-500" />
                    No results recorded yet. Use the "Log Results" button to add them when available.
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="flex items-start">
                <div className="mr-4">
                  <Layers className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Key Insights</h2>
                  {experiment.insights ? (
                    <p className="text-gray-700 whitespace-pre-line">{experiment.insights}</p>
                  ) : (
                    <div className="flex items-center p-4 bg-gray-50 rounded-md text-gray-500 border border-gray-200">
                      <Info className="h-5 w-5 mr-2 text-blue-500" />
                      No insights recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="flex items-start">
                <div className="mr-4">
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Decisions & Next Steps</h2>
                  {experiment.decisions ? (
                    <p className="text-gray-700 whitespace-pre-line">{experiment.decisions}</p>
                  ) : (
                    <div className="flex items-center p-4 bg-gray-50 rounded-md text-gray-500 border border-gray-200">
                      <Info className="h-5 w-5 mr-2 text-blue-500" />
                      No decisions recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Journal Tab */}
        <TabsContent value="journal" className="space-y-6">
          <ExperimentJournal 
            experiment={experiment} 
            refreshExperiment={onRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExperimentDetailView;
