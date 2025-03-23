
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Edit2, 
  TrendingUp,
  Check,
  Archive
} from 'lucide-react';
import { GrowthModel, GROWTH_FRAMEWORKS } from '@/types/database';
import GrowthModelForm from '@/components/forms/GrowthModelForm';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GrowthModelSectionProps {
  growthModels: GrowthModel[];
  activeModel: GrowthModel | null;
  projectId: string;
  refreshData: () => Promise<void>;
  onModelChange: (model: GrowthModel) => void;
}

const GrowthModelSection = ({ 
  growthModels, 
  activeModel, 
  projectId, 
  refreshData, 
  onModelChange 
}: GrowthModelSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<GrowthModel | null>(null);
  const { toast } = useToast();

  const handleOpenForm = (model?: GrowthModel) => {
    setEditingModel(model || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingModel(null);
  };

  const handleUpdateStatus = async (model: GrowthModel, newStatus: 'draft' | 'active' | 'archived') => {
    try {
      const { error } = await supabase
        .from('growth_models')
        .update({ status: newStatus })
        .eq('id', model.originalId || model.id);

      if (error) throw error;

      toast({
        title: 'Growth model updated',
        description: `The status has been changed to ${newStatus}`,
      });

      refreshData();
    } catch (error) {
      console.error('Error updating model status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update model status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <GrowthModelForm
          projectId={projectId}
          onSave={refreshData}
          onClose={handleCloseForm}
          model={editingModel}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Growth Models</h2>
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Growth Model
            </Button>
          </div>

          {growthModels.length === 0 ? (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
              <CardContent className="pt-6 pb-8 px-6 flex flex-col items-center text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Growth Models Yet</h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Create your first growth model to start tracking key metrics
                  and validating your growth strategy.
                </p>
                <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Growth Model
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {growthModels.map((model) => (
                <Card 
                  key={model.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeModel?.id === model.id ? 'ring-2 ring-blue-500 shadow-md' : ''
                  }`}
                  onClick={() => onModelChange(model)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {model.name}
                          <Badge variant={
                            model.status === 'active' 
                              ? 'default' 
                              : model.status === 'archived' 
                                ? 'secondary' 
                                : 'outline'
                          }>
                            {model.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {GROWTH_FRAMEWORKS[model.framework as keyof typeof GROWTH_FRAMEWORKS]?.name || model.framework}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                            >
                              <path
                                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleOpenForm(model);
                          }}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          {model.status !== 'active' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(model, 'active');
                            }}>
                              <Check className="mr-2 h-4 w-4" />
                              <span>Set as Active</span>
                            </DropdownMenuItem>
                          )}
                          {model.status !== 'archived' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(model, 'archived');
                            }}>
                              <Archive className="mr-2 h-4 w-4" />
                              <span>Archive</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {GROWTH_FRAMEWORKS[model.framework as keyof typeof GROWTH_FRAMEWORKS]?.stages.map((stage, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-50">{stage}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GrowthModelSection;
