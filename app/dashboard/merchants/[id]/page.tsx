"use client";

import { useParams } from "next/navigation";
import { useMerchant } from "@/hooks/use-merchant";
import PageLoader from "@/components/page-loader";

const DetailsPage = () => {
  const { id } = useParams() as { id: string };
  const { merchant, isLoading, error } = useMerchant(id);

  if (isLoading) return <PageLoader isLoading={isLoading}>Loading...</PageLoader>;
  if (error) return <div>Error: {error.message}</div>;
  if (!merchant) return <div>Merchant not found</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Merchant Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Company Name</h3>
          <p>{merchant.company_name}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Description</h3>
          <p>{merchant.description}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Mandate</h3>
          <p>{merchant.mandate || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Size</h3>
          <p>{merchant.size || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Committed Funds</h3>
          <p>{merchant.committed_funds || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Structure</h3>
          <p>{merchant.structure || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Start Date</h3>
          <p>{merchant.start_date || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Main Contact</h3>
          <p>{merchant.main_contact || "N/A"}</p>
        </div>
        {/* Add more merchant details here */}
      </div>
    </div>
  );
};

export default DetailsPage;
