import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { School, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync(password);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl overflow-hidden rounded-3xl">
          <div className="h-2 bg-gradient-to-r from-[hsl(var(--accent-pink))] via-[hsl(var(--accent-yellow))] to-[hsl(var(--accent-blue))]" />
          <CardHeader className="text-center pt-10 pb-2">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-float">
              <School className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 font-display">
              Welcome to Class!
            </CardTitle>
            <CardDescription className="text-lg">
              Your AI study buddy is waiting.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter School Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-center text-lg rounded-xl border-2 focus-visible:ring-primary/20"
                />
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm justify-center mt-2 bg-destructive/5 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                variant="fun" 
                size="lg"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" /> Checking...
                  </span>
                ) : (
                  "Enter Classroom"
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Hint: The secret is <strong>myschoolsecret2026</strong></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
