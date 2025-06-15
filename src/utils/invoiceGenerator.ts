import jsPDF from 'jspdf';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
}

// Function to convert image to base64
const getImageAsBase64 = (imagePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = imagePath;
  });
};

export const generateInvoice = async (invoiceData: InvoiceData) => {
  const doc = new jsPDF();
  
  // Add company logo
  try {
    const logoBase64 = await getImageAsBase64('/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png');
    doc.addImage(logoBase64, 'PNG', 20, 10, 30, 15);
  } catch (error) {
    console.log('Logo not available:', error);
  }
  
  // Company Header (positioned to avoid overlap with INVOICE)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('SK77 MEDIA PVT LTD', 20, 35);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('TRIP TESTED STREET CERTIFIED', 20, 45);
  doc.text('Email: support@bakwasclothingco.com', 20, 55);
  
  // Invoice Title (positioned on the right)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 150, 25);
  
  // Invoice Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoiceData.orderNumber}`, 150, 40);
  doc.text(`Date: ${invoiceData.orderDate}`, 150, 50);
  doc.text(`Status: ${invoiceData.status.toUpperCase()}`, 150, 60);
  doc.text(`Payment: ${invoiceData.paymentStatus.toUpperCase()}`, 150, 70);
  
  // Customer Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('BILL TO:', 20, 85);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.customerName, 20, 100);
  doc.text(invoiceData.customerEmail, 20, 110);
  doc.text(invoiceData.customerPhone, 20, 120);
  
  // Shipping Address
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIP TO:', 110, 85);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.shippingAddress.name, 110, 100);
  doc.text(invoiceData.shippingAddress.streetAddress, 110, 110);
  doc.text(`${invoiceData.shippingAddress.city}, ${invoiceData.shippingAddress.state}`, 110, 120);
  doc.text(`${invoiceData.shippingAddress.postalCode}, ${invoiceData.shippingAddress.country}`, 110, 130);
  doc.text(invoiceData.shippingAddress.phone, 110, 140);
  
  // Items Table Header
  let currentY = 155;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  // Header text without background box - align headers with data
  doc.setTextColor(0, 0, 0);
  doc.text('Product', 25, currentY);
  doc.text('Qty', 95, currentY);
  
  // Right-align headers to match price positioning
  const unitPriceHeader = 'Unit Price';
  const totalHeader = 'Total';
  const unitPriceHeaderWidth = doc.getTextWidth(unitPriceHeader);
  const totalHeaderWidth = doc.getTextWidth(totalHeader);
  
  doc.text(unitPriceHeader, 150 - unitPriceHeaderWidth, currentY);
  doc.text(totalHeader, 190 - totalHeaderWidth, currentY);
  
  // Add a line under headers
  doc.setDrawColor(0, 0, 0);
  doc.line(20, currentY + 3, 190, currentY + 3);
  
  doc.setFont('helvetica', 'normal');
  
  currentY += 20;
  
  // Items Table Body
  invoiceData.items.forEach((item, index) => {
    // No background boxes - clean borderless design
    
    // Truncate product name if too long
    const productName = item.product_name.length > 18 ? 
      item.product_name.substring(0, 18) + '...' : 
      item.product_name;
    
    doc.text(productName, 25, currentY);
    doc.text(item.quantity.toString(), 98, currentY);
    
    // Right-align prices with plenty of space
    const unitPrice = `₹${item.unit_price.toFixed(2)}`;
    const totalPrice = `₹${item.total_price.toFixed(2)}`;
    
    // Calculate text width and position with generous spacing
    const unitPriceWidth = doc.getTextWidth(unitPrice);
    const totalPriceWidth = doc.getTextWidth(totalPrice);
    
    // Position prices with plenty of room
    doc.text(unitPrice, 150 - unitPriceWidth, currentY);
    doc.text(totalPrice, 190 - totalPriceWidth, currentY);
    
    currentY += 15;
  });
  
  // Add a line after items
  doc.setDrawColor(0, 0, 0);
  doc.line(20, currentY + 5, 190, currentY + 5);
  
  currentY += 20;
  
  // Summary (right-aligned for better fit)
  const summaryX = 105;
  const valueX = 190;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Subtotal:', summaryX, currentY);
  const subtotalText = `₹${invoiceData.subtotal.toFixed(2)}`;
  doc.text(subtotalText, valueX - doc.getTextWidth(subtotalText), currentY);
  currentY += 10;
  
  if (invoiceData.discountAmount > 0) {
    doc.text('Discount:', summaryX, currentY);
    const discountText = `-₹${invoiceData.discountAmount.toFixed(2)}`;
    doc.text(discountText, valueX - doc.getTextWidth(discountText), currentY);
    currentY += 10;
  }
  
  doc.text('Shipping:', summaryX, currentY);
  const shippingText = `₹${invoiceData.shippingCost.toFixed(2)}`;
  doc.text(shippingText, valueX - doc.getTextWidth(shippingText), currentY);
  currentY += 15;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TOTAL:', summaryX, currentY);
  const totalText = `₹${invoiceData.totalAmount.toFixed(2)}`;
  doc.text(totalText, valueX - doc.getTextWidth(totalText), currentY);
  currentY += 30;
  
  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Thank you for your business!', 20, currentY);
  doc.text('For any queries, contact us at support@bakwasclothingco.com', 20, currentY + 10);
  
  // Terms and Conditions
  doc.setFontSize(8);
  doc.text('Terms & Conditions:', 20, currentY + 25);
  doc.text('1. All sales are final unless defective.', 20, currentY + 35);
  doc.text('2. Returns accepted within 7 days of delivery.', 20, currentY + 45);
  doc.text('3. Shipping charges are non-refundable.', 20, currentY + 55);
  
  return doc;
};

export const downloadInvoice = async (invoiceData: InvoiceData) => {
  const doc = await generateInvoice(invoiceData);
  doc.save(`Invoice-${invoiceData.orderNumber}.pdf`);
}; 