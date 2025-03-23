'use client';

import { useMemo } from 'react';
import useRoomStore from '../store/roomStore';
import { GIRLevel, GIR_DESCRIPTIONS, Sector } from '../types/room';

const SECTORS: Sector[] = ['UP1', 'UP2', 'AILE_A', 'AILE_B', 'AILE_C', 'AILE_D'];

const CareStats = () => {
  const { stays, rooms } = useRoomStore();

  const stats = useMemo(() => {
    const activeStays = stays.filter(s => !s.endDate);

    // Calcul des statistiques par secteur
    const sectorStats = SECTORS.reduce((acc, sector) => {
      const sectorRooms = rooms.filter(r => r.sector === sector);
      const sectorStays = activeStays.filter(s => 
        sectorRooms.some(r => r.id === s.roomId)
      );

      // Calcul du GMP pour le secteur
      const gmpPoints = {
        1: 1000,
        2: 840,
        3: 660,
        4: 420,
        5: 250,
        6: 70
      };

      const girSum = sectorStays.reduce((sum, stay) => {
        return sum + (gmpPoints[stay.girLevel as keyof typeof gmpPoints] || 0);
      }, 0);

      const gmp = sectorStays.length > 0 ? girSum / sectorStays.length : 0;

      // Distribution des GIR dans le secteur
      const girDistribution = sectorStays.reduce((dist, stay) => {
        dist[stay.girLevel] = (dist[stay.girLevel] || 0) + 1;
        return dist;
      }, {} as Record<GIRLevel, number>);

      acc[sector] = {
        gmp,
        girDistribution,
        totalResidents: sectorStays.length
      };

      return acc;
    }, {} as Record<Sector, {
      gmp: number;
      girDistribution: Record<GIRLevel, number>;
      totalResidents: number;
    }>);

    return {
      sectorStats
    };
  }, [stays, rooms]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Charge en soins par secteur</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTORS.map(sector => {
          const sectorData = stats.sectorStats[sector];
          if (!sectorData) return null;

          return (
            <div key={sector} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {sector.replace('_', ' ')}
                </h3>
                <div className="text-right">
                  <p className="text-sm text-gray-500">GMP</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {sectorData.gmp.toFixed(0)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {([1, 2, 3, 4, 5, 6] as GIRLevel[]).map(gir => (
                  <div key={gir} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        GIR {gir}
                      </p>
                      <p className="text-xs text-gray-500">
                        {GIR_DESCRIPTIONS[gir].autonomyLevel}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      gir <= 2 ? 'bg-red-100 text-red-800' :
                      gir <= 4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {sectorData.girDistribution[gir] || 0}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Total résidents</p>
                  <p className="text-sm font-medium text-gray-900">
                    {sectorData.totalResidents}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CareStats; 