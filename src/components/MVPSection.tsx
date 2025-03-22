
import React from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';

interface MVPFeature {
  id: number;
  feature: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  notes: string;
}

interface MVPSectionProps {
  mvpFeatures: MVPFeature[];
}

const MVPSection = ({ mvpFeatures }: MVPSectionProps) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-validation-gray-900">MVP Development</h2>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          The Minimum Viable Product includes only the core features needed to validate your key hypotheses and deliver value to early adopters.
        </p>
      </Card>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-200">
        <h3 className="text-xl font-bold mb-5 text-validation-gray-900">MVP Definition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Core Value Proposition</p>
            <p className="text-validation-gray-700">
              Extending English learning beyond the classroom through AI-enhanced spaced repetition and daily practice, while providing teachers with engagement insights.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Target Early Adopters</p>
            <p className="text-validation-gray-700">
              Tech-savvy independent English teachers in São Paulo and Rio with 5+ existing students seeking professional English skills.
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-validation-gray-500 mb-2">Success Metrics</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-validation-gray-100 text-validation-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-validation-gray-200">
              65%+ daily student engagement
            </span>
            <span className="bg-validation-gray-100 text-validation-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-validation-gray-200">
              80%+ teacher satisfaction
            </span>
            <span className="bg-validation-gray-100 text-validation-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-validation-gray-200">
              70%+ student conversion to paid
            </span>
            <span className="bg-validation-gray-100 text-validation-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-validation-gray-200">
              30%+ vocabulary retention improvement
            </span>
          </div>
        </div>
      </Card>
      
      <h3 className="text-xl font-bold mb-6 text-validation-gray-900">Feature Prioritization</h3>
      <Card className="mb-8 overflow-hidden animate-slideUpFade animate-delay-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-validation-gray-200">
            <thead>
              <tr className="bg-validation-gray-50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Feature</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-validation-gray-200">
              {mvpFeatures.map((feature) => (
                <tr key={feature.id} className="hover:bg-validation-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-validation-gray-900">{feature.feature}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      feature.priority === 'high' ? 'bg-validation-red-50 text-validation-red-700 border border-validation-red-200' : 
                      feature.priority === 'medium' ? 'bg-validation-yellow-50 text-validation-yellow-700 border border-validation-yellow-200' : 
                      'bg-validation-blue-50 text-validation-blue-700 border border-validation-blue-200'
                    }`}>
                      {feature.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={feature.status as any} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-validation-gray-500">{feature.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <h3 className="text-xl font-bold mb-6 text-validation-gray-900">Development Progress</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 animate-slideUpFade animate-delay-400">
          <h4 className="font-bold text-lg mb-5 text-validation-gray-900">Overall MVP Progress</h4>
          <div className="mb-6">
            <ProgressBar 
              value={25} 
              label="25% complete" 
              variant="info" 
              showValue={false}
              size="md"
              className="mb-6"
            />
          </div>
          
          <h5 className="font-medium mb-2 text-validation-gray-700">Phase 1: Foundation</h5>
          <ProgressBar 
            value={80} 
            label="80% complete" 
            variant="success" 
            showValue={false}
            size="sm"
            className="mb-6"
          />
          
          <h5 className="font-medium mb-2 text-validation-gray-700">Phase 2: Teacher Features</h5>
          <ProgressBar 
            value={40} 
            label="40% complete" 
            variant="warning" 
            showValue={false}
            size="sm"
            className="mb-6"
          />
          
          <h5 className="font-medium mb-2 text-validation-gray-700">Phase 3: Student Features</h5>
          <ProgressBar 
            value={10} 
            label="10% complete" 
            variant="info" 
            showValue={false}
            size="sm"
            className="mb-6"
          />
          
          <h5 className="font-medium mb-2 text-validation-gray-700">Phase 4: Business Model</h5>
          <ProgressBar 
            value={0} 
            label="Not started" 
            variant="default" 
            showValue={false}
            size="sm"
          />
        </Card>
        
        <div className="flex flex-col">
          <h4 className="font-bold text-lg mb-5 text-validation-gray-900">Currently Working On</h4>
          
          <Card className="bg-validation-yellow-50 border border-validation-yellow-200 p-5 mb-5 animate-slideUpFade animate-delay-500">
            <h5 className="font-bold text-validation-gray-900">Teacher Dashboard</h5>
            <p className="text-sm text-validation-gray-600 mb-4">Implementing student management and assignment features</p>
            <div className="flex justify-between">
              <span className="bg-validation-red-50 text-validation-red-700 border border-validation-red-200 text-xs font-medium px-2.5 py-1 rounded-full">High Priority</span>
              <span className="text-sm text-validation-gray-500">Due: March 29, 2025</span>
            </div>
          </Card>
          
          <Card className="bg-validation-yellow-50 border border-validation-yellow-200 p-5 mb-5 animate-slideUpFade animate-delay-500">
            <h5 className="font-bold text-validation-gray-900">Student Assignment System</h5>
            <p className="text-sm text-validation-gray-600 mb-4">Creating the assignment workflow and student view</p>
            <div className="flex justify-between">
              <span className="bg-validation-red-50 text-validation-red-700 border border-validation-red-200 text-xs font-medium px-2.5 py-1 rounded-full">High Priority</span>
              <span className="text-sm text-validation-gray-500">Due: April 5, 2025</span>
            </div>
          </Card>
          
          <div className="flex justify-end mt-auto">
            <button className="border border-validation-gray-200 hover:bg-validation-gray-50 text-validation-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-300">
              View Development Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MVPSection;
