
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/use-project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { updateProject } from '@/lib/projects';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/database';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

// Define the SolutionTracking interface
interface SolutionTracking {
  solution_hypotheses_defined: boolean;
  solution_sketches_created: boolean;
  tested_with_customers: boolean;
  positive_feedback_received: boolean;
}

const SolutionValidationPage = () => {
  const { currentProject, fetchProjects } = useProject();
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentProject) {
      fetchProjects();
    }
  }, [currentProject, fetchProjects]);

  const handleCheckboxChange = async (field: keyof SolutionTracking, checked: boolean) => {
    if (!currentProject) return;

    setIsSaving(true);

    try {
      // Convert solution_tracking to a proper object if it's not already
      const currentTracking = typeof currentProject.solution_tracking === 'object' && currentProject.solution_tracking 
        ? currentProject.solution_tracking as unknown as SolutionTracking
        : {
            solution_hypotheses_defined: false,
            solution_sketches_created: false,
            tested_with_customers: false,
            positive_feedback_received: false
          };

      const updatedSolutionTracking = {
        ...currentTracking,
        [field]: checked,
      };

      await updateProject(currentProject.id, { solution_tracking: updatedSolutionTracking });
      toast({
        title: 'Progress saved',
        description: `Solution validation progress updated.`,
      });
      await fetchProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Convert solution_tracking to the proper type
  const rawSolutionTracking = currentProject?.solution_tracking;
  const defaultTracking: SolutionTracking = {
    solution_hypotheses_defined: false,
    solution_sketches_created: false,
    tested_with_customers: false,
    positive_feedback_received: false
  };
  
  // Safely convert to SolutionTracking type
  const solutionTracking: SolutionTracking = typeof rawSolutionTracking === 'object' && rawSolutionTracking
    ? rawSolutionTracking as unknown as SolutionTracking
    : defaultTracking;

  return (
    <div className="container mx-auto py-10">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{currentProject?.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Solution Validation</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Define Solution Hypotheses</CardTitle>
            <CardDescription>Clearly articulate your solution hypotheses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="solution_hypotheses_defined"
                  checked={solutionTracking.solution_hypotheses_defined}
                  onCheckedChange={(checked) => handleCheckboxChange('solution_hypotheses_defined', checked === true)}
                  disabled={isSaving}
                />
                <label
                  htmlFor="solution_hypotheses_defined"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Solution Hypotheses Defined
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Solution Sketches</CardTitle>
            <CardDescription>Sketch out potential solutions to visualize your hypotheses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="solution_sketches_created"
                  checked={solutionTracking.solution_sketches_created}
                  onCheckedChange={(checked) => handleCheckboxChange('solution_sketches_created', checked === true)}
                  disabled={isSaving}
                />
                <label
                  htmlFor="solution_sketches_created"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Solution Sketches Created
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test with Customers</CardTitle>
            <CardDescription>Gather feedback by testing your solutions with potential customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tested_with_customers"
                  checked={solutionTracking.tested_with_customers}
                  onCheckedChange={(checked) => handleCheckboxChange('tested_with_customers', checked === true)}
                  disabled={isSaving}
                />
                <label
                  htmlFor="tested_with_customers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tested with Customers
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receive Positive Feedback</CardTitle>
            <CardDescription>Ensure your solutions resonate with users through positive feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="positive_feedback_received"
                  checked={solutionTracking.positive_feedback_received}
                  onCheckedChange={(checked) => handleCheckboxChange('positive_feedback_received', checked === true)}
                  disabled={isSaving}
                />
                <label
                  htmlFor="positive_feedback_received"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Positive Feedback Received
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button onClick={() => navigate('/mvp')} disabled={isSaving}>
          Proceed to MVP Definition
        </Button>
      </div>
    </div>
  );
};

export default SolutionValidationPage;
