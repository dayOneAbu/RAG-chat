import { SignUpForm } from "~/app/_components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex w-full max-w-[350px] flex-col space-y-6 rounded-xl border bg-gradient-to-br from-blue-500 to-darkblue-800 p-10 text-center">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            አዲስ አካውንት ፍጠር
          </h1>
          <p className="text-sm text-gray-200">
            እባክዎ አዲስ አካውንት ለመፍጠር ኢሜልዎን ያስገቡ
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}