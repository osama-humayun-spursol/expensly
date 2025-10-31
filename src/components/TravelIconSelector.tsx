import React from 'react';
type TravelIconKey = 'plane' | 'train' | 'bike' | 'car';

type Props = {
  value: TravelIconKey;
  onChange: (key: TravelIconKey) => void;
};

function PlaneIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 16l20-8-9 4-4 4-7 0z" fill="currentColor" />
    </svg>
  );
}
function TrainIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="8" cy="18" r="1" fill="currentColor" />
      <circle cx="16" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}
function BikeIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6 16L10 8L14 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function CarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="18" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="7" cy="17" r="1" fill="currentColor" />
      <circle cx="17" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

const options: { key: TravelIconKey; label: string; Icon: any }[] = [
  { key: 'car', label: 'Car', Icon: CarIcon },
  { key: 'bike', label: 'Bike', Icon: BikeIcon },
  { key: 'train', label: 'Train', Icon: TrainIcon },
  { key: 'plane', label: 'Plane', Icon: PlaneIcon },
];

export function TravelIconSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 mt-2">
      {options.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
            value === key
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500 shadow-sm'
              : 'bg-white border-gray-200'
          }` }
          aria-pressed={value === key}
        >
          <Icon className="w-4 h-4 text-gray-700" />
          <span className="text-sm text-gray-700 hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

export type { TravelIconKey };
