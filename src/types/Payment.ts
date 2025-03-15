export interface Payment {
    _id: string;
    paymentIntentId: string;
    chargeId: string;
    checkoutSessionId: string;
    userId: string;
    courseId: string;
    instructorId: string;
    amount: number;
    instructorEarnings?: number;
    adminEarnings?: number;
    currency: string;
    status: string;
    customerEmail: string;
    receiptUrl: string | null;
    errorMessage: string | null;
    failureCode: string | null;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  }