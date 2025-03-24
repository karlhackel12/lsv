
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/hooks/use-project';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit, Save, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import PageIntroduction from '@/components/PageIntroduction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Section type definition
type BusinessPlanSection = {
  id: string;
  project_id: string;
  section_type: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

// Section types
const sectionTypes = [
  { id: 'executive_summary', name: 'Executive Summary' },
  { id: 'company_description', name: 'Company Description' },
  { id: 'market_analysis', name: 'Market Analysis' },
  { id: 'competitive_analysis', name: 'Competitive Analysis' },
  { id: 'product_service', name: 'Products & Services' },
  { id: 'marketing_strategy', name: 'Marketing Strategy' },
  { id: 'financial_projections', name: 'Financial Projections' },
  { id: 'funding_requirements', name: 'Funding Requirements' },
  { id: 'implementation_timeline', name: 'Implementation Timeline' },
  { id: 'risk_assessment', name: 'Risk Assessment' },
];

// Form schema
const formSchema = z.object({
  section_type: z.string().min(1, "Section type is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

const BusinessPlanPage = () => {
  const { currentProject } = useProject();
  const queryClient = useQueryClient();
  const [isNewSectionDialogOpen, setIsNewSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<BusinessPlanSection | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      section_type: '',
      title: '',
      content: '',
    },
  });

  // Fetch business plan sections
  const { data: sections = [], isLoading, error } = useQuery({
    queryKey: ['businessPlanSections', currentProject?.id],
    queryFn: async () => {
      if (!currentProject?.id) return [];
      
      const { data, error } = await supabase
        .from('business_plan_sections')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('order_index');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as BusinessPlanSection[];
    },
    enabled: !!currentProject?.id,
  });
  
  // Add section mutation
  const addSectionMutation = useMutation({
    mutationFn: async (newSection: Omit<BusinessPlanSection, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('business_plan_sections')
        .insert(newSection)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlanSections'] });
      setIsNewSectionDialogOpen(false);
      form.reset();
      toast.success("Section added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add section: ${error.message}`);
    },
  });
  
  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async (section: Partial<BusinessPlanSection> & { id: string }) => {
      const { data, error } = await supabase
        .from('business_plan_sections')
        .update({ 
          title: section.title,
          content: section.content,
          section_type: section.section_type
        })
        .eq('id', section.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlanSections'] });
      setEditingSection(null);
      form.reset();
      toast.success("Section updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update section: ${error.message}`);
    },
  });
  
  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_plan_sections')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlanSections'] });
      toast.success("Section deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete section: ${error.message}`);
    },
  });
  
  const handleSubmitSection = (values: z.infer<typeof formSchema>) => {
    if (editingSection) {
      updateSectionMutation.mutate({
        ...values,
        id: editingSection.id
      });
    } else {
      if (!currentProject?.id) {
        toast.error("No project selected");
        return;
      }
      
      addSectionMutation.mutate({
        ...values,
        project_id: currentProject.id,
        order_index: sections.length
      });
    }
  };
  
  const handleEditSection = (section: BusinessPlanSection) => {
    setEditingSection(section);
    form.reset({
      section_type: section.section_type,
      title: section.title,
      content: section.content || '',
    });
  };
  
  const handleDeleteSection = (id: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      deleteSectionMutation.mutate(id);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingSection(null);
    form.reset({
      section_type: '',
      title: '',
      content: '',
    });
  };

  if (!currentProject) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Please select a project to view its business plan.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PageIntroduction 
        title="Business Plan" 
        description="Create and edit your business plan sections to complement your Lean Startup approach. Document your market research, strategy, and other key business information."
        icon={<FileText className="h-6 w-6" />}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Business Plan for {currentProject.name}</h2>
        <Dialog open={isNewSectionDialogOpen} onOpenChange={setIsNewSectionDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Business Plan Section</DialogTitle>
              <DialogDescription>
                Create a new section for your business plan.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitSection)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="section_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Type</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full p-2 border rounded"
                          {...field}
                        >
                          <option value="">Select a section type</option>
                          {sectionTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Section title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your content here..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Section</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <p>Loading business plan sections...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error instanceof Error ? error.message : "An error occurred while loading business plan sections"}
          </AlertDescription>
        </Alert>
      ) : sections.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-2">No Business Plan Sections Yet</h3>
          <p className="text-gray-500 mb-4">
            Start building your business plan by adding sections like Executive Summary, Market Research, and more.
          </p>
          <Button onClick={() => setIsNewSectionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Section
          </Button>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {sections.map((section) => (
            <AccordionItem value={section.id} key={section.id} className="border rounded-md mb-4 overflow-hidden">
              <div className="flex justify-between items-center pr-4">
                <AccordionTrigger className="px-4 py-3 flex-1 hover:no-underline">
                  <div className="text-left">
                    <span className="font-medium">{section.title}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {sectionTypes.find(t => t.id === section.section_type)?.name || section.section_type}
                    </span>
                  </div>
                </AccordionTrigger>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleEditSection(section); 
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleDeleteSection(section.id); 
                    }}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <AccordionContent className="px-4 pb-4 pt-0">
                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                  {section.content || <span className="text-gray-400 italic">No content added yet</span>}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Edit section dialog */}
      {editingSection && (
        <Dialog open={!!editingSection} onOpenChange={(open) => !open && handleCancelEdit()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Business Plan Section</DialogTitle>
              <DialogDescription>
                Update this section of your business plan.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitSection)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="section_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Type</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full p-2 border rounded"
                          {...field}
                        >
                          <option value="">Select a section type</option>
                          {sectionTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Section title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your content here..." 
                          className="min-h-[200px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="flex space-x-2 justify-end">
                  <Button variant="outline" onClick={handleCancelEdit} type="button">
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BusinessPlanPage;
