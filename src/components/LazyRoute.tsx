import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyRouteProps {
  children: React.ReactNode;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ children }) => {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-medical mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};