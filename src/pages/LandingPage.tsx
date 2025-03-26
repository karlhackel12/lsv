
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, BarChart, Layout, Users, Rocket, Lightbulb } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-validation-blue-50 to-validation-purple-50">
      {/* Navigation */}
      <nav className="py-4 px-6 md:px-10 flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-validation-blue-600" />
          <span className="font-bold text-2xl text-validation-blue-900">LSV</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/auth" className="text-validation-blue-700 hover:text-validation-blue-900 transition-colors">
            Login
          </Link>
          <Button className="bg-validation-purple-600 hover:bg-validation-purple-700 transition-colors">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container px-6 pt-20 pb-32 md:pt-32 md:pb-40 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-validation-blue-900 mb-6 leading-tight">
          Validate Your Startup Ideas <span className="text-validation-purple-600">Faster</span>
        </h1>
        <p className="text-lg md:text-xl text-validation-blue-700 max-w-3xl mx-auto mb-10">
          The ultimate platform for founders to test hypotheses, run experiments, and find product-market fit using the Lean Startup methodology.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-validation-blue-600 hover:bg-validation-blue-700 transition-colors">
            Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="border-validation-blue-300 text-validation-blue-700">
            Watch Demo
          </Button>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-validation-blue-900 mb-16">
            Everything You Need to Validate Your <span className="text-validation-purple-600">Startup</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Lightbulb className="h-8 w-8 text-validation-blue-600" />}
              title="Hypothesis Testing"
              description="Create, track, and validate your hypotheses throughout the product development lifecycle."
            />
            <FeatureCard 
              icon={<BarChart className="h-8 w-8 text-validation-blue-600" />}
              title="Metrics Dashboard"
              description="Monitor key performance indicators and make data-driven decisions for your product."
            />
            <FeatureCard 
              icon={<Layout className="h-8 w-8 text-validation-blue-600" />}
              title="MVP Planning"
              description="Plan and prioritize features for your minimum viable product to validate quickly."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-validation-blue-600" />}
              title="Customer Validation"
              description="Gather and organize feedback from your target customers to refine your solution."
            />
            <FeatureCard 
              icon={<Rocket className="h-8 w-8 text-validation-blue-600" />}
              title="Growth Experiments"
              description="Design and run growth experiments to scale your validated business model."
            />
            <FeatureCard 
              icon={<CheckCircle className="h-8 w-8 text-validation-blue-600" />}
              title="Pivot Planning"
              description="Easily identify when to pivot your strategy based on your validation results."
            />
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-validation-blue-100 to-validation-purple-100">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-validation-blue-900 mb-6">
            Built on Lean Startup Methodology
          </h2>
          <p className="text-lg text-validation-blue-700 max-w-3xl mx-auto mb-12">
            Our platform guides you through the Build-Measure-Learn cycle to help you validate your business model with minimal waste.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <MethodCard 
              number="01"
              title="Build"
              description="Create hypotheses and build experiments to test your assumptions about your business model."
            />
            <MethodCard 
              number="02"
              title="Measure"
              description="Collect data from your experiments and track key metrics to validate your hypotheses."
            />
            <MethodCard 
              number="03"
              title="Learn"
              description="Analyze results, make data-driven decisions, and iterate or pivot as needed."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-validation-blue-900 text-white py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Validate Your Startup Idea?
          </h2>
          <p className="text-lg text-validation-blue-100 max-w-2xl mx-auto mb-10">
            Join thousands of founders who are finding product-market fit faster with our validation platform.
          </p>
          <Button size="lg" className="bg-validation-purple-600 hover:bg-validation-purple-700">
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-validation-blue-950 text-validation-blue-200 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <Lightbulb className="h-6 w-6 text-validation-purple-400" />
              <span className="font-bold text-xl text-white">LSV</span>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} Lean Startup Validation. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-6 rounded-lg border border-validation-blue-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-validation-blue-900 mb-3">{title}</h3>
    <p className="text-validation-blue-700">{description}</p>
  </div>
);

// Methodology Card Component
const MethodCard = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md relative">
    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-validation-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-validation-blue-900 mt-4 mb-3">{title}</h3>
    <p className="text-validation-blue-700">{description}</p>
  </div>
);

export default LandingPage;
