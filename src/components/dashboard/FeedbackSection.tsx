
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Plus } from 'lucide-react';

interface FeedbackItem {
  date: string;
  customer: string;
  type: string;
  status: 'completed' | 'pending' | 'scheduled';
}

const FeedbackSection = () => {
  const feedbackItems: FeedbackItem[] = [
    {
      date: '2024-02-20',
      customer: 'John Smith',
      type: 'Interview',
      status: 'completed'
    },
    {
      date: '2024-02-19',
      customer: 'Sarah Johnson',
      type: 'Survey',
      status: 'pending'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold leading-tight tracking-tight text-gray-700">
            Customer Feedback Collection
          </h4>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Feedback
          </Button>
        </div>

        <div className="relative overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Feedback Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbackItems.map((item, index) => (
                <TableRow key={index} className="border-b border-gray-200">
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSection;
