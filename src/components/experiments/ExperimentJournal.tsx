
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Book, Calendar, Filter } from 'lucide-react';
import { Experiment, ExperimentLog } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ExperimentLogEntry from './ExperimentLogEntry';
import ExperimentLogForm from './ExperimentLogForm';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

interface ExperimentJournalProps {
  experiment: Experiment;
  refreshExperiment?: () => void;
}

const ExperimentJournal = ({ experiment, refreshExperiment }: ExperimentJournalProps) => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ExperimentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('experiment_logs')
        .select('*')
        .eq('experiment_id', experiment.id)
        .order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('type', filter);
      }
        
      const { data, error } = await query;
        
      if (error) throw error;
      
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching experiment logs:', err);
      toast({
        title: 'Error',
        description: 'Failed to load experiment journal entries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (experiment) {
      fetchLogs();
    }
  }, [experiment.id, filter]);
  
  const handleSuccessfulSubmit = () => {
    fetchLogs();
    if (refreshExperiment) {
      refreshExperiment();
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Book className="h-5 w-5 mr-2 text-blue-500" />
          Experiment Journal
        </h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              {filter === 'all' ? 'All entries' : 
               filter === 'result' ? 'Results only' : 
               filter === 'insight' ? 'Insights only' : 
               'Notes only'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
              <DropdownMenuRadioItem value="all">All entries</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="result">Results only</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="insight">Insights only</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="note">Notes only</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs defaultValue="journal" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="journal">
          <ExperimentLogForm 
            experimentId={experiment.id} 
            onSuccess={handleSuccessfulSubmit} 
          />
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-medium mb-1">No journal entries yet</h3>
              <p className="text-sm">Record results, insights, and notes as your experiment progresses.</p>
            </div>
          ) : (
            <div>
              {logs.map((log, index) => (
                <ExperimentLogEntry 
                  key={log.id} 
                  log={log} 
                  isLatest={index === 0}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="timeline">
          <div className="relative pl-6 border-l border-gray-200">
            {isLoading ? (
              <div className="space-y-6 my-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-9 mt-1.5">
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <div className="mb-1 flex items-center">
                      <Skeleton className="h-4 w-24 mr-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-medium mb-1">No timeline entries yet</h3>
                <p className="text-sm">Record activities as your experiment progresses.</p>
              </div>
            ) : (
              <div className="space-y-6 my-6">
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-9 mt-1.5">
                      <div className={`h-5 w-5 rounded-full 
                        ${log.type === 'result' ? 'bg-green-500' : 
                         log.type === 'insight' ? 'bg-blue-500' : 'bg-gray-400'}`} 
                      />
                    </div>
                    <div className="mb-1">
                      <span className="font-medium text-sm mr-2">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{log.type === 'result' ? 'Result' : log.type === 'insight' ? 'Insight' : 'Note'}: </span>
                      {log.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ExperimentJournal;
