import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Coins,
  CreditCard,
  Bot,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Calculator,
  Building,
  User,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isCompleted?: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Chitty CFO',
    description: 'Let\'s get you set up with the most advanced financial platform',
    component: WelcomeStep
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Tell us about yourself and your business',
    component: ProfileStep
  },
  {
    id: 'integrations',
    title: 'Connect Your Accounts',
    description: 'Link your financial accounts and blockchain wallets',
    component: IntegrationsStep
  },
  {
    id: 'ai-setup',
    title: 'AI Assistants',
    description: 'Configure your specialized AI financial advisors',
    component: AISetupStep
  },
  {
    id: 'goals',
    title: 'Financial Goals',
    description: 'Set your targets and let us help you achieve them',
    component: GoalsStep
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'Your financial command center is ready',
    component: CompleteStep
  }
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    businessType: '',
    monthlyRevenue: '',
    primaryGoals: [],
    integrations: [],
    aiAssistants: [],
    walletAddresses: []
  });

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const CurrentStepComponent = onboardingSteps[currentStep].component;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save user data and redirect to dashboard
    console.log('Onboarding completed:', userData);
    // Redirect to dashboard
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {onboardingSteps[currentStep].title}
              </h1>
              <p className="text-slate-400">
                {onboardingSteps[currentStep].description}
              </p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              Step {currentStep + 1} of {onboardingSteps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur mb-6">
          <CurrentStepComponent 
            userData={userData}
            setUserData={setUserData}
            onNext={handleNext}
            onComplete={handleComplete}
          />
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="border-slate-700 text-slate-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < onboardingSteps.length - 1 ? (
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ onNext }: any) {
  return (
    <CardContent className="p-8 text-center">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="h-12 w-12 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">
        Welcome to the Future of Finance
      </h2>
      
      <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
        Chitty CFO V2 combines traditional financial management with cutting-edge blockchain technology 
        and AI-powered insights. Let's set up your personalized financial command center.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <FeatureCard
          icon={CreditCard}
          title="Traditional Finance"
          description="Connect banks, credit cards, and accounting systems"
        />
        <FeatureCard
          icon={Coins}
          title="ChittyChain Integration"
          description="Track DeFi, NFTs, and staking rewards"
        />
        <FeatureCard
          icon={Bot}
          title="AI Assistants"
          description="5 specialized AI advisors for expert guidance"
        />
      </div>

      <Button onClick={onNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
        Let's Get Started
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </CardContent>
  );
}

function ProfileStep({ userData, setUserData }: any) {
  return (
    <CardContent className="p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Tell us about yourself</h3>
          <p className="text-slate-400">This helps us personalize your experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-white">Business Type</Label>
            <RadioGroup 
              value={userData.businessType}
              onValueChange={(value) => setUserData({...userData, businessType: value})}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="text-slate-300">Individual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="startup" id="startup" />
                <Label htmlFor="startup" className="text-slate-300">Startup</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="smb" id="smb" />
                <Label htmlFor="smb" className="text-slate-300">Small Business</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="enterprise" id="enterprise" />
                <Label htmlFor="enterprise" className="text-slate-300">Enterprise</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">Monthly Revenue Range</Label>
            <RadioGroup 
              value={userData.monthlyRevenue}
              onValueChange={(value) => setUserData({...userData, monthlyRevenue: value})}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0-10k" id="0-10k" />
                <Label htmlFor="0-10k" className="text-slate-300">$0 - $10k</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10k-50k" id="10k-50k" />
                <Label htmlFor="10k-50k" className="text-slate-300">$10k - $50k</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50k-100k" id="50k-100k" />
                <Label htmlFor="50k-100k" className="text-slate-300">$50k - $100k</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="100k+" id="100k+" />
                <Label htmlFor="100k+" className="text-slate-300">$100k+</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label className="text-white">Primary Goals (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {[
              'Expense Tracking',
              'Tax Optimization',
              'DeFi Investing',
              'Cash Flow Management',
              'Financial Reporting',
              'Compliance'
            ].map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox 
                  id={goal}
                  checked={userData.primaryGoals.includes(goal)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setUserData({
                        ...userData,
                        primaryGoals: [...userData.primaryGoals, goal]
                      });
                    } else {
                      setUserData({
                        ...userData,
                        primaryGoals: userData.primaryGoals.filter((g: string) => g !== goal)
                      });
                    }
                  }}
                />
                <Label htmlFor={goal} className="text-slate-300">{goal}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  );
}

function IntegrationsStep({ userData, setUserData }: any) {
  const integrations = [
    { id: 'mercury', name: 'Mercury Bank', icon: Building, category: 'Banking' },
    { id: 'stripe', name: 'Stripe', icon: CreditCard, category: 'Payments' },
    { id: 'quickbooks', name: 'QuickBooks', icon: Calculator, category: 'Accounting' },
    { id: 'chittychain', name: 'ChittyChain Wallet', icon: Coins, category: 'Blockchain' }
  ];

  return (
    <CardContent className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Accounts</h3>
        <p className="text-slate-400">Link your financial services to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isSelected = userData.integrations.includes(integration.id);
          
          return (
            <Card 
              key={integration.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-blue-500/20 border-blue-500' 
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => {
                if (isSelected) {
                  setUserData({
                    ...userData,
                    integrations: userData.integrations.filter((id: string) => id !== integration.id)
                  });
                } else {
                  setUserData({
                    ...userData,
                    integrations: [...userData.integrations, integration.id]
                  });
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Icon className="h-8 w-8 text-blue-400" />
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{integration.name}</h4>
                    <p className="text-sm text-slate-400">{integration.category}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-800/50 rounded-lg">
        <p className="text-sm text-slate-400">
          <Shield className="h-4 w-4 inline mr-2" />
          Your financial data is encrypted and secure. We never store sensitive credentials.
        </p>
      </div>
    </CardContent>
  );
}

function AISetupStep({ userData, setUserData }: any) {
  const assistants = [
    { 
      id: 'chittybookkeeper', 
      name: 'ChittyBookkeeper', 
      icon: Calculator, 
      description: 'Financial analysis and bookkeeping',
      specialties: ['Expense categorization', 'Tax preparation', 'Financial reports']
    },
    { 
      id: 'chittytrader', 
      name: 'ChittyTrader', 
      icon: TrendingUp, 
      description: 'DeFi and trading strategies',
      specialties: ['Yield optimization', 'Risk assessment', 'Portfolio analysis']
    },
    { 
      id: 'chittyauditor', 
      name: 'ChittyAuditor', 
      icon: Shield, 
      description: 'Compliance and risk management',
      specialties: ['Regulatory compliance', 'Fraud detection', 'Audit preparation']
    }
  ];

  return (
    <CardContent className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="h-8 w-8 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Choose Your AI Assistants</h3>
        <p className="text-slate-400">Select the specialists you'd like to work with</p>
      </div>

      <div className="space-y-4">
        {assistants.map((assistant) => {
          const Icon = assistant.icon;
          const isSelected = userData.aiAssistants.includes(assistant.id);
          
          return (
            <Card 
              key={assistant.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-purple-500/20 border-purple-500' 
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => {
                if (isSelected) {
                  setUserData({
                    ...userData,
                    aiAssistants: userData.aiAssistants.filter((id: string) => id !== assistant.id)
                  });
                } else {
                  setUserData({
                    ...userData,
                    aiAssistants: [...userData.aiAssistants, assistant.id]
                  });
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Icon className="h-10 w-10 text-purple-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{assistant.name}</h4>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                    <p className="text-slate-400 mt-1">{assistant.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assistant.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </CardContent>
  );
}

function GoalsStep({ userData, setUserData }: any) {
  return (
    <CardContent className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Set Your Financial Goals</h3>
        <p className="text-slate-400">Let us help you achieve your targets</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Label className="text-white">Emergency Fund Target</Label>
          <Input 
            type="number"
            placeholder="25000"
            className="mt-2 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <div>
          <Label className="text-white">Annual Revenue Goal</Label>
          <Input 
            type="number"
            placeholder="500000"
            className="mt-2 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <div>
          <Label className="text-white">DeFi Investment Target</Label>
          <Input 
            type="number"
            placeholder="50000"
            className="mt-2 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <div>
          <Label className="text-white">Additional Notes</Label>
          <Textarea 
            placeholder="Any specific financial goals or priorities..."
            className="mt-2 bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>
    </CardContent>
  );
}

function CompleteStep({ onComplete }: any) {
  return (
    <CardContent className="p-8 text-center">
      <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-12 w-12 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">
        🎉 Welcome to Chitty CFO!
      </h2>
      
      <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
        Your financial command center is ready. You now have access to advanced analytics, 
        AI-powered insights, and seamless blockchain integration.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">Dashboard Ready</h4>
          <p className="text-sm text-slate-400">Real-time financial overview</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">AI Activated</h4>
          <p className="text-sm text-slate-400">Your assistants are online</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">Data Syncing</h4>
          <p className="text-sm text-slate-400">Accounts being connected</p>
        </div>
      </div>

      <Button onClick={onComplete} size="lg" className="bg-green-600 hover:bg-green-700">
        Enter Your Dashboard
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </CardContent>
  );
}

function FeatureCard({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-slate-800/50 rounded-lg text-center">
      <Icon className="h-10 w-10 text-blue-400 mx-auto mb-4" />
      <h3 className="font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}