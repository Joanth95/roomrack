'use client';

import { useState } from 'react';
import useRoomStore from '@/store/roomStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

export default function RoomRackPage() {
  const { rooms, stays, getResidentById } = useRoomStore();
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // Obtenir la liste unique des secteurs
  const sectors = Array.from(new Set(rooms.map(room => room.sector)));

  // Obtenir le séjour actuel pour une chambre
  const getCurrentStay = (roomId: number) => {
    return stays.find(stay => stay.roomId === roomId && !stay.endDate);
  };

  // Filtrer les chambres par secteur
  const filteredRooms = rooms
    .filter(room => selectedSector === 'all' || room.sector === selectedSector)
    .sort((a, b) => a.number.localeCompare(b.number));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Room-Rack</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les secteurs</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map(room => {
          const currentStay = getCurrentStay(room.id);
          const resident = currentStay ? getResidentById(currentStay.residentId) : null;

          return (
            <div key={room.id} className={`bg-white rounded-lg shadow overflow-hidden ${
              currentStay ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-300'
            }`}>
              <div className="px-6 py-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Chambre {room.number}
                    </h2>
                    <p className="text-sm text-gray-500">{room.sector}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    currentStay ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentStay ? 'Occupée' : 'Disponible'}
                  </div>
                </div>

                {resident ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Résident</div>
                      <div className="mt-1">
                        <div className="font-medium text-gray-900">
                          {resident.firstName} {resident.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {resident.dateOfBirth && format(new Date(resident.dateOfBirth), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>

                    {currentStay && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-gray-500">Type de séjour</div>
                            <div className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              currentStay.stayType === 'temporary' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {currentStay.stayType === 'temporary' ? 'Temporaire' : 'Permanent'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">GIR</div>
                            <div className="mt-1 text-gray-900">
                              Niveau {currentStay.girLevel}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-500">Date d'entrée</div>
                          <div className="mt-1 text-gray-900">
                            {format(new Date(currentStay.startDate), 'dd MMMM yyyy', { locale: fr })}
                          </div>
                        </div>

                        {currentStay.notes && (
                          <div>
                            <div className="text-sm font-medium text-gray-500">Notes</div>
                            <div className="mt-1 text-sm text-gray-600">
                              {currentStay.notes}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <Link
                      href={`/stays/new?roomId=${room.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Nouveau séjour
                    </Link>
                  </div>
                )}
              </div>

              {resident && (
                <div className="px-6 py-3 bg-gray-50 flex justify-end">
                  <Link
                    href={`/stays/history?residentId=${resident.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Voir l'historique
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 