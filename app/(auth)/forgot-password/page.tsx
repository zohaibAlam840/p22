"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { forgotPassword } from "@/lib/api/auth";

const Schema = z.object({
  email: z.string().email(),
});
type Values = z.infer<typeof Schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: Values) {
    try {
      await forgotPassword(values.email);
      toast.success("Reset link sent. Please check your email.");
      router.replace("/login");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send reset email");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>We’ll email you a link to reset your password.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
            </Button>

            <div className="text-sm text-muted-foreground">
              Remembered it?{" "}
              <a className="underline" href="/login">
                Back to login
              </a>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
