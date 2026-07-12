import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHero } from "@/components/auth/AuthHero";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <main className="grid h-screen overflow-hidden bg-background lg:grid-cols-2">
      <AuthHero />

      <AuthCard>
        <SignInForm />
      </AuthCard>
    </main>
  );
}
