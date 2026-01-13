"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormReturn, useForm } from "react-hook-form";
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
import { signUpFormSchema, type SignUpFormData } from "~/lib/types/auth";

interface ApiError {
  message: string;
}

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form: UseFormReturn<SignUpFormData> = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUpFormData) {
    try {
      setIsLoading(true);
      setFormError(null);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        setFormError(error.message || "ይህ ኢሜል ቀደም ሲል ተጠቅመዋል።");
        toast.error(error.message || "ይህ ኢሜል ቀደም ሲል ተጠቅመዋል።");
        return;
      }

      const data = await response.json();
      toast.success(data.message || "Registration successful. Please check your email to verify your account.");
      router.push("/auth/verify-pending");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("አካውንት መፍጠር አልተሳካም");
      }
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
                    placeholder="hello@example.com"
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
                <FormLabel className="text-sm font-medium">የይለፍ ቃል</FormLabel>
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
            className="w-full font-medium mt-10"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "እየፈጠረ ነው..." : "አካውንት ፍጠር"}
          </Button>
        </form>
      </Form>
      {formError && (
        <div className="text-red-500 text-sm text-center mt-2">{formError}</div>
      )}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">አካውንት አለዎት? </span>
        <Link
          href="/auth/signin"
          className="text-primary hover:underline"
        >
          ይግቡ
        </Link>
      </div>
    </div>
  );
}