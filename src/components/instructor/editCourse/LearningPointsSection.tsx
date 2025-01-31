import { Trash2, Plus } from 'lucide-react';

interface LearningPointsProps {
  points: string[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onDelete: (index: number) => void;
}

export const LearningPointsSection = ({ points, onAdd, onChange, onDelete }: LearningPointsProps) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">What Will Students Learn?</h2>
    
    {points.map((point, index) => (
      <div key={index} className="flex items-center gap-2">
        <input
          value={point}
          onChange={(e) => onChange(index, e.target.value)}
          className="flex-1 p-2 border rounded-md"
          placeholder={`Learning point ${index + 1}`}
        />
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    ))}
    
    <button
      type="button"
      onClick={onAdd}
      className="flex items-center text-indigo-600 hover:text-indigo-700"
    >
      <Plus className="w-5 h-5 mr-1" />
      Add Learning Point
    </button>
  </div>
);