
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BusinessPlanBanner = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-l-blue-500 mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-800">Create Your Business Plan</h3>
              <p className="text-blue-700 mt-1">
                Document your market research, strategy, and key business components to complement your Lean Startup approach
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/business-plan')}
            className="bg-blue-600 hover:bg-blue-700 text-white sm:self-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>Edit Business Plan</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessPlanBanner;
