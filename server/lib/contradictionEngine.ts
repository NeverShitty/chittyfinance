import OpenAI from "openai";
import { FinancialData } from "./financialServices";
import { ChargeDetails } from "./chargeAutomation";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface Contradiction {
  id: string;
  type: 'financial' | 'operational' | 'compliance' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  sources: string[];
  conflictingValues: {
    source1: { value: any; label: string };
    source2: { value: any; label: string };
  };
  potentialImpact: number; // financial impact in dollars
  recommendedAction: string;
  detectedAt: Date;
  entityId?: string; // for portfolio-specific contradictions
}

export interface ContradictionAnalysis {
  contradictions: Contradiction[];
  summary: {
    totalContradictions: number;
    criticalCount: number;
    highRiskCount: number;
    estimatedImpact: number;
  };
  riskScore: number; // 0-100
}

/**
 * Analyze financial data for contradictions across different sources
 */
export async function detectFinancialContradictions(
  financialData: FinancialData[],
  charges: ChargeDetails[],
  entityId?: string
): Promise<ContradictionAnalysis> {
  const contradictions: Contradiction[] = [];

  // Detect cash flow contradictions
  const cashFlowContradictions = detectCashFlowContradictions(financialData, entityId);
  contradictions.push(...cashFlowContradictions);

  // Detect revenue contradictions
  const revenueContradictions = detectRevenueContradictions(financialData, entityId);
  contradictions.push(...revenueContradictions);

  // Detect expense contradictions
  const expenseContradictions = detectExpenseContradictions(financialData, charges, entityId);
  contradictions.push(...expenseContradictions);

  // Detect compliance contradictions
  const complianceContradictions = await detectComplianceContradictions(financialData, entityId);
  contradictions.push(...complianceContradictions);

  // Calculate summary and risk score
  const summary = {
    totalContradictions: contradictions.length,
    criticalCount: contradictions.filter(c => c.severity === 'critical').length,
    highRiskCount: contradictions.filter(c => c.severity === 'high').length,
    estimatedImpact: contradictions.reduce((sum, c) => sum + c.potentialImpact, 0)
  };

  const riskScore = calculateRiskScore(contradictions);

  return {
    contradictions,
    summary,
    riskScore
  };
}

/**
 * Detect cash flow contradictions between different data sources
 */
function detectCashFlowContradictions(
  financialData: FinancialData[],
  entityId?: string
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  if (financialData.length < 2) return contradictions;

  // Compare cash on hand between sources
  const cashValues = financialData.map(data => ({
    value: data.cashOnHand,
    source: getDataSource(data)
  }));

  for (let i = 0; i < cashValues.length - 1; i++) {
    for (let j = i + 1; j < cashValues.length; j++) {
      const diff = Math.abs(cashValues[i].value - cashValues[j].value);
      const threshold = Math.max(cashValues[i].value, cashValues[j].value) * 0.05; // 5% tolerance

      if (diff > threshold && diff > 1000) { // Significant difference
        contradictions.push({
          id: `cash-contradiction-${Date.now()}-${i}-${j}`,
          type: 'financial',
          severity: diff > 50000 ? 'critical' : diff > 10000 ? 'high' : 'medium',
          title: 'Cash on Hand Discrepancy',
          description: `Significant difference in reported cash on hand between ${cashValues[i].source} and ${cashValues[j].source}`,
          sources: [cashValues[i].source, cashValues[j].source],
          conflictingValues: {
            source1: { value: cashValues[i].value, label: cashValues[i].source },
            source2: { value: cashValues[j].value, label: cashValues[j].source }
          },
          potentialImpact: diff,
          recommendedAction: 'Reconcile cash balances and verify bank statements',
          detectedAt: new Date(),
          entityId
        });
      }
    }
  }

  return contradictions;
}

/**
 * Detect revenue contradictions
 */
function detectRevenueContradictions(
  financialData: FinancialData[],
  entityId?: string
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  if (financialData.length < 2) return contradictions;

  // Compare monthly revenue between sources
  const revenueValues = financialData.map(data => ({
    value: data.monthlyRevenue,
    source: getDataSource(data)
  }));

  for (let i = 0; i < revenueValues.length - 1; i++) {
    for (let j = i + 1; j < revenueValues.length; j++) {
      const diff = Math.abs(revenueValues[i].value - revenueValues[j].value);
      const threshold = Math.max(revenueValues[i].value, revenueValues[j].value) * 0.1; // 10% tolerance

      if (diff > threshold && diff > 5000) {
        contradictions.push({
          id: `revenue-contradiction-${Date.now()}-${i}-${j}`,
          type: 'financial',
          severity: diff > 100000 ? 'critical' : diff > 25000 ? 'high' : 'medium',
          title: 'Monthly Revenue Discrepancy',
          description: `Revenue figures don't match between ${revenueValues[i].source} and ${revenueValues[j].source}`,
          sources: [revenueValues[i].source, revenueValues[j].source],
          conflictingValues: {
            source1: { value: revenueValues[i].value, label: revenueValues[i].source },
            source2: { value: revenueValues[j].value, label: revenueValues[j].source }
          },
          potentialImpact: diff * 0.3, // Estimated impact
          recommendedAction: 'Verify revenue recognition and accounting methods',
          detectedAt: new Date(),
          entityId
        });
      }
    }
  }

  return contradictions;
}

/**
 * Detect expense contradictions between financial data and charge automation
 */
function detectExpenseContradictions(
  financialData: FinancialData[],
  charges: ChargeDetails[],
  entityId?: string
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Calculate total recurring charges
  const totalRecurringCharges = charges
    .filter(charge => charge.recurring)
    .reduce((sum, charge) => sum + charge.amount, 0);

  // Compare with reported monthly expenses
  financialData.forEach((data, index) => {
    const reportedExpenses = data.monthlyExpenses;
    const diff = Math.abs(reportedExpenses - totalRecurringCharges);
    const threshold = Math.max(reportedExpenses, totalRecurringCharges) * 0.15; // 15% tolerance

    if (diff > threshold && diff > 5000) {
      contradictions.push({
        id: `expense-contradiction-${Date.now()}-${index}`,
        type: 'operational',
        severity: diff > 50000 ? 'critical' : diff > 15000 ? 'high' : 'medium',
        title: 'Expense vs Recurring Charges Mismatch',
        description: `Reported monthly expenses don't align with identified recurring charges`,
        sources: [getDataSource(data), 'Charge Automation'],
        conflictingValues: {
          source1: { value: reportedExpenses, label: 'Reported Expenses' },
          source2: { value: totalRecurringCharges, label: 'Recurring Charges' }
        },
        potentialImpact: diff * 0.2,
        recommendedAction: 'Review expense categorization and recurring charge tracking',
        detectedAt: new Date(),
        entityId
      });
    }
  });

  return contradictions;
}

/**
 * Detect compliance contradictions using AI analysis
 */
async function detectComplianceContradictions(
  financialData: FinancialData[],
  entityId?: string
): Promise<Contradiction[]> {
  try {
    const prompt = `Analyze the following financial data for compliance contradictions and reporting inconsistencies:

${JSON.stringify(financialData, null, 2)}

Identify potential contradictions related to:
1. Tax compliance requirements
2. Financial reporting standards
3. Cash flow vs profitability inconsistencies
4. Unusual patterns that may indicate errors

Respond with JSON in this format:
{
  "contradictions": [
    {
      "type": "compliance",
      "severity": "high|medium|low",
      "title": "Brief contradiction title",
      "description": "Detailed explanation",
      "sources": ["source1", "source2"],
      "potentialImpact": 0,
      "recommendedAction": "What to do"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a financial compliance expert. Analyze data for contradictions and inconsistencies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0].message.content || '{"contradictions":[]}');
    
    return result.contradictions.map((c: any, index: number) => ({
      id: `compliance-contradiction-${Date.now()}-${index}`,
      type: c.type,
      severity: c.severity,
      title: c.title,
      description: c.description,
      sources: c.sources || ['AI Analysis'],
      conflictingValues: {
        source1: { value: 'See description', label: 'Analysis' },
        source2: { value: 'See description', label: 'Expected' }
      },
      potentialImpact: c.potentialImpact || 0,
      recommendedAction: c.recommendedAction,
      detectedAt: new Date(),
      entityId
    }));
  } catch (error) {
    console.error('Error detecting compliance contradictions:', error);
    return [];
  }
}

/**
 * Calculate overall risk score based on contradictions
 */
function calculateRiskScore(contradictions: Contradiction[]): number {
  if (contradictions.length === 0) return 0;

  const weights = {
    critical: 40,
    high: 20,
    medium: 10,
    low: 5
  };

  const totalWeight = contradictions.reduce((sum, c) => {
    return sum + weights[c.severity];
  }, 0);

  // Normalize to 0-100 scale
  return Math.min(100, totalWeight);
}

/**
 * Helper function to determine data source
 */
function getDataSource(data: FinancialData): string {
  // Simple heuristic to identify data source
  if (data.cashOnHand > 0 && data.monthlyRevenue > 0) {
    return 'Primary Financial System';
  }
  return 'Secondary Source';
}

/**
 * Generate contradiction resolution recommendations
 */
export async function generateResolutionPlan(contradictions: Contradiction[]): Promise<string> {
  if (contradictions.length === 0) {
    return "No contradictions detected. Your financial data appears consistent across all sources.";
  }

  try {
    const prompt = `Generate a comprehensive plan to resolve these financial contradictions:

${JSON.stringify(contradictions.map(c => ({
  title: c.title,
  severity: c.severity,
  description: c.description,
  recommendedAction: c.recommendedAction
})), null, 2)}

Provide a prioritized action plan with specific steps, timelines, and responsible parties.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a CFO consultant specializing in financial data reconciliation and process improvement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    });

    return response.choices[0].message.content || "Unable to generate resolution plan.";
  } catch (error) {
    console.error('Error generating resolution plan:', error);
    return "Error generating resolution plan. Please review contradictions manually.";
  }
}