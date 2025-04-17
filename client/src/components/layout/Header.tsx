import { Bell, MoreVertical } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function Header() {
  const currentDate = formatDate(new Date());

  return (
    <header className="relative z-10 flex flex-shrink-0 h-16 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between flex-1 px-4">
        <div className="flex flex-1 items-center">
          <div className="flex w-full md:ml-0">
            <div className="relative w-full text-gray-500 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input 
                className="block w-full h-full pl-10 pr-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border-transparent rounded-md focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-0 sm:text-sm" 
                placeholder="Search financial data..." 
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <ThemeToggle />
          
          <button className="ml-3 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none">
            <Bell className="h-6 w-6" />
          </button>
          
          <div className="ml-3 relative">
            <button className="flex max-w-xs bg-gray-100 dark:bg-gray-600 rounded-full p-1 text-sm">
              <MoreVertical className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
