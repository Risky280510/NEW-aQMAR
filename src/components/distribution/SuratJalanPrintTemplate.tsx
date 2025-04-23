import React from "react";
import { format } from "date-fns";
import { TransferDetails } from "@/services/distributionService";

interface SuratJalanPrintTemplateProps {
  transferData: TransferDetails;
}

const SuratJalanPrintTemplate: React.FC<SuratJalanPrintTemplateProps> = ({
  transferData,
}) => {
  // Format the transfer date
  const formattedDate =
    typeof transferData.transferDate === "string"
      ? format(new Date(transferData.transferDate), "dd MMMM yyyy")
      : format(transferData.transferDate, "dd MMMM yyyy");

  // Determine the unit label based on transfer type
  const unitLabel = transferData.transferType === "dus" ? "Box" : "Pair";

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">SURAT JALAN</h1>
        <p className="text-lg">
          No: {transferData.transferNumber || `SJ-${transferData.id}`}
        </p>
        <p>Tanggal: {formattedDate}</p>
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Shipped From:</h2>
          <p className="font-semibold">{transferData.sourceLocationName}</p>
          {transferData.sourceLocationAddress && (
            <p>{transferData.sourceLocationAddress}</p>
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Shipped To:</h2>
          <p className="font-semibold">
            {transferData.destinationLocationName}
          </p>
          {transferData.destinationLocationAddress && (
            <p>{transferData.destinationLocationAddress}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">No.</th>
              <th className="border p-2 text-left">Item Code</th>
              <th className="border p-2 text-left">Item Description</th>
              <th className="border p-2 text-right">Quantity</th>
              <th className="border p-2 text-left">Unit</th>
            </tr>
          </thead>
          <tbody>
            {transferData.items.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{item.skuProduk || "-"}</td>
                <td className="border p-2">
                  {item.productName} - {item.colorName}
                  {item.sizeName && ` - Size ${item.sizeName}`}
                </td>
                <td className="border p-2 text-right">{item.quantity}</td>
                <td className="border p-2">{unitLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes Section */}
      {transferData.notes && (
        <div className="mb-6">
          <h2 className="font-bold mb-2">Notes:</h2>
          <p className="border p-3 bg-gray-50">{transferData.notes}</p>
        </div>
      )}

      {/* Signature Section */}
      <div className="grid grid-cols-3 gap-4 mt-12">
        <div className="text-center">
          <p className="font-bold">Sender</p>
          <div className="h-16 mt-8 mb-2 border-b border-dashed"></div>
          <p>Name & Signature</p>
        </div>

        <div className="text-center">
          <p className="font-bold">Expedition</p>
          <div className="h-16 mt-8 mb-2 border-b border-dashed"></div>
          <p>Name & Signature</p>
        </div>

        <div className="text-center">
          <p className="font-bold">Recipient</p>
          <div className="h-16 mt-8 mb-2 border-b border-dashed"></div>
          <p>Name & Signature</p>
        </div>
      </div>

      {/* Print-specific styles - removed as they're now handled in the print window */}
    </div>
  );
};

export default SuratJalanPrintTemplate;
