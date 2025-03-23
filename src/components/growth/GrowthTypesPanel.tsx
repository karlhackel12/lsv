
import React from 'react';
import { GrowthModel, GrowthMetric, GrowthChannel } from '@/types/database';
import { 
  TrendingUp, 
  Repeat, 
  DollarSign,
  Users
} from 'lucide-react';
import GrowthTypeCard from './types/GrowthTypeCard';
import PaidChannelsSection from './types/PaidChannelsSection';

interface GrowthTypesPanelProps {
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
  channels: GrowthChannel[];
}

const GrowthTypesPanel = ({ 
  growthModel, 
  projectId, 
  metrics, 
  channels 
}: GrowthTypesPanelProps) => {
  // Filter metrics by category for each growth type
  const viralMetrics = metrics.filter(m => 
    m.category === 'referral' || m.name.toLowerCase().includes('viral') || 
    m.name.toLowerCase().includes('referral') || m.name.toLowerCase().includes('k-factor')
  );
  
  const stickyMetrics = metrics.filter(m => 
    m.category === 'retention' || m.name.toLowerCase().includes('retention') || 
    m.name.toLowerCase().includes('churn') || m.name.toLowerCase().includes('active')
  );
  
  const paidMetrics = metrics.filter(m => 
    m.category === 'acquisition' && channels.some(c => c.category === 'paid') || 
    m.name.toLowerCase().includes('cac') || m.name.toLowerCase().includes('ltv')
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Viral Growth Card */}
        <GrowthTypeCard
          title="Viral Growth"
          description="User-to-user growth through referrals"
          icon={<TrendingUp className="h-5 w-5 mr-2 text-green-500" />}
          metrics={viralMetrics}
          badgeColor="bg-green-100 text-green-800"
        />

        {/* Sticky Growth Card */}
        <GrowthTypeCard
          title="Sticky Growth"
          description="User retention and engagement over time"
          icon={<Repeat className="h-5 w-5 mr-2 text-purple-500" />}
          metrics={stickyMetrics}
          badgeColor="bg-purple-100 text-purple-800"
        />

        {/* Paid Growth Card with Channels Section */}
        <div>
          <GrowthTypeCard
            title="Paid Growth"
            description="Acquisition through paid channels"
            icon={<DollarSign className="h-5 w-5 mr-2 text-blue-500" />}
            metrics={paidMetrics}
            badgeColor="bg-blue-100 text-blue-800"
          />
          
          {/* Conditionally render the paid channels section */}
          <PaidChannelsSection channels={channels} />
        </div>
      </div>
    </div>
  );
};

export default GrowthTypesPanel;
