/**
 * Shared TypeScript interfaces for Sapientia data models.
 * These use index signatures to stay compatible with component-local types.
 */

export interface Order {
  orderId: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: "Processing" | "Shipped" | "Delivered" | "Canceled";
  items?: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
  [key: string]: unknown;
}

export interface InventoryItem {
  id: string;
  price_thb: number;
  status: string;
  stock_level: number;
  last_restocked?: string;
  Brand?: string;
  Model?: string;
  [key: string]: unknown;
}

export interface Camera {
  Brand: string;
  Model: string;
  Year?: string;
  image_file?: string | null;
  [key: string]: unknown;
}
