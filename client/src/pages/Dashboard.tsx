import { useQuery } from "@tanstack/react-query";
import { FinancialSummary } from "@shared/schema";
import FinancialSummaryComponent from "@/components/dashboard/FinancialSummary";
import AICFOAssistant from "@/components/dashboard/AICFOAssistant";
import ContradictionEngine from "@/components/dashboard/ContradictionEngine";
import ConnectedServices from "@/components/dashboard/ConnectedServices";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import FinancialTasks from "@/components/dashboard/FinancialTasks";
import ChargeAutomation from "@/components/dashboard/ChargeAutomation";
import GitHubRepositories from "@/components/dashboard/GitHubRepositories";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  // Get financial summary data
  const { data: financialSummary, isLoading: isLoadingSummary } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial-summary"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Page Header - Premium spacing and typography */}
      <div className="px-6 sm:px-8 md:px-12 pt-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-normal tracking-tight gradient-text mb-4">
            ChittyFinance
          </h1>
          <p className="text-xl text-slate-400 font-light mb-6">
            Executive Financial Dashboard
          </p>
          
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            {/* AI Assistant Status - Premium indicator */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-soft-glow"></div>
                <div className="absolute inset-0 h-3 w-3 rounded-full bg-emerald-400 animate-ping opacity-20"></div>
              </div>
              <span className="font-medium">AI CFO Active</span>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="font-mono text-xs tracking-wider">
              Last updated: {formatDate(new Date())}
            </div>
          </div>
        </div>
      </div>

      {/* Content Container - Premium layout with proper spacing */}
      <div className="px-6 sm:px-8 md:px-12 pb-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Financial Summary Section */}
          <section className="animate-fade-in">
            <FinancialSummaryComponent 
              data={financialSummary} 
              isLoading={isLoadingSummary} 
            />
          </section>

          {/* AI CFO Assistant and Contradiction Engine Grid */}
          <section className="animate-slide-in">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <AICFOAssistant />
              <ContradictionEngine />
            </div>
          </section>

          {/* Service Integrations */}
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif font-normal text-slate-200 mb-6 tracking-wide">
                Connected Services
              </h2>
              <ConnectedServices />
            </div>
            
            <div>
              <h2 className="text-2xl font-serif font-normal text-slate-200 mb-6 tracking-wide">
                Automation & Tools
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChargeAutomation />
                <GitHubRepositories />
              </div>
            </div>
          </section>

          {/* Financial Activity */}
          <section>
            <h2 className="text-2xl font-serif font-normal text-slate-200 mb-6 tracking-wide">
              Financial Activity
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <RecentTransactions />
              <FinancialTasks />
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
