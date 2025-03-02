import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { cn } from "../../lib/utils";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Ensure no hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setMounted(true);
    
    // Get saved theme or system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (prefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Apply theme to document
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    // Save preference
    localStorage.setItem("theme", newTheme);
    
    // Transition effect for the body
    document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
    
    // Reset transition after animation completes
    setTimeout(() => {
      document.body.style.transition = "";
    }, 300);
  };
  
  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className={cn(
              "rounded-full relative overflow-hidden", 
              "hover:bg-accent/50"
            )}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <div className="relative w-5 h-5">
              {theme === "light" ? (
                <motion.div
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {theme === "light" ? "dark" : "light"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 