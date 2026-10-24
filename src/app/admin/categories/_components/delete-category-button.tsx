"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/axios";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type DeleteCategoryButtonProps = {
  categoryId: string; // 🔄 CHANGED: from categorySlug to categoryId
  categoryName: string;
  productCount: number;
};

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  productCount,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      // 🔄 CHANGED: Use ID in the endpoint
      await api.delete(`/categories/${categoryId}`);
      toast.success("Category deleted successfully");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message || "Failed to delete category",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the <strong>{categoryName}</strong>{" "}
            category? This action cannot be undone.
            {productCount > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                You cannot delete this category because it has {productCount}{" "}
                product(s) assigned to it. Please reassign or delete those
                products first.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || productCount > 0}
          >
            {isDeleting && <Loader2 className="size-4 mr-2 animate-spin" />}
            Delete Category
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
