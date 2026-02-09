"use client";
import { useState } from "react";
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

const forgotPasswordSchema = z.object({
  email: z.string().email("የተሳሳተ ኢሜል አድራሻ"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormData) {
    try {
      setIsLoading(true);
      setFormError(null);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setFormError(data.message ?? "የይለፍ ቃል መልሶ ማግኛ ጥያቄ አልተሳካም");
        toast.error(data.message ?? "የይለፍ ቃል መልሶ ማግኛ ጥያቄ አልተሳካም");
        return;
      }

      setSent(true);
      toast.success("ይህ ኢሜል ካለ መልሶ ማግኛ አገናኝ ተልኳል።");
    } catch (error) {
      console.error("Forgot password error:", error);
      setFormError("የይለፍ ቃል መልሶ ማግኛ ጥያቄ አልተሳካም");
      toast.error("የይለፍ ቃል መልሶ ማግኛ ጥያቄ አልተሳካም");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-30 w-full max-w-sm space-y-6">
      <h1 className="text-3xl font-bold text-center">የይለፍ ቃል መልሶ ማግኛ</h1>
      {sent ? (
        <p className="text-green-600 text-center">
          ይህ ኢሜል ካለ መልሶ ማግኛ አገናኝ ተልኳል።
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">ኢሜል</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ለምሳሌ: hello@example.com"
                      type="email"
                      autoComplete="email"
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
              disabled={isLoading}
            >
              {isLoading ? "እየተላከ ነው..." : "አስገባ"}
            </Button>
          </form>
        </Form>
      )}
      {formError && (
        <div className="text-red-500 text-sm text-center">{formError}</div>
      )}
    </div>
  );
}