"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMerchant } from "@/hooks/use-merchant";
import PageLoader from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, Trello, MessageSquare, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="xs" asChild>
          <Link href="/dashboard/merchants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Merchants
          </Link>
        </Button>
      </div>
      <div className="flex items-center mb-4">
        <Avatar className="h-16 w-16 mr-4">
          <AvatarImage src={merchant.logo?.url} alt={merchant.company_name} />
          <AvatarFallback>{merchant.company_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{merchant.company_name}</h1>
          <p className="text-gray-600">{merchant.description}</p>
        </div>
      </div>
      <Tabs value={activeTab} className="mb-4">
        <TabsList className="inline-flex">
          <TabsTrigger value="details" asChild>
            <Link href={`/dashboard/merchants/${id}`} className="flex items-center">
              <Info className="mr-2 h-4 w-4" />
              Details
            </Link>
          </TabsTrigger>
          <TabsTrigger value="trello" asChild>
            <Link href={`/dashboard/merchants/${id}/trello`} className="flex items-center">
              <Trello className="mr-2 h-4 w-4" />
              Trello
            </Link>
          </TabsTrigger>
          <TabsTrigger value="chat" asChild>
            <Link href={`/dashboard/merchants/${id}/chat`} className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Link>
          </TabsTrigger>
          <TabsTrigger value="edit" asChild>
            <Link href={`/dashboard/merchants/${id}/edit`} className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white shadow-md rounded-lg p-4">{children}</div>
    </div>
  );
};

export default MerchantLayout;
