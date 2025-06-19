import { Bell, MoreVertical } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function Header() {
  const currentDate = formatDate(new Date());
  
  return (
    <header className="relative z-10 flex flex-shrink-0 h-16 bg-zinc-900 border-b border-zinc-800 shadow-lg">
      <div className="flex justify-between flex-1 px-2 sm:px-4">
        <div className="flex flex-1 items-center min-w-0">
          {/* Chitty Services Logo - responsive */}
          <div className="flex items-center mr-2 sm:mr-6 flex-shrink-0">
            <img 
              src="/assets/SERVICES.png" 
              alt="Chitty Services Logo" 
              className="h-8 sm:h-10 w-auto"
            />
            <div className="ml-1 sm:ml-2 hidden sm:block">
              <span className="text-sm sm:text-lg font-bold gradient-text">Chitty Services</span>
            </div>
          </div>
          
          {/* Search - responsive */}
          <div className="flex w-full max-w-md">
            <div className="relative w-full text-zinc-400 focus-within:text-lime-400">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input 
                className="block w-full h-8 sm:h-full pl-8 sm:pl-10 pr-3 py-1 sm:py-2 text-sm text-zinc-200 bg-zinc-800 border-zinc-700 rounded-md focus:border-lime-500 focus:ring-lime-500 focus:ring-opacity-20" 
                placeholder="Search..." 
              />
            </div>
          </div>
        </div>
        
        {/* Actions - responsive */}
        <div className="ml-2 sm:ml-4 flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1 sm:p-2 rounded-full text-zinc-400 hover:text-lime-400 focus:outline-none transition-colors"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost"
              size="sm"
              className="flex bg-zinc-800 border border-zinc-700 rounded-full p-1 hover:border-lime-500 transition-colors"
            >
              <MoreVertical className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-300" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
