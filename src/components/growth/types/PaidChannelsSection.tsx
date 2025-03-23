
import React from 'react';
import { GrowthChannel } from '@/types/database';

interface PaidChannelsSectionProps {
  channels: GrowthChannel[];
}

const PaidChannelsSection = ({ channels }: PaidChannelsSectionProps) => {
  const paidChannels = channels.filter(c => c.category === 'paid');
  
  if (paidChannels.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-medium mb-2">Paid Channels</h4>
      <div className="space-y-2">
        {paidChannels.map(channel => (
          <div key={channel.id} className="flex justify-between text-xs">
            <span>{channel.name}</span>
            <span className="font-medium">
              {channel.cac ? `CAC: $${channel.cac}` : 'No CAC data'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaidChannelsSection;
