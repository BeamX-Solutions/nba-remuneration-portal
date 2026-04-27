export interface PortalDocument {
  id: string;
  user_id: string;
  title: string;
  document_type: string;
  content: string | null;
  form_data: Record<string, string> | null;
  status: "draft" | "completed";
  approval_status: "pending" | "submitted" | "approved" | "rejected" | null;
  reference_number: string | null;
  ban: string | null;
  rejection_reason: string | null;
  approver_comments: string | null;
  created_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
}

export interface MemberProfile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  surname: string | null;
  middle_name: string | null;
  ban: string | null;
  year_of_call: string | null;
  branch: string | null;
  phone: string | null;
  office_address: string | null;
  status: "pending" | "active" | "suspended" | null;
  is_admin: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Payment {
  id: string;
  document_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  reference: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  published: boolean;
  portal: string | null;
  created_at: string;
  created_by: string | null;
}
