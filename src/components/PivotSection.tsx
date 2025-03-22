
import React from 'react';
import Card from './Card';
import { RotateCcw } from 'lucide-react';

interface PivotOption {
  id: number;
  type: string;
  description: string;
  trigger: string;
  likelihood: 'high' | 'medium' | 'low';
}

interface PivotSectionProps {
  pivotOptions: PivotOption[];
}

const PivotSection = ({ pivotOptions }: PivotSectionProps) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-validation-gray-900">Pivot Framework</h2>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          A pivot is a structured course correction designed to test a new fundamental hypothesis about the product, business model, or engine of growth.
        </p>
      </Card>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-200">
        <h3 className="text-xl font-bold mb-5 text-validation-gray-900">Pivot Decision Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-validation-gray-800 mb-3">When to Persist</h4>
            <ul className="list-disc pl-5 space-y-2 text-validation-gray-600">
              <li>Core value hypothesis is validated</li>
              <li>Engagement metrics trending positively</li>
              <li>Customer acquisition cost decreasing</li>
              <li>Validated path to sustainable unit economics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-validation-gray-800 mb-3">When to Pivot</h4>
            <ul className="list-disc pl-5 space-y-2 text-validation-gray-600">
              <li>Core value hypothesis invalidated</li>
              <li>Engagement persistently below targets</li>
              <li>High acquisition costs with no downward trend</li>
              <li>Conversion rates below viability thresholds</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <h3 className="text-xl font-bold mb-6 text-validation-gray-900">Potential Pivot Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {pivotOptions.map((option, index) => (
          <Card 
            key={option.id} 
            className="p-6 animate-slideUpFade" 
            style={{ animationDelay: `${(index + 3) * 100}ms` }}
            hover={true}
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-lg text-validation-gray-900">{option.type}</h4>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                option.likelihood === 'high' 
                  ? 'bg-validation-red-50 text-validation-red-700 border border-validation-red-200' 
                  : option.likelihood === 'medium' 
                    ? 'bg-validation-yellow-50 text-validation-yellow-700 border border-validation-yellow-200' 
                    : 'bg-validation-green-50 text-validation-green-700 border border-validation-green-200'
              }`}>
                {option.likelihood} likelihood
              </span>
            </div>
            <p className="text-validation-gray-600 mb-5">{option.description}</p>
            <div className="bg-validation-gray-50 p-4 rounded-lg border border-validation-gray-200">
              <p className="text-sm font-semibold text-validation-red-600 mb-1">Trigger Point:</p>
              <p className="text-validation-gray-700 text-sm">{option.trigger}</p>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <button className="bg-white border border-validation-gray-200 hover:bg-validation-gray-50 text-validation-gray-700 font-medium py-2.5 px-5 rounded-lg flex items-center transition-colors duration-300 shadow-subtle">
          <RotateCcw className="h-4 w-4 mr-2" />
          Schedule Pivot/Persevere Meeting
        </button>
      </div>
    </div>
  );
};

export default PivotSection;
