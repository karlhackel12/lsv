
import React from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';

interface Metric {
  id: number;
  category: string;
  name: string;
  target: string;
  current: string;
  status: string;
}

interface MetricsSectionProps {
  metrics: Metric[];
}

const MetricsSection = ({ metrics }: MetricsSectionProps) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-validation-gray-900">Key Metrics</h2>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          Track and measure your progress using the AARRR framework (Acquisition, Activation, Retention, Revenue, Referral).
        </p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <Card className="p-5 flex flex-col items-center text-center animate-slideUpFade animate-delay-200" hover={true}>
          <h3 className="font-semibold mb-2 text-validation-gray-900">Acquisition</h3>
          <p className="text-3xl font-bold text-validation-blue-600 mb-1">18%</p>
          <p className="text-sm text-validation-gray-600 mb-1">Teacher signup rate</p>
          <p className="text-xs text-validation-gray-500 mb-3">Target: &gt;20%</p>
          <ProgressBar value={90} variant="warning" size="sm" className="w-full mt-auto" />
        </Card>
        
        <Card className="p-5 flex flex-col items-center text-center animate-slideUpFade animate-delay-300" hover={true}>
          <h3 className="font-semibold mb-2 text-validation-gray-900">Activation</h3>
          <p className="text-3xl font-bold text-validation-blue-600 mb-1">92%</p>
          <p className="text-sm text-validation-gray-600 mb-1">Onboarding completion</p>
          <p className="text-xs text-validation-gray-500 mb-3">Target: &gt;85%</p>
          <ProgressBar value={100} variant="success" size="sm" className="w-full mt-auto" />
        </Card>
        
        <Card className="p-5 flex flex-col items-center text-center animate-slideUpFade animate-delay-400" hover={true}>
          <h3 className="font-semibold mb-2 text-validation-gray-900">Retention</h3>
          <p className="text-3xl font-bold text-validation-blue-600 mb-1">68%</p>
          <p className="text-sm text-validation-gray-600 mb-1">Daily active students</p>
          <p className="text-xs text-validation-gray-500 mb-3">Target: &gt;65%</p>
          <ProgressBar value={100} variant="success" size="sm" className="w-full mt-auto" />
        </Card>
        
        <Card className="p-5 flex flex-col items-center text-center animate-slideUpFade animate-delay-500" hover={true}>
          <h3 className="font-semibold mb-2 text-validation-gray-900">Revenue</h3>
          <p className="text-3xl font-bold text-validation-gray-400 mb-1">-</p>
          <p className="text-sm text-validation-gray-600 mb-1">Student conversion</p>
          <p className="text-xs text-validation-gray-500 mb-3">Target: &gt;70%</p>
          <ProgressBar value={0} variant="default" size="sm" className="w-full mt-auto" />
        </Card>
        
        <Card className="p-5 flex flex-col items-center text-center animate-slideUpFade animate-delay-500" hover={true}>
          <h3 className="font-semibold mb-2 text-validation-gray-900">Referral</h3>
          <p className="text-3xl font-bold text-validation-gray-400 mb-1">-</p>
          <p className="text-sm text-validation-gray-600 mb-1">Teacher referral rate</p>
          <p className="text-xs text-validation-gray-500 mb-3">Target: &gt;0.5</p>
          <ProgressBar value={0} variant="default" size="sm" className="w-full mt-auto" />
        </Card>
      </div>
      
      <h3 className="text-xl font-bold mb-6 text-validation-gray-900">All Metrics</h3>
      <Card className="overflow-hidden animate-slideUpFade animate-delay-500">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-validation-gray-200">
            <thead>
              <tr className="bg-validation-gray-50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Metric</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Target</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Current</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-validation-gray-200">
              {metrics.map((metric) => (
                <tr key={metric.id} className="hover:bg-validation-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-validation-gray-900">{metric.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-validation-gray-600">{metric.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-validation-gray-600">{metric.target}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-validation-gray-600">{metric.current}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={metric.status as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MetricsSection;
