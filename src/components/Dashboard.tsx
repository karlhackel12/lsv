
import React, { useState } from 'react';
import { BarChart, Lightbulb, CheckSquare, Target, Gauge, RotateCcw } from 'lucide-react';
import TabNavigation, { TabItem } from './TabNavigation';
import OverviewSection from './OverviewSection';
import HypothesesSection from './HypothesesSection';
import ExperimentsSection from './ExperimentsSection';
import MVPSection from './MVPSection';
import MetricsSection from './MetricsSection';
import PivotSection from './PivotSection';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample project data
  const project = {
    name: 'HelloPeople Brazil',
    description: 'AI-enhanced language learning platform for independent English teachers in Brazil',
    stage: 'problem-solution'
  };

  // Sample data for the various sections
  const stages = [
    { id: 'problem', name: 'Problem Validation', complete: true, description: 'Verify that teachers need tools for students to practice between classes' },
    { id: 'solution', name: 'Solution Validation', complete: false, inProgress: true, description: 'Test that our approach solves the problem effectively' },
    { id: 'mvp', name: 'MVP Development', complete: false, description: 'Build minimum viable product that validates value proposition' },
    { id: 'business', name: 'Business Model Validation', complete: false, description: 'Validate that customers will pay for the solution' },
    { id: 'growth', name: 'Growth Model Validation', complete: false, description: 'Confirm acquisition channels and viral growth potential' },
    { id: 'scale', name: 'Scale', complete: false, description: 'Systematically expand user base and feature set' }
  ];

  const hypotheses = [
    { 
      id: 1, 
      category: 'value', 
      statement: 'Teachers want tools to extend learning beyond the classroom', 
      experiment: 'Interview 20 independent English teachers',
      criteria: '75% report this as a top 3 problem',
      status: 'validated',
      result: '82% reported this as a critical need',
      evidence: '16/20 teachers consider this a top priority issue'
    },
    { 
      id: 2, 
      category: 'value', 
      statement: 'Students will consistently complete 5-15 minute daily activities', 
      experiment: 'Track completion rates in beta test with 25 students',
      criteria: '>65% daily completion rate',
      status: 'validating',
      result: '68% daily completion rate so far',
      evidence: 'First two weeks of testing with 25 students'
    },
    { 
      id: 3, 
      category: 'value', 
      statement: 'Spaced repetition will improve vocabulary retention by 30-50%', 
      experiment: 'A/B test with traditional vs. spaced repetition approach',
      criteria: '>30% better retention vs. control group',
      status: 'not-started',
      result: '',
      evidence: ''
    },
    { 
      id: 4, 
      category: 'growth', 
      statement: 'Teachers will refer other teachers once they see student improvements', 
      experiment: 'Measure referral rate from first 20 teachers after 60 days',
      criteria: '>0.5 referrals per active teacher',
      status: 'not-started',
      result: '',
      evidence: ''
    },
    { 
      id: 5, 
      category: 'business', 
      statement: 'Students will pay R$39.90/month for the platform', 
      experiment: 'Offer paid subscriptions to beta testers after free trial',
      criteria: '>70% conversion to paid subscription',
      status: 'not-started',
      result: '',
      evidence: ''
    }
  ];

  const experiments = [
    {
      id: 1,
      title: 'Teacher Problem Interviews',
      hypothesis: 'Teachers want tools to extend learning beyond the classroom',
      status: 'completed',
      method: 'Structured interviews with 20 independent English teachers in São Paulo and Rio',
      metrics: '% reporting this as a top 3 problem',
      results: '82% reported this as a critical need',
      insights: 'Teachers especially value the time-saving aspect and ability to track student progress',
      decisions: 'Proceed with solution development focusing on teacher time-saving and progress tracking'
    },
    {
      id: 2,
      title: 'Student Activity Completion Test',
      hypothesis: 'Students will consistently complete 5-15 minute daily activities',
      status: 'in-progress',
      method: 'Beta test with 25 students over 4 weeks',
      metrics: 'Daily activity completion rate',
      results: '68% completion rate after 2 weeks',
      insights: 'Streak mechanics and shorter activities (under 8 minutes) show higher completion rates',
      decisions: 'Pending completion of experiment'
    },
    {
      id: 3,
      title: 'Spaced Repetition Efficacy Test',
      hypothesis: 'Spaced repetition will improve vocabulary retention by 30-50%',
      status: 'planned',
      method: 'A/B test with 40 students (20 using spaced repetition, 20 using traditional review)',
      metrics: 'Vocabulary retention after 30 days',
      results: '',
      insights: '',
      decisions: ''
    }
  ];

  const mvpFeatures = [
    { id: 1, feature: 'Teacher Dashboard', priority: 'high', status: 'in-progress', notes: 'Core interface for teachers to manage students and content' },
    { id: 2, feature: 'Student Assignment System', priority: 'high', status: 'in-progress', notes: 'Allows teachers to assign activities to students' },
    { id: 3, feature: 'Quiz Engine', priority: 'high', status: 'planned', notes: 'Interactive quiz system with multiple question types' },
    { id: 4, feature: 'Spaced Repetition System', priority: 'high', status: 'planned', notes: 'SM-2 algorithm implementation for vocabulary retention' },
    { id: 5, feature: 'Daily Activity Path', priority: 'high', status: 'planned', notes: 'Visual representation of student learning journey' },
    { id: 6, feature: 'Voice Practice Module', priority: 'medium', status: 'post-mvp', notes: 'Will be added after initial validation' },
    { id: 7, feature: 'Payment Processing', priority: 'high', status: 'planned', notes: 'Required for business model validation' }
  ];

  const metrics = [
    { id: 1, category: 'Acquisition', name: 'Teacher signup rate', target: '>20% of leads', current: '18%', status: 'warning' },
    { id: 2, category: 'Activation', name: 'Teacher onboarding completion', target: '>85%', current: '92%', status: 'success' },
    { id: 3, category: 'Activation', name: 'Students added per teacher', target: '>3 in first week', current: '4.2', status: 'success' },
    { id: 4, category: 'Retention', name: 'Daily active students', target: '>65%', current: '68%', status: 'success' },
    { id: 5, category: 'Retention', name: 'Weekly active teachers', target: '>80%', current: '85%', status: 'success' },
    { id: 6, category: 'Revenue', name: 'Student conversion rate', target: '>70%', current: 'Not measured', status: 'not-started' },
    { id: 7, category: 'Referral', name: 'Teacher referral rate', target: '>0.5', current: 'Not measured', status: 'not-started' }
  ];

  const pivotOptions = [
    { 
      id: 1, 
      type: 'Zoom-in Pivot', 
      description: 'Focus exclusively on spaced repetition if this proves to be the main value driver',
      trigger: '>80% of engagement concentrated on vocabulary feature',
      likelihood: 'low'
    },
    { 
      id: 2, 
      type: 'Customer Segment Pivot', 
      description: 'Shift from independent teachers to language schools',
      trigger: '<3 students per teacher despite strong teacher interest',
      likelihood: 'medium'
    },
    { 
      id: 3, 
      type: 'Value Capture Pivot', 
      description: 'Move from student subscription to teacher subscription model',
      trigger: '<50% student conversion despite high teacher satisfaction',
      likelihood: 'medium'
    },
    { 
      id: 4, 
      type: 'Channel Pivot', 
      description: 'Shift from social media to WhatsApp communities for acquisition',
      trigger: 'CAC on social media >R$300 or conversion <1%',
      likelihood: 'medium'
    }
  ];

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'hypotheses', label: 'Hypotheses', icon: Lightbulb },
    { id: 'experiments', label: 'Experiments', icon: CheckSquare },
    { id: 'mvp', label: 'MVP', icon: Target },
    { id: 'metrics', label: 'Metrics', icon: Gauge },
    { id: 'pivot', label: 'Pivot', icon: RotateCcw }
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection project={project} stages={stages} />;
      case 'hypotheses':
        return <HypothesesSection hypotheses={hypotheses} />;
      case 'experiments':
        return <ExperimentsSection experiments={experiments} />;
      case 'mvp':
        return <MVPSection mvpFeatures={mvpFeatures} />;
      case 'metrics':
        return <MetricsSection metrics={metrics} />;
      case 'pivot':
        return <PivotSection pivotOptions={pivotOptions} />;
      default:
        return <OverviewSection project={project} stages={stages} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        className="mb-8 animate-slideDownFade" 
      />
      
      <div>
        {renderTab()}
      </div>
    </div>
  );
};

export default Dashboard;
