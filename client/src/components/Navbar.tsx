import { BookOpen, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useLogout } from "@/hooks/use-auth";
import { Link } from "wouter";

export function Navbar() {
  const logout = useLogout();

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-display">
              School AI Tutor
            </span>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logout.mutate()}
            className="text-muted-foreground hover:text-destructive gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
