 import { ReactNode } from "react";

export interface PaymentItem {
  _id?: string;
  id?: string;
  month?: string;
  purpose?: string;
  title?: string;
  amount: number | string;
  status?: "approved" | "paid" | "pending" | "rejected" | string;
  method?: string;
  paymentMethod?: string;
  transactionId?: string;
  trxId?: string;
  date?: string;
  note?: string;
}

export interface PaymentsTabProps {
  dataWarning?: ReactNode;
  myPayments?: PaymentItem[];
}