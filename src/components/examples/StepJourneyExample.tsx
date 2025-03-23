
import React, { useState } from 'react';
import StepJourney, { Step } from '@/components/StepJourney';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LightbulbIcon, BeakerIcon, BarChartIcon, RocketIcon } from 'lucide-react';

const StepJourneyExample = () => {
  // Define our journey steps
  const journeySteps: Step[] = [
    {
      id: 'hypothesis',
      label: 'Create Hypothesis',
      description: 'Define your assumptions and what you want to validate',
      icon: <LightbulbIcon className="h-5 w-5 text-yellow-500" />,
    },
    {
      id: 'experiment',
      label: 'Design Experiment',
      description: 'Create tests to validate your hypotheses',
      icon: <BeakerIcon className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 'analyze',
      label: 'Analyze Results',
      description: 'Review data and determine outcomes',
      icon: <BarChartIcon className="h-5 w-5 text-purple-500" />,
    },
    {
      id: 'implement',
      label: 'Implement Findings',
      description: 'Apply validated learning to your product',
      icon: <RocketIcon className="h-5 w-5 text-green-500" />,
    },
  ];

  const [currentStep, setCurrentStep] = useState('hypothesis');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [variantType, setVariantType] = useState('default');
  const [orientation, setOrientation] = useState('horizontal');

  // Handle moving to the next step
  const handleNextStep = () => {
    const currentIndex = journeySteps.findIndex(step => step.id === currentStep);
    if (currentIndex < journeySteps.length - 1) {
      // Mark the current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      // Move to the next step
      setCurrentStep(journeySteps[currentIndex + 1].id);
    }
  };

  // Handle moving to the previous step
  const handlePrevStep = () => {
    const currentIndex = journeySteps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(journeySteps[currentIndex - 1].id);
    }
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'hypothesis':
        return <p>Define your hypothesis and what you're trying to validate.</p>;
      case 'experiment':
        return <p>Design experiments to test your hypotheses.</p>;
      case 'analyze':
        return <p>Analyze the results of your experiments.</p>;
      case 'implement':
        return <p>Implement the findings into your product.</p>;
      default:
        return <p>Step content</p>;
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Step Journey Component Examples</h2>
          <p className="text-gray-600">
            Explore different variants of the StepJourney component
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="variant" className="w-full">
            <TabsList>
              <TabsTrigger value="variant">Variant</TabsTrigger>
              <TabsTrigger value="orientation">Orientation</TabsTrigger>
            </TabsList>
            <TabsContent value="variant" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={variantType === 'default' ? 'default' : 'outline'}
                  onClick={() => setVariantType('default')}
                  size="sm"
                >
                  Default
                </Button>
                <Button
                  variant={variantType === 'numbered' ? 'default' : 'outline'}
                  onClick={() => setVariantType('numbered')}
                  size="sm"
                >
                  Numbered
                </Button>
                <Button
                  variant={variantType === 'pills' ? 'default' : 'outline'}
                  onClick={() => setVariantType('pills')}
                  size="sm"
                >
                  Pills
                </Button>
                <Button
                  variant={variantType === 'cards' ? 'default' : 'outline'}
                  onClick={() => setVariantType('cards')}
                  size="sm"
                >
                  Cards
                </Button>
              </div>
              
              <StepJourney 
                steps={journeySteps}
                currentStepId={currentStep}
                onStepChange={setCurrentStep}
                completedStepIds={completedSteps}
                variant={variantType as any}
                orientation={orientation as any}
              />
            </TabsContent>
            
            <TabsContent value="orientation" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={orientation === 'horizontal' ? 'default' : 'outline'}
                  onClick={() => setOrientation('horizontal')}
                  size="sm"
                >
                  Horizontal
                </Button>
                <Button
                  variant={orientation === 'vertical' ? 'default' : 'outline'}
                  onClick={() => setOrientation('vertical')}
                  size="sm"
                >
                  Vertical
                </Button>
              </div>
              
              <StepJourney 
                steps={journeySteps}
                currentStepId={currentStep}
                onStepChange={setCurrentStep}
                completedStepIds={completedSteps}
                variant={variantType as any}
                orientation={orientation as any}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Interactive Example</h2>
          <p className="text-gray-600">
            Try navigating through the steps
          </p>
        </CardHeader>
        <CardContent>
          <StepJourney 
            steps={journeySteps}
            currentStepId={currentStep}
            onStepChange={setCurrentStep}
            completedStepIds={completedSteps}
            className="mb-8"
          />
          
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            {renderStepContent()}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === journeySteps[0].id}
            >
              Previous
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={currentStep === journeySteps[journeySteps.length - 1].id}
            >
              Next Step
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepJourneyExample;
