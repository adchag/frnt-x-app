"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMerchant } from "@/hooks/use-merchant";
import PageLoader from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const MerchantLayout = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams() as { id: string };
  const pathname = usePathname();
  const { merchant, isLoading, error } = useMerchant(id);

  const getActiveTab = (path?: string | null) => {
    if (path?.endsWith("/trello")) return "trello";
    if (path?.endsWith("/chat")) return "chat";
    if (path?.endsWith("/edit")) return "edit";
    return "details";
  };

  const activeTab = getActiveTab(pathname);

  if (isLoading) return <PageLoader isLoading={isLoading}>{children}</PageLoader>;
  if (error) return <div>Error: {error.message}</div>;
  if (!merchant) return <div>Merchant not found</div>;

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex">
        <Button variant="ghost" size="xs" asChild>
          <Link href="/dashboard/merchants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Merchants
          </Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold">{merchant.company_name}</h1>
      <p className="text-gray-600 mb-4">{merchant.description}</p>
      <Tabs value={activeTab} className="mb-4">
        <TabsList className="inline-flex">
          <TabsTrigger value="details" asChild>
            <Link href={`/dashboard/merchants/${id}`}>Details</Link>
          </TabsTrigger>
          <TabsTrigger value="trello" asChild>
            <Link href={`/dashboard/merchants/${id}/trello`}>Trello</Link>
          </TabsTrigger>
          <TabsTrigger value="chat" asChild>
            <Link href={`/dashboard/merchants/${id}/chat`}>Chat</Link>
          </TabsTrigger>
          <TabsTrigger value="edit" asChild>
            <Link href={`/dashboard/merchants/${id}/edit`}>Edit</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white shadow-md rounded-lg p-4">{children}</div>
    </div>
  );
};

export default MerchantLayout;
