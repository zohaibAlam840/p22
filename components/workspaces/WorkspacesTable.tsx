"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { OrganizationListItem } from "../../lib/api/organizations";
import { deleteOrganization } from "../../lib/api/organizations";

export default function OrganizationsTable({
  items,
  loading,
  onChanged,
}: {
  items: OrganizationListItem[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleDelete(orgId: string) {
    setDeletingId(orgId);
    try {
      await deleteOrganization(orgId);
      toast.success("Organization deleted");
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="border rounded-2xl p-4 space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((o) => {
            const isOwner = o.myRole === "OWNER";
            const busy = deletingId === o.id;

            return (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.name}</TableCell>

                <TableCell>
                  <Badge variant="secondary">{o.myRole}</Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/org/${o.id}/tickets`}>Open</Link>
                    </Button>

                    {isOwner && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" disabled={busy}>
                            {busy ? "Deleting…" : "Delete"}
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete organization?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the organization and all tenant data (tickets, comments,
                              memberships, attachments). This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(o.id)} disabled={busy}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}

          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                No organizations yet. Create your first organization.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
