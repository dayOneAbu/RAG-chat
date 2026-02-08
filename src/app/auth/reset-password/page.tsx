"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import { Input } from "~/app/_components/ui/input";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት"),
  confirmPassword: z.string().min(6, "የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "የዯለፍ ቃሎች መመሳሰል አለባቸው",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!email || !token) {
      setFormError("የተሳሳተ ወይም ጊዜው ያለፈበት የይለፍ ቃል መልሶ ማግኛ ማስረጃ");
    }
  }, [email, token]);

  async function onSubmit(values: ResetPasswordFormData) {
    try {
      setIsLoading(true);
      setFormError(null);
      console.log("Submitting reset:", { email, token, password: values.password });
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password: values.password,
        }),
      });
      const data = await response.json();
      console.log("Reset response:", data);
      if (!response.ok) {
        setFormError(data.message || "የይለፍ ቃል መልሶ ማግኛ አልተሳካም");
        toast.error(data.message || "የይለፍ ቃል መልሶ ማግኛ አልተሳካም");
        return;
      }
      toast.success("የይለፍ ቃል በተሳካ ሁኔታ ተቀዯሯል");
      router.push("/auth/signin");
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError("የይለፍ ቃል መልሶ ማግኛ አልተሳካም");
      toast.error("የይለፍ ቃል መልሶ ማግኛ አልተሳካም");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6 pt-16">
      <h1 className="text-2xl font-bold text-center">የይለፍ ቃል መልሶ ማግኛ</h1>
      {formError && (
        <div className="text-red-500 text-sm text-center">{formError}</div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">አዲስ የይለፍ ቃል</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">የይለፍ ቃል አረጋግጥ</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <Button
            className="w-full font-medium"
            type="submit"
            disabled={isLoading || !email || !token}
          >
            {isLoading ? "እየተቀየረ ነው..." : "የይለፍ ቃል ቀይር"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-sm space-y-6 pt-16">
          <h1 className="text-2xl font-bold text-center">የይለፍ ቃል መልሶ ማግኛ</h1>
          <div className="text-center text-muted-foreground">እየጫነ ነው...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}