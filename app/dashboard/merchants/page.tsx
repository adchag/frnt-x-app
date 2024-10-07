"use client";

import Link from "next/link";
import { useMerchant } from "@/hooks/use-merchant";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/page-loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Merchant } from "@/types/supabase/merchants.type";

const MerchantCard = ({ merchant }: { merchant: Merchant }) => (
  <Link href={`/dashboard/merchants/${merchant.id}`}>
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <Avatar>
          <AvatarImage src={merchant.logo?.url} alt={merchant.company_name} />
          <AvatarFallback>{merchant.company_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{merchant.company_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2">{merchant.description}</CardDescription>
      </CardContent>
    </Card>
  </Link>
);

const MerchantsPage = () => {
  const { merchants, isLoading, error } = useMerchant();

  return (
    <PageLoader isLoading={isLoading}>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Merchant Mandates</h1>
          <Link href="/dashboard/merchants/new">
            <Button>Create New Mandate</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants?.map((merchant: Merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      </div>
    </PageLoader>
  );
};

export default MerchantsPage;
