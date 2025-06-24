import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
  size?: string;
  color?: string;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    name?: string;
    streetAddress?: string; // from fallback
    street_address?: string; // from db
    city?: string;
    state?: string;
    postalCode?: string; // from fallback
    postal_code?: string; // from db
    country?: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
}

// Utility function to safely format currency
const formatCurrency = (amount: number): string => {
  try {
    // Using INR to avoid font rendering issues with the Rupee symbol (₹)
    return `INR ${Number(amount || 0).toFixed(2)}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `INR ${amount || 0}`;
  }
};

// Utility function to safely format date
const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Function to convert image to base64 with timeout
const getImageAsBase64 = (imagePath: string | null, timeout = 5000): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!imagePath) {
      resolve(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.warn('Image load timed out:', imagePath);
      resolve(null);
    }, timeout);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          console.warn('Could not get canvas context');
          resolve(null);
        }
      } catch (error) {
        console.error('Error converting image to base64:', error);
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      console.warn('Error loading image:', imagePath);
      resolve(null);
    };

    const imageUrl = imagePath.startsWith('http') ? imagePath : `${window.location.origin}${imagePath}`;
    img.src = imageUrl;
  });
};

export const generateInvoice = async (invoiceData: InvoiceData): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let y = 15;

  try {
    // 1. Header Section with Logo and Company Details
    const logoBase64 = await getImageAsBase64('/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png');
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, y, 40, 20);
    }

    // Company Details (Right Aligned)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SK77 Media Pvt LTD', 195, y + 5, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('www.bakwas.com', 195, y + 15, { align: 'right' });

    y += 30;

    // 2. Invoice Title and Details
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, 180, 25, 'F');
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, y + 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const invoiceDetails = [
      `Invoice #: ${invoiceData.orderNumber || 'N/A'}`,
      `Date: ${formatDate(invoiceData.orderDate || new Date().toISOString())}`,
      `Status: ${invoiceData.status || 'N/A'}`,
      `Payment: ${invoiceData.paymentStatus || 'N/A'}`
    ];
    
    invoiceDetails.forEach((detail, index) => {
      doc.text(detail, 195, y + 7 + (index * 5), { align: 'right' });
    });

    y += 35;

    // 3. Customer Information Section
    // Billing Info
    doc.setFillColor(250, 250, 250);
    doc.rect(15, y, 85, 40, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, y, 85, 40, 'S');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To', 20, y + 7);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.customerName || '', 20, y + 15);
    doc.text(invoiceData.customerEmail || '', 20, y + 22);
    doc.text(invoiceData.customerPhone || '', 20, y + 29);

    // Shipping Info
    doc.setFillColor(250, 250, 250);
    doc.rect(110, y, 85, 40, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(110, y, 85, 40, 'S');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ship To', 115, y + 7);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const sa = invoiceData.shippingAddress || {};
    const street = sa.streetAddress || sa.street_address || '';
    const city = sa.city || '';
    const state = sa.state || '';
    const postal = sa.postalCode || sa.postal_code || '';

    const shippingAddress = [
      sa.name || invoiceData.customerName || '',
      street,
      `${city}${city && state ? ', ' : ''}${state}${postal ? ' ' : ''}${postal}`,
      sa.country || '',
      `Phone: ${sa.phone || invoiceData.customerPhone || ''}`
    ].filter(line => line && String(line).trim() !== '' && String(line).trim() !== ',');
    
    const boxWidth = 85;
    const padding = 5;
    const maxWidth = boxWidth - (padding * 2);
    let currentY = y + 15;

    shippingAddress.forEach(line => {
      const lines = doc.splitTextToSize(String(line), maxWidth);
      doc.text(lines, 115, currentY);
      currentY += (lines.length * 5); // Move Y for next line(s)
    });


    y += 50;

    // 4. Items Table
    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, 180, 10, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, y, 180, 10, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Product', 20, y + 7);
    doc.text('Variant', 85, y + 7);
    doc.text('Price', 135, y + 7, {align: 'right'});
    doc.text('Qty', 155, y + 7, {align: 'center'});
    doc.text('Total', 185, y + 7, {align: 'right'});

    y += 10;

    // Table Body
    for (const item of invoiceData.items) {
      const rowHeight = 20;
      const textY = y + (rowHeight / 2) - 2; // Center text vertically
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, y, 180, rowHeight, 'S');

      const imageBase64 = await getImageAsBase64(item.product_image || null);
      if (imageBase64) {
        doc.addImage(imageBase64, 'PNG', 17, y + 2, 16, 16);
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(item.product_name || 'N/A', 35, textY);
      
      // Variant
      const variantText = `${item.size || 'N/A'}`;
      doc.text(variantText, 85, textY);

      if (item.color && item.color.startsWith('#')) {
        try {
          doc.setFillColor(item.color);
          doc.circle(87, textY + 4, 3, 'F'); // Draw circle below size
          doc.text(item.color, 92, textY + 5);
        } catch(e) {
          console.error("Failed to draw color circle:", e);
          doc.text(item.color, 85, textY + 5); // fallback for color text
        }
      } else if (item.color) {
        doc.text(item.color, 85, textY + 5);
      }

      doc.text(formatCurrency(item.unit_price), 135, textY, {align: 'right'});
      doc.text(String(item.quantity || 0), 155, textY, {align: 'center'});
      doc.text(formatCurrency(item.total_price), 185, textY, {align: 'right'});

      y += rowHeight;
    }

    // 5. Summary Section
    y += 10;
    const summaryX = 140;
    const summaryItems = [
      { label: 'Subtotal:', value: formatCurrency(invoiceData.subtotal) },
      { label: 'Shipping:', value: formatCurrency(invoiceData.shippingCost) }
    ];

    if (invoiceData.discountAmount > 0) {
      summaryItems.push({
        label: 'Discount:',
        value: `-${formatCurrency(invoiceData.discountAmount)}`
      });
    }

    // Draw summary box
    const summaryHeight = (summaryItems.length + 1) * 8 + 10;
    doc.setFillColor(250, 250, 250);
    doc.rect(summaryX - 5, y, 60, summaryHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(summaryX - 5, y, 60, summaryHeight, 'S');

    // Add summary items
    summaryItems.forEach((item, index) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(item.label, summaryX, y + 8 + (index * 8));
      doc.text(item.value, 195, y + 8 + (index * 8), { align: 'right' });
    });

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', summaryX, y + 8 + (summaryItems.length * 8));
    doc.text(formatCurrency(invoiceData.totalAmount), 195, y + 8 + (summaryItems.length * 8), { align: 'right' });

    // 6. Footer
    const footerY = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for shopping with Bakwas!', doc.internal.pageSize.width / 2, footerY, {
      align: 'center'
    });

    return doc;
  } catch (error) {
    const err = error as Error;
    console.error('Error generating invoice:', err);
    throw new Error(`Failed to generate invoice: ${err.message}`);
  }
};

export const downloadInvoice = async (invoiceData: InvoiceData): Promise<void> => {
  try {
    const doc = await generateInvoice(invoiceData);
    const fileName = `invoice-${invoiceData.orderNumber}-${Date.now()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    const err = error as Error;
    console.error('Failed to generate invoice PDF:', err);
    throw new Error(`Failed to download invoice: ${err.message}`);
  }
}; 