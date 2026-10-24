"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function CategorySidebarShadcn({
  categories,
}: {
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get("category");

  return (
    <Sidebar collapsible="none" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* All Products */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={pathname} />}
                  isActive={!currentCategory}
                >
                  All Products
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Dynamic Categories */}
              {categories.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton
                    render={
                      <Link href={`${pathname}?category=${category.slug}`} />
                    }
                    isActive={currentCategory === category.slug}
                  >
                    {category.name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
