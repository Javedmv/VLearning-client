export interface Banner {
    _id?: string;
    title: string;
    status: boolean;
    type: 'promotional' | 'announcement' | 'sale';
    imageUrl: File | string;
    description?: string;
  }

