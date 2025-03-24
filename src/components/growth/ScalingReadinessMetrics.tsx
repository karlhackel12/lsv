
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  BarChart3, 
  PieChart,
  Users,
  Server,
  DollarSign,
  Settings,
  PlusCircle,
  Edit2,
  Trash2,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScalingReadinessMetric, SCALING_METRIC_CATEGORIES } from '@/types/database';
import ScalingMetricForm from './ScalingMetricForm';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ScalingReadinessMetricsProps {
  projectId: string;
  refreshData: () => Promise<void>;
}

const ScalingReadinessMetrics: React.FC<ScalingReadinessMetricsProps> = ({ 
  projectId, 
  refreshData
}) => {
  const [metrics, setMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [editingMetric, setEditingMetric] = useState<ScalingReadinessMetric | null>(null);
  const [deletingMetric, setDeletingMetric] = useState<ScalingReadinessMetric | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchMetrics();
    }
  }, [projectId]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('importance', { ascending: false });
        
      if (error) throw error;
      
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching scaling metrics:', err);
      toast({
        title: 'Error',
        description: 'Failed to load scaling readiness metrics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (metric?: ScalingReadinessMetric) => {
    setEditingMetric(metric || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMetric(null);
  };

  const handleSave = async () => {
    await fetchMetrics();
    await refreshData();
  };

  const handleDeleteClick = (metric: ScalingReadinessMetric) => {
    setDeletingMetric(metric);
    setShowDeleteConfirm(true);
  };

  const handleDeleteMetric = async () => {
    if (!deletingMetric) return;
    
    try {
      const { error } = await supabase
        .from('scaling_readiness_metrics')
        .delete()
        .eq('id', deletingMetric.id);
        
      if (error) throw error;
      
      toast({
        title: 'Metric deleted',
        description: 'The scaling readiness metric has been deleted',
      });
      
      await fetchMetrics();
      setShowDeleteConfirm(false);
      setDeletingMetric(null);
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the metric',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'achieved':
        return <Badge className="bg-green-500">Achieved</Badge>;
      case 'on-track':
        return <Badge className="bg-blue-500">On Track</Badge>;
      case 'needs-improvement':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-400">Needs Improvement</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getProgressValue = (current: number, target: number) => {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'unit_economics':
        return <DollarSign className="h-4 w-4" />;
      case 'retention':
        return <PieChart className="h-4 w-4" />;
      case 'acquisition':
        return <Target className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'infrastructure':
        return <Server className="h-4 w-4" />;
      case 'product':
        return <TrendingUp className="h-4 w-4" />;
      case 'finance':
        return <DollarSign className="h-4 w-4" />;
      case 'operations':
        return <Settings className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'percentage':
        return `${value}%`;
      case 'ratio':
        return `${value}:1`;
      case 'currency':
        return `$${value}`;
      case 'time':
        return `${value} days`;
      default:
        return value.toString();
    }
  };

  const filteredMetrics = activeTab === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === activeTab);
  
  const calculateReadiness = () => {
    if (metrics.length === 0) return 0;
    
    const weightedSum = metrics.reduce((sum, metric) => {
      const progress = getProgressValue(metric.current_value, metric.target_value);
      return sum + (progress * metric.importance);
    }, 0);
    
    const totalWeight = metrics.reduce((sum, metric) => sum + metric.importance, 0);
    
    return Math.round(weightedSum / totalWeight);
  };

  const readiness = calculateReadiness();

  return (
    <div className="space-y-6">
      {showForm ? (
        <ScalingMetricForm
          projectId={projectId}
          metric={editingMetric}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Scaling Readiness Metrics</h2>
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Metric
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="lg:col-span-3">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">Metrics Dashboard</CardTitle>
                <CardDescription>
                  Track key metrics that indicate your readiness to scale
                </CardDescription>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-2">
                  <TabsList>
                    <TabsTrigger value="all">All Categories</TabsTrigger>
                    <TabsTrigger value="unit_economics">Economics</TabsTrigger>
                    <TabsTrigger value="retention">Retention</TabsTrigger>
                    <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <p>Loading metrics...</p>
                  </div>
                ) : filteredMetrics.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Metric</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMetrics.map(metric => (
                        <TableRow key={metric.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(metric.category)}
                              <span>{SCALING_METRIC_CATEGORIES[metric.category as keyof typeof SCALING_METRIC_CATEGORIES] || metric.category}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-xs text-gray-500">{metric.description}</div>
                          </TableCell>
                          <TableCell>{formatValue(metric.current_value, metric.unit)}</TableCell>
                          <TableCell>{formatValue(metric.target_value, metric.unit)}</TableCell>
                          <TableCell className="w-[160px]">
                            <Progress value={getProgressValue(metric.current_value, metric.target_value)} className="h-2" />
                          </TableCell>
                          <TableCell>{getStatusBadge(metric.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenForm(metric)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteClick(metric)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-2 flex justify-center">
                      <AlertTriangle className="h-12 w-12 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-medium">No Metrics Found</h3>
                    <p className="text-gray-500 mb-4">
                      {activeTab === 'all' 
                        ? "You haven't added any scaling readiness metrics yet." 
                        : `You haven't added any metrics for this category.`}
                    </p>
                    <Button onClick={() => handleOpenForm()}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Metric
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Readiness Score</CardTitle>
                <CardDescription>
                  Overall scaling readiness
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex justify-center py-4">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-gray-200" 
                        strokeWidth="10" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                      <circle 
                        className={`${
                          readiness >= 80 ? 'text-green-500' : 
                          readiness >= 50 ? 'text-yellow-500' : 'text-red-500'
                        }`}
                        strokeWidth="10" 
                        strokeDasharray={`${readiness * 2.51} 251`}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{readiness}%</span>
                      <span className="text-sm text-gray-500">
                        {readiness >= 80 ? 'Ready to Scale' : 
                         readiness >= 50 ? 'Getting There' : 'Not Ready'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  {Object.entries(SCALING_METRIC_CATEGORIES).map(([key, label]) => {
                    const categoryMetrics = metrics.filter(m => m.category === key);
                    if (categoryMetrics.length === 0) return null;
                    
                    const categoryProgress = categoryMetrics.reduce((sum, m) => {
                      return sum + getProgressValue(m.current_value, m.target_value);
                    }, 0) / categoryMetrics.length;
                    
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{label}</span>
                          <span>{Math.round(categoryProgress)}%</span>
                        </div>
                        <Progress value={categoryProgress} className="h-1" />
                      </div>
                    );
                  })}
                </div>
                
                {metrics.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Add metrics to see your readiness score</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="w-full space-y-2">
                  <h4 className="text-sm font-medium">Readiness Status:</h4>
                  <div className="p-2 rounded border flex items-start">
                    {readiness >= 80 ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">Ready to Scale</div>
                          <p className="text-xs text-gray-500">Your core metrics indicate you're ready for accelerated growth.</p>
                        </div>
                      </>
                    ) : readiness >= 50 ? (
                      <>
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-medium text-yellow-600">Proceed with Caution</div>
                          <p className="text-xs text-gray-500">Some key metrics need improvement before aggressive scaling.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-medium text-red-600">Not Ready</div>
                          <p className="text-xs text-gray-500">Focus on improving core metrics before attempting to scale.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
      
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete scaling metric</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this metric? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMetric}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScalingReadinessMetrics;
