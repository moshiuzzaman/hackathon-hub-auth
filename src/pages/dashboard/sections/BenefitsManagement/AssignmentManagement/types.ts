export interface User {
  id: string;
  full_name: string | null;
}

export interface Vendor {
  id: string;
  name: string;
}

export interface Benefit {
  id: string;
  vendor_id: string;
  is_assigned: boolean;
  is_active: boolean;
}