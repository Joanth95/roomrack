'use client';

import { useState } from 'react';
import useRoomStore from '@/store/roomStore';
import { GIR_DESCRIPTIONS, Stay, Resident, GIRLevel, Room } from '@/types/room';

interface ResidentHistoryModalProps {
  resident: Resident;
  stays: Stay[];
  onClose: () => void;
  getRoomById: (id: number) => Room | undefined;
}

function ResidentHistoryModal({ resident, stays, onClose, getRoomById }: ResidentHistoryModalProps) {
  if (!resident) return null;

  // Trier les séjours par date de début décroissante
  const residentStays = stays
    .filter((stay: Stay) => stay.residentId === resident.id)
    .sort((a: Stay, b: Stay) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Historique de {resident.firstName} {resident.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Évolution du GIR</h3>
            <div className="space-y-2">
              {residentStays.map((stay: Stay) => (
                <div key={stay.id} className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {new Date(stay.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      GIR {stay.girLevel}
                    </div>
                    <div className="text-sm text-gray-500">
                      {GIR_DESCRIPTIONS[stay.girLevel].autonomyLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Historique des séjours</h3>
            <div className="space-y-4">
              {residentStays.map((stay: Stay) => {
                const room = getRoomById(stay.roomId);
                return (
                  <div key={stay.id} className="border rounded p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Chambre</div>
                        <div>{room?.number} ({room?.sector})</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Type</div>
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          stay.stayType === 'temporary' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {stay.stayType === 'temporary' ? 'Temporaire' : 'Permanent'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Début</div>
                        <div>{new Date(stay.startDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Fin</div>
                        <div>{stay.endDate ? new Date(stay.endDate).toLocaleDateString() : 'En cours'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StayHistoryPage() {
  const { stays, getResidentById, getRoomById } = useRoomStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'temporary' | 'permanent'>('all');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  // Trier les séjours par date de début décroissante
  const sortedStays = [...stays].sort((a: Stay, b: Stay) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Filtrer les séjours
  const filteredStays = sortedStays.filter((stay: Stay) => {
    const resident = getResidentById(stay.residentId);
    const room = getRoomById(stay.roomId);
    
    if (!resident || !room) return false;

    // Filtre de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchResident = 
        resident.firstName.toLowerCase().includes(searchLower) ||
        resident.lastName.toLowerCase().includes(searchLower);
      const matchRoom = room.number.toLowerCase().includes(searchLower);
      if (!matchResident && !matchRoom) return false;
    }

    // Filtre de statut
    if (statusFilter === 'active' && stay.endDate) return false;
    if (statusFilter === 'ended' && !stay.endDate) return false;

    // Filtre de type
    if (typeFilter !== 'all' && stay.stayType !== typeFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Historique des séjours
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un résident ou une chambre..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'ended')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les séjours</option>
            <option value="active">Séjours en cours</option>
            <option value="ended">Séjours terminés</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'temporary' | 'permanent')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les types</option>
            <option value="temporary">Temporaire</option>
            <option value="permanent">Permanent</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Résident
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chambre
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GIR
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Début
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fin
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStays.map((stay: Stay) => {
              const resident = getResidentById(stay.residentId);
              const room = getRoomById(stay.roomId);
              if (!resident || !room) return null;

              return (
                <tr key={stay.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                      onClick={() => setSelectedResident(resident)}
                      className="hover:text-indigo-600 hover:underline focus:outline-none"
                    >
                      {resident.firstName} {resident.lastName}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.number} ({room.sector})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      stay.stayType === 'temporary' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {stay.stayType === 'temporary' ? 'Temporaire' : 'Permanent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span title={GIR_DESCRIPTIONS[stay.girLevel].autonomyLevel}>
                      GIR {stay.girLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(stay.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stay.endDate ? new Date(stay.endDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      stay.endDate && new Date(stay.endDate) <= new Date() ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {stay.endDate && new Date(stay.endDate) <= new Date() ? 'Terminé' : 'En cours'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedResident && (
        <ResidentHistoryModal
          resident={selectedResident}
          stays={stays}
          getRoomById={getRoomById}
          onClose={() => setSelectedResident(null)}
        />
      )}
    </div>
  );
} 