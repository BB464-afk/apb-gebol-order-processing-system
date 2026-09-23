import React from 'react';
import { Building2, FileSpreadsheet, Truck, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BuyerObject, OrderObject, DeliveryObject } from '../types/po';

interface BusinessObjectsEditorProps {
  buyer: BuyerObject;
  order: OrderObject;
  delivery: DeliveryObject;
  onChangeBuyer: (buyer: BuyerObject) => void;
  onChangeOrder: (order: OrderObject) => void;
  onChangeDelivery: (delivery: DeliveryObject) => void;
}

export const BusinessObjectsEditor: React.FC<BusinessObjectsEditorProps> = ({
  buyer,
  order,
  delivery,
  onChangeBuyer,
  onChangeOrder,
  onChangeDelivery,
}) => {
  const isVatValid = buyer.vatId && buyer.vatId.trim().length > 6;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* BUYER OBJECT CARD */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xs overflow-hidden flex flex-col">
        {/* Card Header */}
        <div className="bg-[#1A1A1A] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#333333]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#F8B800]" />
            <span className="font-bold text-xs uppercase tracking-wider">
              1. Buyer Business Object
            </span>
          </div>
        </div>

        {/* Card Form */}
        <div className="p-4 space-y-3.5 flex-1 bg-white text-xs text-[#1A1A1A]">
          <div>
            <label className="block font-semibold text-[11px] text-gray-700 mb-1">
              Company Name (Legal Entity) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={buyer.companyName}
              onChange={(e) => onChangeBuyer({ ...buyer, companyName: e.target.value })}
              className="w-full p-2 border border-[#E0E0E0] rounded font-medium focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1">
                GEBOL Customer ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={buyer.customerNumber}
                onChange={(e) => onChangeBuyer({ ...buyer, customerNumber: e.target.value })}
                className="w-full p-2 border border-[#E0E0E0] rounded font-mono font-semibold focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1 flex items-center justify-between">
                <span>VAT / UID No. <span className="text-red-500">*</span></span>
                {!isVatValid && (
                  <span className="text-[#ED6C02] text-[10px] font-bold">REQUIRED</span>
                )}
              </label>
              <input
                type="text"
                value={buyer.vatId}
                placeholder="e.g. DE143422091"
                onChange={(e) => onChangeBuyer({ ...buyer, vatId: e.target.value })}
                className={`w-full p-2 border rounded font-mono font-semibold focus:outline-none ${
                  !isVatValid
                    ? 'border-[#ED6C02] bg-amber-50/50'
                    : 'border-[#E0E0E0] bg-[#FAFAFA] focus:border-[#F8B800]'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={buyer.contactPerson}
                onChange={(e) => onChangeBuyer({ ...buyer, contactPerson: e.target.value })}
                className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={buyer.email}
                onChange={(e) => onChangeBuyer({ ...buyer, email: e.target.value })}
                className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
            </div>
          </div>

          {/* Billing Address Sub-block */}
          <div className="pt-2 border-t border-[#E0E0E0]">
            <span className="block font-bold text-[10px] text-gray-500 uppercase mb-2">
              Billing Address
            </span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Street Address"
                value={buyer.billingAddress.street}
                onChange={(e) =>
                  onChangeBuyer({
                    ...buyer,
                    billingAddress: { ...buyer.billingAddress, street: e.target.value },
                  })
                }
                className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={buyer.billingAddress.postalCode}
                  onChange={(e) =>
                    onChangeBuyer({
                      ...buyer,
                      billingAddress: { ...buyer.billingAddress, postalCode: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-[#E0E0E0] rounded font-mono focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={buyer.billingAddress.city}
                  onChange={(e) =>
                    onChangeBuyer({
                      ...buyer,
                      billingAddress: { ...buyer.billingAddress, city: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA] col-span-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ORDER OBJECT CARD */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xs overflow-hidden flex flex-col">
        {/* Card Header */}
        <div className="bg-[#1A1A1A] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#333333]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#F8B800]" />
            <span className="font-bold text-xs uppercase tracking-wider">
              2. Order Business Object
            </span>
          </div>
        </div>

        {/* Card Form */}
        <div className="p-4 space-y-3.5 flex-1 bg-white text-xs text-[#1A1A1A]">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1">
                Customer PO Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={order.poNumber}
                onChange={(e) => onChangeOrder({ ...order, poNumber: e.target.value })}
                className="w-full p-2 border border-[#E0E0E0] rounded font-mono font-bold focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1">
                PO Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={order.poDate}
                onChange={(e) => onChangeOrder({ ...order, poDate: e.target.value })}
                className="w-full p-2 border border-[#E0E0E0] rounded font-mono focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={order.currency}
                onChange={(e) => onChangeOrder({ ...order, currency: e.target.value })}
                className="w-full p-2 border border-[#E0E0E0] rounded font-mono font-bold focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CHF">CHF (Fr)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1">
                Incoterms 2020
              </label>
              <input
                type="text"
                value={order.incoterms}
                onChange={(e) => onChangeOrder({ ...order, incoterms: e.target.value })}
                className="w-full p-2 border border-[#E0E0E0] rounded font-medium focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[11px] text-gray-700 mb-1">
              Payment Terms
            </label>
            <input
              type="text"
              value={order.paymentTerms}
              onChange={(e) => onChangeOrder({ ...order, paymentTerms: e.target.value })}
              className="w-full p-2 border border-[#E0E0E0] rounded font-medium focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[11px] text-gray-700 mb-1">
              Customer Instructions / Notes
            </label>
            <textarea
              rows={3}
              value={order.customerNotes || ''}
              onChange={(e) => onChangeOrder({ ...order, customerNotes: e.target.value })}
              className="w-full p-2 border border-[#E0E0E0] rounded text-xs focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              placeholder="e.g. Ramp exchange mandatory, direct delivery instructions..."
            />
          </div>
        </div>
      </div>

      {/* DELIVERY OBJECT CARD */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xs overflow-hidden flex flex-col">
        {/* Card Header */}
        <div className="bg-[#1A1A1A] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#333333]">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#F8B800]" />
            <span className="font-bold text-xs uppercase tracking-wider">
              3. Delivery Business Object
            </span>
          </div>
        </div>

        {/* Card Form */}
        <div className="p-4 space-y-3.5 flex-1 bg-white text-xs text-[#1A1A1A]">
          <div>
            <label className="block font-semibold text-[11px] text-gray-700 mb-1">
              Recipient Facility / Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={delivery.recipientName}
              onChange={(e) => onChangeDelivery({ ...delivery, recipientName: e.target.value })}
              className="w-full p-2 border border-[#E0E0E0] rounded font-semibold focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1">
                Requested Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={delivery.requestedDeliveryDate}
                onChange={(e) => onChangeDelivery({ ...delivery, requestedDeliveryDate: e.target.value })}
                className="w-full p-2 border border-[#E0E0E0] rounded font-mono font-bold focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[11px] text-gray-700 mb-1">
                Unloading Ramp / Point
              </label>
              <input
                type="text"
                value={delivery.unloadingPoint || ''}
                placeholder="Ramp 12"
                onChange={(e) => onChangeDelivery({ ...delivery, unloadingPoint: e.target.value })}
                className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[11px] text-gray-700 mb-1">
              Carrier / Shipping Method
            </label>
            <input
              type="text"
              value={delivery.shippingMethod}
              onChange={(e) => onChangeDelivery({ ...delivery, shippingMethod: e.target.value })}
              className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
            />
          </div>

          {/* Ship To Address Sub-block */}
          <div className="pt-2 border-t border-[#E0E0E0]">
            <span className="block font-bold text-[10px] text-gray-500 uppercase mb-2">
              Destination Street Address
            </span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Street Address"
                value={delivery.deliveryAddress.street}
                onChange={(e) =>
                  onChangeDelivery({
                    ...delivery,
                    deliveryAddress: { ...delivery.deliveryAddress, street: e.target.value },
                  })
                }
                className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={delivery.deliveryAddress.postalCode}
                  onChange={(e) =>
                    onChangeDelivery({
                      ...delivery,
                      deliveryAddress: { ...delivery.deliveryAddress, postalCode: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-[#E0E0E0] rounded font-mono focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA]"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={delivery.deliveryAddress.city}
                  onChange={(e) =>
                    onChangeDelivery({
                      ...delivery,
                      deliveryAddress: { ...delivery.deliveryAddress, city: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-[#FAFAFA] col-span-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
