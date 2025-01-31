interface PricingProps {
    pricing: {
      type: 'free' | 'paid';
      amount: number;
    };
    onTypeChange: (type: 'free' | 'paid') => void;
    onAmountChange: (amount: number) => void;
  }
  
  export const PricingSection = ({ pricing, onTypeChange, onAmountChange }: PricingProps) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pricing</h2>
      
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={pricing.type === 'free'}
            onChange={() => onTypeChange('free')}
          />
          Free
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={pricing.type === 'paid'}
            onChange={() => onTypeChange('paid')}
          />
          Paid
        </label>
      </div>
  
      {pricing.type === 'paid' && (
        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            value={pricing.amount || ""}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      )}
    </div>
  );