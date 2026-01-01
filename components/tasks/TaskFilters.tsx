"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TaskFilters = {
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assignedTo?: string; // userId
};

type Assignee = { id: string; name: string; email: string };

export default function TasksFiltersUI({
  status,
  priority,
  assignedTo,
  assignees,
  onChange,
}: {
  status?: TaskFilters["status"];
  priority?: TaskFilters["priority"];
  assignedTo?: TaskFilters["assignedTo"];
  assignees: Assignee[];
  onChange: (next: Partial<TaskFilters>) => void;
}) {
  const ALL = "all";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={status ?? ALL}
          onValueChange={(v) => onChange({ status: v === ALL ? undefined : (v as TaskFilters["status"]) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            <SelectItem value="TODO">TODO</SelectItem>
            <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
            <SelectItem value="DONE">DONE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Select
          value={priority ?? ALL}
          onValueChange={(v) => onChange({ priority: v === ALL ? undefined : (v as TaskFilters["priority"]) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            <SelectItem value="LOW">LOW</SelectItem>
            <SelectItem value="MEDIUM">MEDIUM</SelectItem>
            <SelectItem value="HIGH">HIGH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Assignee</Label>
        <Select
          value={assignedTo ?? ALL}
          onValueChange={(v) => onChange({ assignedTo: v === ALL ? undefined : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            {assignees.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name} ({u.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
