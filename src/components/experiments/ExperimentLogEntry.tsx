
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, FileText, User, MessageSquare } from 'lucide-react';
import { Experiment, ExperimentLog } from '@/types/database';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ExperimentLogEntryProps {
  log: ExperimentLog;
  isLatest?: boolean;
}

const ExperimentLogEntry = ({ log, isLatest = false }: ExperimentLogEntryProps) => {
  // Format the date/time
  const formattedDate = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  return (
    <Card className={`p-4 mb-4 border-l-4 ${isLatest ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
            {getInitials(log.created_by_name || 'User')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{log.created_by_name || 'Team member'}</span>
              <Badge variant={log.type === 'result' ? 'default' : log.type === 'insight' ? 'secondary' : 'outline'}>
                {log.type === 'result' ? 'Result' : log.type === 'insight' ? 'Insight' : 'Note'}
              </Badge>
            </div>
            <span className="text-xs text-gray-500 flex items-center">
              <CalendarClock className="h-3 w-3 mr-1" />
              {formattedDate}
            </span>
          </div>
          
          <div className="text-sm whitespace-pre-line">
            {log.content}
          </div>
          
          {log.metrics && (
            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Metrics:</div>
              {log.metrics}
            </div>
          )}
          
          {log.files && log.files.length > 0 && (
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <FileText className="h-3 w-3 mr-1" />
              {log.files.length} file{log.files.length !== 1 ? 's' : ''} attached
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ExperimentLogEntry;
