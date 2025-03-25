
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, BarChart, RefreshCw } from 'lucide-react';
import { Experiment } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TypeformEmbedProps {
  experiment: Experiment;
  onRefresh?: () => void;
}

const TypeformEmbed = ({ experiment, onRefresh }: TypeformEmbedProps) => {
  // Use optional chaining to safely access properties that might not exist
  const typeform_id = (experiment as any).typeform_id; 
  const typeform_url = (experiment as any).typeform_url;
  const typeform_responses_count = (experiment as any).typeform_responses_count;
  
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  if (!typeform_id && !typeform_url) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-10 w-10 text-amber-400 mb-3" />
        <h3 className="text-lg font-medium mb-2">No Survey Form Linked</h3>
        <p className="text-gray-500 mb-4">
          This experiment doesn't have a Typeform survey connected to it yet.
        </p>
      </Card>
    );
  }
  
  const getEmbedUrl = () => {
    if (typeform_id) {
      return `https://form.typeform.com/to/${typeform_id}?typeform-embed=embed-widget`;
    } else if (typeform_url) {
      // Check if URL already has embed parameters
      if (typeform_url.includes('typeform-embed')) {
        return typeform_url;
      }
      
      // Add embed parameters if needed
      const separator = typeform_url.includes('?') ? '&' : '?';
      return `${typeform_url}${separator}typeform-embed=embed-widget`;
    }
    return '';
  };
  
  const openInNewTab = () => {
    if (typeform_url) {
      window.open(typeform_url, '_blank');
    } else if (typeform_id) {
      window.open(`https://form.typeform.com/to/${typeform_id}`, '_blank');
    }
  };

  const refreshResponses = async () => {
    try {
      setIsRefreshing(true);
      
      // TODO: Once we have the PostHog integration, fetch actual response counts here
      // For now, we'll simulate a response count update - in production this would be replaced
      // with an actual API call to Typeform or data from PostHog
      const responseIncrement = Math.floor(Math.random() * 5) + 1;
      const newResponseCount = (typeform_responses_count || 0) + responseIncrement;
      
      const { error } = await supabase
        .from('experiments')
        .update({ 
          typeform_responses_count: newResponseCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', experiment.id);
        
      if (error) throw error;
      
      if (onRefresh) {
        onRefresh();
      }
      
      toast({
        title: "Responses Updated",
        description: `Found ${newResponseCount} responses for this survey.`,
      });
    } catch (err) {
      console.error('Error refreshing responses:', err);
      toast({
        title: "Error",
        description: "Failed to refresh response count",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Survey Form</h3>
        <div className="space-x-2">
          {typeform_responses_count !== undefined && typeform_responses_count > 0 && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
              <BarChart className="h-3.5 w-3.5 mr-1" />
              {typeform_responses_count} responses
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshResponses}
            disabled={isRefreshing}
            className="flex items-center"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openInNewTab}
            className="flex items-center"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Open in new tab
          </Button>
        </div>
      </div>
      
      <Card className="w-full overflow-hidden border">
        <div className="aspect-[3/2] w-full">
          <iframe
            src={getEmbedUrl()}
            frameBorder="0"
            width="100%"
            height="100%"
            title="Typeform Survey"
            allow="camera; microphone; autoplay; encrypted-media; fullscreen; geolocation"
            className="bg-gray-50"
          ></iframe>
        </div>
      </Card>
    </div>
  );
};

export default TypeformEmbed;
