import StayStats from '@/components/StayStats';
import CareStats from '@/components/CareStats';

export default function GirStatsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Statistiques GIR détaillées
      </h1>
      <StayStats />
      <CareStats />
    </div>
  );
} 