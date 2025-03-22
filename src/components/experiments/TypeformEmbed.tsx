
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, BarChart } from 'lucide-react';
import { Experiment } from '@/types/database';

interface TypeformEmbedProps {
  experiment: Experiment;
}

const TypeformEmbed = ({ experiment }: TypeformEmbedProps) => {
  const { typeform_id, typeform_url, typeform_responses_count } = experiment;
  
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
      return typeform_url;
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
