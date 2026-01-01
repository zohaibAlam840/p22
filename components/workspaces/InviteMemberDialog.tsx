"use client";

import React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { inviteMember } from "@/lib/api/member";
import type { WorkspaceRole } from "@/lib/rbac/workspace";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Schema = z.object({
  email: z.string().email(),
  role: z.enum(["MEMBER", "ADMIN"]).optional(),
});
type Values = z.infer<typeof Schema>;

export default function InviteMemberDialog({
  workspaceId,
  canInvite,
  onInvited,
}: {
  workspaceId: string;
  canInvite: boolean;
  onInvited: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: "", role: "MEMBER" },
  });

  async function onSubmit(values: Values) {
    try {
      await inviteMember(workspaceId, { email: values.email, role: values.role as WorkspaceRole });
      toast.success("Member invited/added");
      setOpen(false);
      form.reset({ email: "", role: "MEMBER" });
      onInvited();
    } catch (e: any) {
      toast.error(e?.message ?? "Invite failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canInvite}>Invite member</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User email</FormLabel>
                  <FormControl><Input placeholder="user@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">MEMBER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Inviting…" : "Invite"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
