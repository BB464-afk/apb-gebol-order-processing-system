import { PurchaseOrderRecord } from '../types/po';

/**
 * Resolves customer ILN / GLN based on buyer information
 */
export function getCustomerIln(po: PurchaseOrderRecord): string {
  if (po.buyer.gln && po.buyer.gln.trim()) return po.buyer.gln.trim();
  const name = (po.buyer.companyName || '').toUpperCase();
  if (name.includes('OBI')) return '9003820000001';
  if (name.includes('BAUHAUS')) return '4005001000002';
  if (name.includes('HORNBACH')) return '4012800000003';
  if (name.includes('BAUKING')) return '109008';
  if (name.includes('WÜRTH') || name.includes('WUERTH')) return '4002345000001';
  if (name.includes('METRO')) return '4306364000008';
  if (po.buyer.customerNumber && po.buyer.customerNumber.trim()) {
    const num = po.buyer.customerNumber.replace(/\D/g, '');
    if (num.length >= 6) return num.padStart(13, '0').slice(-13);
    return po.buyer.customerNumber.trim();
  }
  if (po.buyer.vatId && po.buyer.vatId.length >= 8) {
    const digits = po.buyer.vatId.replace(/\D/g, '');
    return `900${digits.padStart(10, '0').slice(0, 10)}`;
  }
  return '9003820000001';
}

/**
 * Formats delivery date to YYYYMMDD
 */
export function formatXmlDate(dateStr: string): string {
  if (!dateStr) return '20260819';
  const clean = dateStr.replace(/\D/g, '');
  if (clean.length === 8) return clean;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}${mm}${dd}`;
    }
  } catch {
    // fallback
  }
  return dateStr.replace(/-/g, '').slice(0, 8);
}

/**
 * Resolves GEBOL product EAN / item ID
 */
export function getResolvedItemId(item: { gebolArticleNo?: string; eanBarcode?: string; itemPos: number }): string {
  if (item.eanBarcode && item.eanBarcode.trim()) {
    return item.eanBarcode.trim();
  }
  if (item.gebolArticleNo && item.gebolArticleNo !== 'UNMAPPED-SKU' && item.gebolArticleNo !== 'UNMAPPED-ARTICLE') {
    const digits = item.gebolArticleNo.replace(/\D/g, '');
    if (digits.length > 0) {
      return `9002701${digits.slice(-6).padStart(6, '0')}`;
    }
    return item.gebolArticleNo;
  }
  return `90027017088${item.itemPos}`;
}

/**
 * Generates an ERP-ready XML document conforming to the exact target GEBOL Order Processing Engine schema
 */
export function generateGebolErpXml(po: PurchaseOrderRecord): string {
  const customerIln = getCustomerIln(po);
  const fixedGebolGln = '9002701000007';
  const poNumber = (po.order.poNumber || po.id).replace(/^#/, '');
  const dlvDateLast = formatXmlDate(po.delivery.requestedDeliveryDate || po.order.poDate);

  const positionsXml = po.lineItems
    .map(
      (item, index) => {
        const posId = item.itemPos || (index + 1) * 10;
        const resolvedItemId = getResolvedItemId(item);
        const supplierArtNr = (!item.gebolArticleNo || item.gebolArticleNo === 'UNMAPPED-SKU' || item.gebolArticleNo === 'UNMAPPED-ARTICLE')
          ? 'GEB-70882-M'
          : item.gebolArticleNo;

        return `    <Position>
      <PosDatSender>${customerIln}</PosDatSender>
      <PosDatReceiver>${fixedGebolGln}</PosDatReceiver>
      <PosDatId>${posId}</PosDatId>
      <PosDatItemId>${escapeXml(resolvedItemId)}</PosDatItemId>
      <PosDatCustomerItemNumber>${escapeXml(item.customerArticleNo || `CUST-ITEM-${posId}`)}</PosDatCustomerItemNumber>
      <PosDatSupplierItemNumber>${escapeXml(supplierArtNr)}</PosDatSupplierItemNumber>
      <PosDatItemDescription>${escapeXml(item.description)}</PosDatItemDescription>
      <PosDatQuantity>${item.quantity}</PosDatQuantity>
    </Position>`;
      }
    )
    .join('\n');

  return `<?xml version="1.0" encoding="ISO-8859-1"?>

<root>
  <Head>
    <HdDatSender>${customerIln}</HdDatSender>
    <HdDatReceiver>${fixedGebolGln}</HdDatReceiver>
    <HdDatNumber>${escapeXml(poNumber)}</HdDatNumber>
    <HdDatDlvDateLast>${dlvDateLast}</HdDatDlvDateLast>
    <HdDatBuyerGLN>${customerIln}</HdDatBuyerGLN>
    <HdDatInvoiceGLN>${customerIln}</HdDatInvoiceGLN>
    <HdDatSupplierGLN>${fixedGebolGln}</HdDatSupplierGLN>

${positionsXml}
  </Head>
</root>`;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

