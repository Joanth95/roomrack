'use client';

import { useMemo } from 'react';
import useRoomStore from '../store/roomStore';
import { GIRLevel, GIR_DESCRIPTIONS, Room, Sector, Stay } from '../types/room';

const SECTORS: Sector[] = ['UP1', 'UP2', 'AILE_A', 'AILE_B', 'AILE_C', 'AILE_D'];

const StayStats = () => {
  const { stays, rooms } = useRoomStore();

  const stats = useMemo(() => {
    const now = new Date();
    const activeStays = stays.filter(s => !s.endDate);
    const completedStays = stays.filter(s => s.endDate);

    // Calcul de la durée moyenne des séjours terminés
    const averageDuration = completedStays.length > 0
      ? completedStays.reduce((acc, stay) => {
          const duration = new Date(stay.endDate!).getTime() - new Date(stay.startDate).getTime();
          return acc + duration;
        }, 0) / completedStays.length / (1000 * 60 * 60 * 24)
      : 0;

    // Statistiques par secteur
    const sectorStats = SECTORS.reduce((acc, sector) => {
      const sectorRooms = rooms.filter(r => r.sector === sector);
      const sectorStays = stays.filter(s => 
        sectorRooms.some(r => r.id === s.roomId)
      );
      
      const activeStaysCount = sectorStays.filter(s => !s.endDate).length;
      const totalStaysCount = sectorStays.length;
      
      // Calcul du GIR moyen du secteur
      const activeGIRSum = sectorStays
        .filter(s => !s.endDate)
        .reduce((sum, stay) => sum + stay.girLevel, 0);
      
      acc[sector] = {
        activeStays: activeStaysCount,
        totalStays: totalStaysCount,
        occupancyRate: sectorRooms.length > 0 ? (activeStaysCount / sectorRooms.length) * 100 : 0,
        averageGIR: activeStaysCount > 0 ? activeGIRSum / activeStaysCount : 0
      };
      
      return acc;
    }, {} as Record<Sector, { 
      activeStays: number; 
      totalStays: number; 
      occupancyRate: number;
      averageGIR: number;
    }>);

    // Distribution des GIR
    const girDistribution = stays.reduce((acc, stay) => {
      acc[stay.girLevel] = (acc[stay.girLevel] || 0) + 1;
      return acc;
    }, {} as Record<GIRLevel, number>);

    // Calcul du GMP (GIR Moyen Pondéré)
    const gmpPoints = {
      1: 1000,
      2: 840,
      3: 660,
      4: 420,
      5: 250,
      6: 70
    };

    const activeGirSum = activeStays.reduce((sum, stay) => {
      return sum + (gmpPoints[stay.girLevel as keyof typeof gmpPoints] || 0);
    }, 0);

    const gmp = activeStays.length > 0 ? activeGirSum / activeStays.length : 0;

    return {
      totalStays: stays.length,
      activeStays: activeStays.length,
      averageDuration,
      sectorStats,
      girDistribution,
      gmp
    };
  }, [stays, rooms]);

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques globales</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Séjours totaux</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.totalStays}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Séjours en cours</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.activeStays}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Durée moyenne</p>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.averageDuration.toFixed(1)} jours
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">GMP</p>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.gmp.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques par secteur */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques par secteur</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secteur
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Séjours en cours
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total séjours
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux d'occupation
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GIR Moyen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Object.entries(stats.sectorStats) as [Sector, { 
                activeStays: number; 
                totalStays: number; 
                occupancyRate: number;
                averageGIR: number;
              }][]).map(([sector, data]) => (
                <tr key={sector}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sector.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.activeStays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.totalStays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.occupancyRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.averageGIR.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution des GIR */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Distribution des GIR</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {([1, 2, 3, 4, 5, 6] as GIRLevel[]).map((level) => (
            <div key={level} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-900">GIR {level}</p>
                <p className={`text-2xl font-bold ${
                  level <= 2 ? 'text-red-600' : 
                  level <= 4 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {stats.girDistribution[level] || 0}
                </p>
              </div>
              <p className="text-xs text-gray-500">{GIR_DESCRIPTIONS[level].autonomyLevel}</p>
              <p className="text-xs text-gray-500 mt-1">{GIR_DESCRIPTIONS[level].description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StayStats; 