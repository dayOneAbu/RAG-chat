import { SignInForm } from "~/app/_components/auth/sign-in-form";

export default function SignInPage() {
  return (
    // <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-darkblue-800 -mt-20">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">እንኳን ደህና መጡ</h1>
          <p className="text-sm text-muted-foreground">
            እባክዎ ወደ አካውንትዎ ለመግባት ኢሜልዎን እና የይለፍ ቃልዎን ያስገቡ
          </p>
        </div>
        <div className="mt-6">
          <SignInForm />
        </div>
      </div>
    </div>
  );
} 