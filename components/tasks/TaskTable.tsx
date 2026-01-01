"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TaskItem } from "@/lib/api/tasks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TasksTable({
  tasks,
  canEditAny,
  canEditAssigned,
  onEdit,
  onLogs,
}: {
  tasks: TaskItem[];
  canEditAny: boolean;
  canEditAssigned: (task: TaskItem) => boolean;
  onEdit: (task: TaskItem) => void;
  onLogs: (task: TaskItem) => void;
}) {
  return (
    <div className="border rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.map((t) => {
            const canEdit = canEditAny || canEditAssigned(t);

            return (
              <TableRow key={t.id}>
                <TableCell className="font-medium max-w-[320px] truncate">{t.title}</TableCell>
                <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                <TableCell className="text-muted-foreground">
                  {t.assignee ? `${t.assignee.name}` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onLogs(t)}>
                    Logs
                  </Button>
                  <Button variant="outline" size="sm" disabled={!canEdit} onClick={() => onEdit(t)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}

          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                No tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
