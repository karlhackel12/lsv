
import React from 'react';
import { GrowthChannel } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign } from 'lucide-react';

interface PaidChannelsSectionProps {
  channels: GrowthChannel[];
}

const PaidChannelsSection = ({ channels }: PaidChannelsSectionProps) => {
  const paidChannels = channels.filter(c => c.category === 'paid');
  
  if (paidChannels.length === 0) {
    return null;
  }
  
  // Helper function to calculate CAC progress - lower is better
  const calculateCacProgress = (cac: number | null): number => {
    if (!cac) return 0;
    // Normalize CAC progress - assuming $1000 as a high CAC
    // Lower CAC is better, so we invert the progress
    const normalizedProgress = Math.max(0, Math.min(100, (1 - cac / 1000) * 100));
    return normalizedProgress;
  };
  
  // Helper function to calculate conversion rate progress - higher is better
  const calculateConversionProgress = (rate: number | null): number => {
    if (!rate) return 0;
    // Normalize conversion rate - assuming 0.3 (30%) as a high conversion
    return Math.max(0, Math.min(100, (rate / 0.3) * 100));
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
          <h4 className="text-sm font-medium">Paid Acquisition Channels</h4>
        </div>
        
        {paidChannels.length > 0 ? (
          <div className="space-y-4">
            {paidChannels.map(channel => (
              <div key={channel.id} className="space-y-2">
                <div className="flex justify-between items-baseline text-sm">
                  <span>{channel.name}</span>
                  <span className="font-medium">
                    {channel.cac ? `CAC: $${channel.cac}` : 'No CAC data'}
                  </span>
                </div>
                
                {channel.cac && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs text-gray-500">
                      <span>Customer Acquisition Cost</span>
                      <span>${channel.cac}</span>
                    </div>
                    <Progress 
                      value={calculateCacProgress(channel.cac)} 
                      className="h-1.5" 
                    />
                  </div>
                )}
                
                {channel.conversion_rate && (
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between items-baseline text-xs text-gray-500">
                      <span>Conversion Rate</span>
                      <span>{(channel.conversion_rate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={calculateConversionProgress(channel.conversion_rate)} 
                      className="h-1.5" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No paid channels defined yet</p>
            <p className="text-xs mt-1">Add channels in the "Channels" tab</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaidChannelsSection;
