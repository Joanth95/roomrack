'use client';

import { useState } from 'react';
import useRoomStore from '@/store/roomStore';
import { addDays, format, isAfter, isBefore, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Sector } from '@/types/room';

const sectors: Sector[] = ['UP1', 'UP2', 'AILE_A', 'AILE_B', 'AILE_C', 'AILE_D'];

export default function HomePage() {
  const { rooms, stays, getResidentById } = useRoomStore();
  const today = startOfToday();
  const nextWeek = addDays(today, 7);

  // Statistiques principales
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(room => 
    stays.some(stay => 
      stay.roomId === room.id && 
      !stay.endDate
    )
  ).length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  // Chambres libres par secteur
  const availableRoomsBySector = sectors.reduce((acc, sector) => {
    acc[sector] = rooms.filter(room => 
      room.sector === sector &&
      !stays.some(stay => 
        stay.roomId === room.id && 
        !stay.endDate
      )
    ).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    return acc;
  }, {} as Record<Sector, typeof rooms>);

  // Sorties prévues dans la semaine
  const upcomingDepartures = stays
    .filter(stay => 
      stay.endDate && 
      isAfter(new Date(stay.endDate), today) &&
      isBefore(new Date(stay.endDate), nextWeek)
    )
    .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime());

  // Admissions prévues dans la semaine
  const upcomingArrivals = stays
    .filter(stay => 
      isAfter(new Date(stay.startDate), today) &&
      isBefore(new Date(stay.startDate), nextWeek)
    )
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Tableau de bord
      </h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Taux d'occupation</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-4xl font-semibold text-gray-900">{occupancyRate}%</div>
            <div className="ml-2 text-sm text-gray-500">({occupiedRooms}/{totalRooms} chambres)</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Départs cette semaine</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-4xl font-semibold text-gray-900">{upcomingDepartures.length}</div>
            <div className="ml-2 text-sm text-gray-500">résidents</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Arrivées cette semaine</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-4xl font-semibold text-gray-900">{upcomingArrivals.length}</div>
            <div className="ml-2 text-sm text-gray-500">résidents</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chambres disponibles */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Chambres disponibles
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {sectors.map(sector => {
              const sectorRooms = availableRoomsBySector[sector];
              if (sectorRooms.length === 0) return null;

              return (
                <div key={sector} className="px-6 py-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {sector.replace('_', ' ')}
                  </h3>
                  <div className="space-y-3">
                    {sectorRooms.map(room => (
                      <div key={room.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <div className="font-medium">Chambre {room.number}</div>
                          <div className="text-sm text-gray-500">{room.sector.replace('_', ' ')}</div>
                        </div>
                        <Link
                          href={`/stays/new?roomId=${room.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Nouveau séjour
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {Object.values(availableRoomsBySector).every(rooms => rooms.length === 0) && (
              <div className="px-6 py-4 text-sm text-gray-500">
                Aucune chambre disponible
              </div>
            )}
          </div>
        </div>

        {/* Mouvements à venir */}
        <div className="space-y-6">
          {/* Départs prévus */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Départs prévus cette semaine
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingDepartures.map(stay => {
                const resident = getResidentById(stay.residentId);
                const room = rooms.find(r => r.id === stay.roomId);
                if (!resident || !room || !stay.endDate) return null;

                return (
                  <div key={stay.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{resident.firstName} {resident.lastName}</div>
                        <div className="text-sm text-gray-500">
                          Chambre {room.number} - Départ le {format(new Date(stay.endDate), 'dd MMMM', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {upcomingDepartures.length === 0 && (
                <div className="px-6 py-4 text-sm text-gray-500">
                  Aucun départ prévu cette semaine
                </div>
              )}
            </div>
          </div>

          {/* Arrivées prévues */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Arrivées prévues cette semaine
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingArrivals.map(stay => {
                const resident = getResidentById(stay.residentId);
                const room = rooms.find(r => r.id === stay.roomId);
                if (!resident || !room) return null;

                return (
                  <div key={stay.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{resident.firstName} {resident.lastName}</div>
                        <div className="text-sm text-gray-500">
                          Chambre {room.number} - Arrivée le {format(new Date(stay.startDate), 'dd MMMM', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {upcomingArrivals.length === 0 && (
                <div className="px-6 py-4 text-sm text-gray-500">
                  Aucune arrivée prévue cette semaine
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
