"use client";

import React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createTask,
  updateTask,
  deleteTask,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/api/tasks";
import { isoDateInputValue } from "@/lib/uitils/dates";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Schema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assignedTo: z.string().optional(), // store "" for unassigned in the form
  dueDate: z.string().optional(), // yyyy-mm-dd
});

type Values = z.infer<typeof Schema>;

export default function TaskDialog({
  mode,
  open,
  onOpenChange,
  projectId,
  assignees,
  task,
  canDelete,
  onDone,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  assignees: { id: string; name: string; email: string }[];
  task: TaskItem | null;
  canDelete: boolean;
  onDone: () => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: (task?.status as TaskStatus) ?? "TODO",
      priority: (task?.priority as TaskPriority) ?? "MEDIUM",
      assignedTo: task?.assignedTo ?? "",
      dueDate: isoDateInputValue(task?.dueDate),
    },
  });

  React.useEffect(() => {
    form.reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: (task?.status as TaskStatus) ?? "TODO",
      priority: (task?.priority as TaskPriority) ?? "MEDIUM",
      assignedTo: task?.assignedTo ?? "",
      dueDate: isoDateInputValue(task?.dueDate),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, open, mode]);

  async function onSubmit(values: Values) {
    try {
      const payload = {
        projectId,
        title: values.title,
        description: values.description || undefined,
        status: values.status as any,
        priority: values.priority as any,
        assignedTo: values.assignedTo ? values.assignedTo : null,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      };

      if (mode === "create") {
        await createTask(payload);
        toast.success("Task created");
      } else {
        if (!task) return;

        await updateTask(task.id, {
          title: values.title,
          description: values.description || null,
          status: values.status as any,
          priority: values.priority as any,
          assignedTo: values.assignedTo ? values.assignedTo : null,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        });
        toast.success("Task updated");
      }

      onOpenChange(false);
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    }
  }

  async function onDelete() {
    if (!task) return;
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
      onOpenChange(false);
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  // IMPORTANT: Radix SelectItem cannot use empty string values.
  const UNASSIGNED = "__none__";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create task" : "Edit task"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value ?? "TODO"} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">TODO</SelectItem>
                        <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                        <SelectItem value="DONE">DONE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value ?? "MEDIUM"} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">LOW</SelectItem>
                        <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                        <SelectItem value="HIGH">HIGH</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => {
                  const current = field.value && field.value.length ? field.value : UNASSIGNED;

                  return (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>

                      <Select
                        value={current}
                        onValueChange={(v) => field.onChange(v === UNASSIGNED ? "" : v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                          {assignees.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} ({a.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
              <div>
                {mode === "edit" && (
                  <Button type="button" variant="destructive" onClick={onDelete} disabled={!canDelete}>
                    Delete
                  </Button>
                )}
              </div>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
