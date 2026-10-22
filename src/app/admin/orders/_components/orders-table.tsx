"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { Eye } from "lucide-react"; // Make sure Eye is imported
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

type Order = {
  id: string;
  orderNumber: string;
  email: string;
  total: string | number;
  status: string;
  createdAt: string;
};

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/admin/orders/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.error?.message || "Failed to update status",
      );
    },
  });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{order.email}</TableCell>
              <TableCell>{formatPrice(order.total.toString())}</TableCell>
              <TableCell>
                <Select
                  defaultValue={order.status}
                  onValueChange={(val) =>
                    updateStatusMutation.mutate({ id: order.id, status: val })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                {/* 🔄 CHANGED: Links to the new page instead of a drawer */}
                <Button
                  variant="ghost"
                  size="icon"
                  render={<Link href={`/admin/orders/${order.id}`} />}
                >
                  <Eye className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
