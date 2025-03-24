
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PageIntroduction from '@/components/PageIntroduction';
import { BookOpen, Lightbulb, FlaskConical, Layers, TrendingUp } from 'lucide-react';

const LeanStartupPage = () => {
  return (
    <div className="space-y-6 p-6">
      <PageIntroduction
        title="Lean Startup Methodology"
        icon={<BookOpen className="h-5 w-5 text-blue-500" />}
        description={
          <>
            <p>
              The Lean Startup methodology is a scientific approach to creating and managing startups, 
              designed to get a desired product to customers' hands faster. It teaches you how to drive a 
              startup - when to turn, when to persevere, and how to grow a business with maximum acceleration.
            </p>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
              Core Principles
            </CardTitle>
            <CardDescription>
              The fundamental concepts behind the Lean Startup methodology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="build-measure-learn">
                  <AccordionTrigger className="font-medium">Build-Measure-Learn Loop</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      The fundamental activity of a startup is to turn ideas into products, measure how customers
                      respond, and then learn whether to pivot or persevere. This feedback loop is at the core
                      of the Lean Startup model and should be cycled through as quickly as possible.
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Implementation Steps:</h4>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Build a Minimum Viable Product (MVP) with minimal features</li>
                        <li>Measure key metrics and user behavior</li>
                        <li>Learn from the data to make informed decisions</li>
                        <li>Repeat the cycle with improvements based on learning</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="validated-learning">
                  <AccordionTrigger className="font-medium">Validated Learning</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Validated learning is the process of demonstrating empirically that a team has discovered
                      valuable truths about a startup's present and future business prospects. It is more concrete,
                      more accurate, and faster than market forecasting or classic business planning.
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Key Concepts:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Test assumptions with real customers</li>
                        <li>Use scientific approach to business validation</li>
                        <li>Document learnings systematically</li>
                        <li>Focus on actionable metrics over vanity metrics</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="minimum-viable-product">
                  <AccordionTrigger className="font-medium">Minimum Viable Product (MVP)</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      An MVP is the version of a new product that allows a team to collect the maximum amount of
                      validated learning about customers with the least effort. The goal of an MVP is not to build
                      a minimal product, but to test business hypotheses early in the product development cycle.
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">MVP Strategies:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Landing pages to test value propositions</li>
                        <li>Concierge MVP (manual service before automating)</li>
                        <li>Wizard of Oz testing (human behind automated facade)</li>
                        <li>Feature-minimal software release</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-blue-500" />
              Problem Validation Phase
            </CardTitle>
            <CardDescription>
              Verify you're solving a real problem worth solving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Before building any solution, validate that the problem you're trying to solve
                actually exists and is significant enough for customers to pay for a solution.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="customer-interviews">
                  <AccordionTrigger className="font-medium">Customer Interviews</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Conduct interviews with potential customers to understand their challenges, needs, and
                      how they currently solve the problem. Focus on open-ended questions and avoid pitching
                      your solution during this phase.
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Best Practices:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Target 10-20 interviews per customer segment</li>
                        <li>Ask about their problems, not your solution</li>
                        <li>Look for patterns and recurring issues</li>
                        <li>Quantify problem severity and frequency</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="problem-hypotheses">
                  <AccordionTrigger className="font-medium">Problem Hypotheses</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Create clear, testable hypotheses about the problems you believe your target customers
                      face. These should be specific enough to validate or invalidate through research.
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Hypothesis Structure:</h4>
                      <p className="italic mb-2">
                        "We believe [customer segment] experiences [problem] when trying to [goal/activity],
                        which causes [negative impact]."
                      </p>
                      <p>
                        Your hypotheses should be falsifiable, specific, and focused on problems rather than
                        solutions at this stage.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlaskConical className="mr-2 h-5 w-5 text-green-500" />
              Solution Validation Phase
            </CardTitle>
            <CardDescription>
              Test if your proposed solution addresses the validated problem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Once you've validated the problem, start testing potential solutions with
                customers to determine if they'd use and pay for what you're proposing.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="solution-prototyping">
                  <AccordionTrigger className="font-medium">Solution Prototyping</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Create low-fidelity prototypes to visualize your solution and get early feedback. These
                      can be wireframes, mockups, or simple interactive models that demonstrate core functionality.
                    </p>
                    <div className="mt-4 bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Prototyping Methods:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Paper prototypes for initial testing</li>
                        <li>Clickable wireframes using design tools</li>
                        <li>Landing pages that describe the solution</li>
                        <li>Demo videos showcasing the concept</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="solution-experiments">
                  <AccordionTrigger className="font-medium">Solution Experiments</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Design experiments to test specific aspects of your solution. Each experiment should have 
                      clear success criteria and validate or invalidate specific assumptions about your solution.
                    </p>
                    <div className="mt-4 bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Experiment Types:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Smoke tests (pre-selling before building)</li>
                        <li>Concierge services (manually delivering value)</li>
                        <li>Fake door tests (offering features that don't exist yet)</li>
                        <li>A/B tests comparing different solutions</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="mr-2 h-5 w-5 text-yellow-500" />
              MVP Testing Phase
            </CardTitle>
            <CardDescription>
              Build and test the smallest version of your product that delivers value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                The MVP phase involves building a minimal but functional version of your product
                to gather real user data and validate your business model in the market.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="building-mvp">
                  <AccordionTrigger className="font-medium">Building an MVP</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Focus on core features that address the primary problem and deliver the main value
                      proposition. Resist the urge to add "nice to have" features before validating the core.
                    </p>
                    <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">MVP Principles:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Identify the one key problem to solve</li>
                        <li>Build only features that directly address that problem</li>
                        <li>Launch quickly, even if you're embarrassed by the product</li>
                        <li>Set clear success metrics before launching</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="measuring-success">
                  <AccordionTrigger className="font-medium">Measuring MVP Success</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Establish key metrics to determine if your MVP is solving the problem and
                      delivering value. Use both qualitative feedback and quantitative data.
                    </p>
                    <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Key Metrics to Consider:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>User acquisition and activation rates</li>
                        <li>Retention and engagement metrics</li>
                        <li>Customer satisfaction scores</li>
                        <li>Conversion rates (for paid products)</li>
                        <li>Cost of customer acquisition</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
              Growth Model Validation Phase
            </CardTitle>
            <CardDescription>
              Optimize your acquisition, retention and revenue mechanisms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Once you've validated your MVP, focus on finding repeatable, scalable strategies
                for acquiring and retaining customers, and generating revenue.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="growth-metrics">
                  <AccordionTrigger className="font-medium">Growth Metrics Framework</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      The AARRR framework (Acquisition, Activation, Retention, Referral, Revenue) provides a 
                      comprehensive approach to measuring growth across the customer lifecycle.
                    </p>
                    <div className="mt-4 bg-purple-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">AARRR Metrics:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Acquisition:</strong> How do users find you? (CAC, channel effectiveness)</li>
                        <li><strong>Activation:</strong> Do users have a good first experience? (onboarding completion)</li>
                        <li><strong>Retention:</strong> Do users come back? (daily/weekly active users, churn)</li>
                        <li><strong>Referral:</strong> Do users tell others? (viral coefficient, NPS)</li>
                        <li><strong>Revenue:</strong> Can you monetize? (LTV, conversion rates, ARPU)</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="scaling-readiness">
                  <AccordionTrigger className="font-medium">Scaling Readiness</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Before scaling aggressively, validate that your growth model is working and sustainable.
                      This requires proving unit economics and identifying replicable growth channels.
                    </p>
                    <div className="mt-4 bg-purple-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Scaling Readiness Checklist:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>LTV > 3x CAC (customer lifetime value exceeds acquisition cost)</li>
                        <li>Payback period < 12 months</li>
                        <li>At least two reliable acquisition channels identified</li>
                        <li>Retention metrics meet or exceed industry benchmarks</li>
                        <li>Revenues growing faster than costs</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeanStartupPage;
