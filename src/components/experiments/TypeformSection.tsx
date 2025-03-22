
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { ExternalLink, Link, FormInput, BarChart } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Experiment } from '@/types/database';

interface TypeformSectionProps {
  form: UseFormReturn<any>;
  showPreview?: boolean;
}

const TypeformSection = ({ form, showPreview = false }: TypeformSectionProps) => {
  const typeformUrl = form.watch('typeform_url');
  const typeformId = form.watch('typeform_id');
  
  const extractTypeformIdFromUrl = (url: string) => {
    if (!url) return '';
    
    try {
      // Try to extract typeform ID from URL like https://form.typeform.com/to/ABCDEF
      const matches = url.match(/\/to\/([a-zA-Z0-9]+)$/);
      if (matches && matches[1]) {
        form.setValue('typeform_id', matches[1]);
        return matches[1];
      }
      
      // Try to extract from URL like https://yourusername.typeform.com/ABCDEF
      const matches2 = url.match(/typeform\.com\/([a-zA-Z0-9]+)$/);
      if (matches2 && matches2[1]) {
        form.setValue('typeform_id', matches2[1]);
        return matches2[1];
      }
      
      return '';
    } catch (e) {
      console.error('Error extracting Typeform ID:', e);
      return '';
    }
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('typeform_url', url);
    extractTypeformIdFromUrl(url);
  };
  
  const openTypeformWebsite = () => {
    window.open('https://www.typeform.com', '_blank');
  };
  
  const getEmbedUrl = () => {
    if (!typeformId) return '';
    return `https://form.typeform.com/to/${typeformId}?typeform-embed=embed-widget`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Data Collection</h3>
        <Button 
          type="button" 
          variant="outline" 
          onClick={openTypeformWebsite}
          className="text-xs flex items-center gap-1"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Create a Typeform
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="typeform_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typeform URL</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://form.typeform.com/to/xxxx" 
                    {...field} 
                    onChange={handleUrlChange} 
                  />
                </div>
              </FormControl>
              <FormDescription>
                Paste the URL of your Typeform survey to link it to this experiment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="typeform_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typeform ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Auto-extracted from URL"
                  {...field}
                  readOnly
                />
              </FormControl>
              <FormDescription>
                This ID is automatically extracted from the URL
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {showPreview && typeformId && (
        <Card className="p-4 mt-4">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div className="aspect-video w-full bg-gray-50 rounded-md border">
            <iframe
              src={getEmbedUrl()}
              frameBorder="0"
              width="100%"
              height="100%"
              title="Typeform Survey"
            ></iframe>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TypeformSection;
