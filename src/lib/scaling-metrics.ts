
export interface PredefinedScalingMetric {
  name: string;
  description: string;
  category: string;
  unit: string;
  importance: number;
  target_value?: number;
}

export const predefinedScalingMetrics: PredefinedScalingMetric[] = [
  // Product-Market Fit Metrics
  {
    name: "Net Promoter Score (NPS)",
    description: "Measures customer satisfaction and loyalty. Higher scores indicate stronger product-market fit.",
    category: "product_market_fit",
    unit: "number",
    importance: 4,
    target_value: 50
  },
  {
    name: "Customer Retention Rate",
    description: "Percentage of customers that continue using your product over a period. Critical for sustainable growth.",
    category: "product_market_fit",
    unit: "percentage",
    importance: 5,
    target_value: 85
  },
  {
    name: "Customer Satisfaction Score",
    description: "Direct measure of how satisfied customers are with your product or service.",
    category: "product_market_fit",
    unit: "number",
    importance: 4,
    target_value: 8
  },
  
  // Unit Economics Metrics
  {
    name: "Customer Acquisition Cost (CAC)",
    description: "The cost to acquire a new customer. Lower is better for scaling efficiency.",
    category: "unit_economics",
    unit: "currency",
    importance: 5,
    target_value: 100
  },
  {
    name: "Customer Lifetime Value (LTV)",
    description: "The total revenue expected from a customer during their relationship with your business.",
    category: "unit_economics",
    unit: "currency",
    importance: 5,
    target_value: 300
  },
  {
    name: "LTV:CAC Ratio",
    description: "Ratio of customer lifetime value to acquisition cost. Higher ratios indicate better unit economics for scaling.",
    category: "unit_economics",
    unit: "ratio",
    importance: 5,
    target_value: 3
  },
  {
    name: "Payback Period",
    description: "Time required to recover the cost of acquiring a customer. Shorter periods enable faster scaling.",
    category: "unit_economics",
    unit: "time",
    importance: 4,
    target_value: 6
  },
  
  // Growth Engine Metrics
  {
    name: "Month-over-Month Growth Rate",
    description: "Percentage growth in key metrics (revenue, users, etc.) each month.",
    category: "growth_engine",
    unit: "percentage",
    importance: 5,
    target_value: 20
  },
  {
    name: "Viral Coefficient",
    description: "The number of new users each existing user brings in. Values above 1 indicate viral growth.",
    category: "growth_engine",
    unit: "number",
    importance: 3,
    target_value: 1.1
  },
  {
    name: "Conversion Rate",
    description: "Percentage of prospects or leads that become paying customers.",
    category: "growth_engine",
    unit: "percentage",
    importance: 4,
    target_value: 5
  },
  
  // Team Capacity Metrics
  {
    name: "Team Bandwidth Utilization",
    description: "Percentage of team capacity currently being utilized. High percentages may indicate scaling constraints.",
    category: "team_capacity",
    unit: "percentage",
    importance: 4,
    target_value: 80
  },
  {
    name: "Revenue per Employee",
    description: "Measures operational efficiency and indicates ability to scale without proportional team growth.",
    category: "team_capacity",
    unit: "currency",
    importance: 3,
    target_value: 100000
  },
  {
    name: "Time to Hire",
    description: "Average time required to fill key positions. Shorter times enable faster scaling.",
    category: "team_capacity",
    unit: "time",
    importance: 3,
    target_value: 30
  },
  
  // Operational Scalability Metrics
  {
    name: "System Uptime",
    description: "Percentage of time systems are operational. Critical for scaling without service degradation.",
    category: "operational_scalability",
    unit: "percentage",
    importance: 4,
    target_value: 99.9
  },
  {
    name: "Response Time",
    description: "Average time to respond to customer inquiries or system requests.",
    category: "operational_scalability",
    unit: "time",
    importance: 3,
    target_value: 2
  },
  {
    name: "Process Automation Level",
    description: "Percentage of key processes that are automated. Higher automation enables smoother scaling.",
    category: "operational_scalability",
    unit: "percentage",
    importance: 4,
    target_value: 80
  },
  
  // Financial Readiness Metrics
  {
    name: "Burn Rate",
    description: "Rate at which company is spending capital. Lower rates extend runway for scaling.",
    category: "financial_readiness",
    unit: "currency",
    importance: 5,
    target_value: 50000
  },
  {
    name: "Runway",
    description: "Months of operation remaining at current burn rate without additional funding.",
    category: "financial_readiness",
    unit: "time",
    importance: 5,
    target_value: 18
  },
  {
    name: "Gross Margin",
    description: "Percentage of revenue remaining after direct costs. Higher margins support sustainable scaling.",
    category: "financial_readiness",
    unit: "percentage",
    importance: 4,
    target_value: 70
  },
  
  // Market Opportunity Metrics
  {
    name: "Total Addressable Market (TAM)",
    description: "Total market demand for your product or service. Larger markets offer more scaling potential.",
    category: "market_opportunity",
    unit: "currency",
    importance: 4,
    target_value: 1000000000
  },
  {
    name: "Market Growth Rate",
    description: "Annual growth rate of your target market. Faster growing markets provide more scaling opportunities.",
    category: "market_opportunity",
    unit: "percentage",
    importance: 3,
    target_value: 15
  },
  {
    name: "Market Share",
    description: "Your company's percentage of the total market. Lower shares may indicate more room to scale.",
    category: "market_opportunity",
    unit: "percentage",
    importance: 3,
    target_value: 10
  }
];

// Helper function to get metrics by category
export function getMetricsByCategory(category: string): PredefinedScalingMetric[] {
  return predefinedScalingMetrics.filter(metric => metric.category === category);
}

// Helper function to get all available categories
export function getAllCategories(): string[] {
  const categories = new Set(predefinedScalingMetrics.map(metric => metric.category));
  return Array.from(categories);
}
