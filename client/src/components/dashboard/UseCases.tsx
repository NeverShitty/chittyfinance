import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign, 
  Briefcase,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const useCases = [
  {
    icon: <DollarSign className="h-5 w-5" />,
    title: "Cash Flow That Doesn't Suck",
    description: "Track every penny without the pain. We make it so easy, even your accountant will be impressed.",
    features: ["Real-time tracking", "Smart categorization", "Zero manual entry"],
    badge: "Most Popular",
    badgeColor: "bg-orange-500 text-white"
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Invoice Automation",
    description: "Stop chasing payments like it's 1999. Get paid faster with our non-sh*tty invoice system.",
    features: ["Auto-reminders", "One-click payments", "No more awkward calls"],
    badge: "Time Saver",
    badgeColor: "bg-blue-500 text-white"
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Financial Reports That Make Sense",
    description: "Reports so clear, you'll actually understand where your money went. No PhD required.",
    features: ["Plain English insights", "Visual dashboards", "Actionable advice"],
    badge: "CEO Favorite",
    badgeColor: "bg-purple-500 text-white"
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Bank-Level Security",
    description: "Your money's safer than Fort Knox. We take security seriously, so you don't have to worry.",
    features: ["256-bit encryption", "2FA everything", "SOC 2 compliant"],
    badge: "Ultra Secure",
    badgeColor: "bg-green-500 text-white"
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Save 10+ Hours Weekly",
    description: "Automate the boring sh*t. Spend time growing your business, not drowning in spreadsheets.",
    features: ["Smart automation", "Bulk operations", "Set it and forget it"],
    badge: "Efficiency Pro",
    badgeColor: "bg-indigo-500 text-white"
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    title: "Multi-Business Management",
    description: "Running multiple ventures? We've got you. Switch between businesses faster than you can say 'profit margin'.",
    features: ["Unified dashboard", "Cross-business insights", "Team collaboration"],
    badge: "Enterprise Ready",
    badgeColor: "bg-gray-700 text-white"
  }
];

export default function UseCases() {
  return (
    <div className="mt-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold gradient-text mb-3">
          Why We're Never Sh*tty™
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Real solutions for real financial headaches. No BS features you'll never use.
          Just the good stuff that actually makes your life easier.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {useCases.map((useCase, index) => (
          <Card 
            key={index} 
            className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:border-orange-500/50"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 dark:text-orange-400">
                  {useCase.icon}
                </div>
                <Badge className={useCase.badgeColor}>
                  {useCase.badge}
                </Badge>
              </div>
              <CardTitle className="text-lg">
                {useCase.title}
              </CardTitle>
              <CardDescription>
                {useCase.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {useCase.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-orange-500 dark:text-orange-400 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                variant="ghost" 
                className="w-full group hover:bg-orange-50 dark:hover:bg-orange-950/30"
              >
                Learn More 
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-3">
              Ready to Un-Sh*ttify Your Finances?
            </h3>
            <p className="text-muted-foreground mb-4">
              Join thousands of businesses who've already made the switch to financial management that doesn't suck.
            </p>
            <div className="flex gap-3 justify-center">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Start Free Trial
              </Button>
              <Button variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30">
                Watch Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}