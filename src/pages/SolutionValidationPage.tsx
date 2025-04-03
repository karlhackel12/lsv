import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/use-project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { updateProject } from '@/lib/projects';
import { useToast } from '@/hooks/use-toast';
import { Project, SolutionTracking } from '@/types/database';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

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
      const updatedSolutionTracking = {
        ...currentProject.solution_tracking,
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

  // Update the handling of the solutionTracking object
  const solutionTracking = currentProject?.solution_tracking as unknown as SolutionTracking || {
    solution_hypotheses_defined: false,
    solution_sketches_created: false,
    tested_with_customers: false,
    positive_feedback_received: false
  };

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
                  checked={solutionTracking?.solution_hypotheses_defined || false}
                  onCheckedChange={(checked) => handleCheckboxChange('solution_hypotheses_defined', checked || false)}
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
                  checked={solutionTracking?.solution_sketches_created || false}
                  onCheckedChange={(checked) => handleCheckboxChange('solution_sketches_created', checked || false)}
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
                  checked={solutionTracking?.tested_with_customers || false}
                  onCheckedChange={(checked) => handleCheckboxChange('tested_with_customers', checked || false)}
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
                  checked={solutionTracking?.positive_feedback_received || false}
                  onCheckedChange={(checked) => handleCheckboxChange('positive_feedback_received', checked || false)}
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
        <Button onClick={() => navigate('/mvp-definition')} disabled={isSaving}>
          Proceed to MVP Definition
        </Button>
      </div>
    </div>
  );
};

export default SolutionValidationPage;
