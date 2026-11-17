export type PaintingStatus = "available" | "reserved" | "sold";
export type OrderStatus = "new" | "confirmed" | "delivered" | "cancelled";
export type CommissionStatus = "new" | "in_discussion" | "accepted" | "declined" | "completed";

export interface PaintingImage {
  url: string;
  alt: string;
  /** Storage path inside the "paintings" bucket (empty for sample images). */
  path?: string;
}

export interface Painting {
  id: string;
  slug: string;
  title: string;
  description: string;
  medium: string;
  width_cm: number | null;
  height_cm: number | null;
  year: number | null;
  price_usd: number;
  status: PaintingStatus;
  featured: boolean;
  collection: string | null;
  style: string | null;
  colors: string[];
  images: PaintingImage[];
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  painting_id: string | null;
  painting_title: string;
  painting_slug: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  city: string;
  area: string;
  address: string;
  notes: string | null;
  subtotal_usd: number;
  delivery_fee_usd: number;
  total_usd: number;
  payment_method: string;
  payment_status: "unpaid" | "paid";
  status: OrderStatus;
  created_at: string;
  /** The paintings in this order (one or more). */
  items?: OrderItem[];
}

export interface OrderItem {
  painting_id: string | null;
  painting_title: string;
  painting_slug: string | null;
  price_usd: number;
}

export interface Commission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  size: string;
  colors: string | null;
  budget_usd: number | null;
  description: string;
  reference_images: string[];
  status: CommissionStatus;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  painting_slug: string | null;
  handled: boolean;
  created_at: string;
}

export interface SiteSettings {
  delivery_fee_usd: number;
  free_shipping_threshold_usd: number | null;
  whatsapp_number: string;
  notification_email: string;
}
