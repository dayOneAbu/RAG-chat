"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
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
import { signInFormSchema, type SignInFormData } from "~/lib/types/auth";

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInFormData) {
    try {
      setIsLoading(true);
      setFormError(null);
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (result?.error) {
        const errorMessage =
          result.error === "Please verify your email before signing in"
            ? "እባክዎ መጀመሪያ ኢሜልዎን ያረጋግጡ"
            : "የትክክሲ አይደለም። ኢሜል ወይም የይለፍ ቃል ያስተካክሉ";
        setFormError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      toast.success("በተሳካ ሁኔታ ገብተዋል");
      router.refresh();
      router.push("/");
    } catch (err) {
      setFormError("ወደ ሲስተሙ መግባት አልተሳካም");
      toast.error("ወደ ሲስተሙ መግባት አልተሳካም");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium mt-3">የይለፍ ቃል</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <div className="flex justify-end mb-2 mt-10">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-blue-600 hover:underline"
            >
              የይለፍ ቃል ረስተዋል?
            </Link>
          </div>
          <Button
            className="w-full font-medium"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "እየገባ ነው..." : "ይግቡ"}
          </Button>
        </form>
      </Form>
      {formError && (
        <div className="text-red-500 text-sm text-center mt-2">{formError}</div>
      )}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">አካውንት የለዎትም? </span>
        <Link
          href="/auth/signup"
          className="text-primary hover:underline"
        >
          አዲስ አካውንት ይፍጠሩ
        </Link>
      </div>
    </div>
  );
}