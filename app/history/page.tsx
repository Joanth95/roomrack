import StayHistory from '@/components/StayHistory';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Historique des séjours
      </h1>
      <StayHistory />
    </div>
  );
} 