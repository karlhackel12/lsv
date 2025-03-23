import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Experiment } from '@/types/database';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  hypothesis: z.string().min(10, {
    message: "Hypothesis must be at least 10 characters.",
  }),
  method: z.string().min(10, {
    message: "Method must be at least 10 characters.",
  }),
  metrics: z.string().min(10, {
    message: "Metrics must be at least 10 characters.",
  }),
  results: z.string().min(10, {
    message: "Results must be at least 10 characters.",
  }),
  insights: z.string().min(10, {
    message: "Insights must be at least 10 characters.",
  }),
  decisions: z.string().min(10, {
    message: "Decisions must be at least 10 characters.",
  }),
  status: z.enum(['planned', 'in-progress', 'completed', 'failed']),
  category: z.enum(['problem', 'solution', 'business-model']),
  typeform_url: z.string().url().optional(),
  typeform_id: z.string().optional(),
  typeform_workspace_id: z.string().optional(),
  typeform_responses_count: z.number().optional(),
})

interface ExperimentFormProps {
  defaultValues?: Experiment;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ExperimentForm({
  defaultValues,
  onSubmit,
  isSubmitting = false
}: ExperimentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      hypothesis: defaultValues?.hypothesis || '',
      method: defaultValues?.method || '',
      metrics: defaultValues?.metrics || '',
      results: defaultValues?.results || '',
      insights: defaultValues?.insights || '',
      decisions: defaultValues?.decisions || '',
      status: defaultValues?.status || 'planned',
      category: (defaultValues?.category as 'problem' | 'solution' | 'business-model') || 'problem',
      typeform_url: defaultValues?.typeform_url || '',
      typeform_id: defaultValues?.typeform_id || '',
      typeform_workspace_id: defaultValues?.typeform_workspace_id || '',
      typeform_responses_count: defaultValues?.typeform_responses_count || 0
    },
    mode: "onChange",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Experiment Title" {...field} />
              </FormControl>
              <FormDescription>
                This is the title of your experiment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hypothesis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hypothesis</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What do you think will happen?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                State your hypothesis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Method</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How will you test your hypothesis?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the method you will use to test your hypothesis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metrics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metrics</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What metrics will you use to measure success?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List the metrics you will use to measure the success of your experiment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="results"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Results</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What were the results of your experiment?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the results of your experiment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="insights"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Insights</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What did you learn from this experiment?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the insights you gained from this experiment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="decisions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decisions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What decisions will you make based on this experiment?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the decisions you will make based on this experiment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the status of your experiment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="problem">Problem</SelectItem>
                  <SelectItem value="solution">Solution</SelectItem>
                  <SelectItem value="business-model">Business Model</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the category of your experiment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="typeform_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typeform URL</FormLabel>
              <FormControl>
                <Input placeholder="Typeform URL" {...field} />
              </FormControl>
              <FormDescription>
                If you are using Typeform, enter the URL of your form.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  )
}
