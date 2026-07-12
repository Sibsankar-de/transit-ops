import React from "react";

type AuthCardProps = {
  children: React.ReactNode;
};

export const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <div className="flex h-full items-center justify-center bg-card px-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-foreground">Sign In</h1>

        <p className="mt-3 text-muted-foreground">
          Enter your credentials to access the platform.
        </p>

        {children}
      </div>
    </div>
  );
};
