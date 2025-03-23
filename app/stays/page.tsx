'use client';

import { useState } from 'react';
import useRoomStore from '@/store/roomStore';
import { GIR_DESCRIPTIONS, StayType } from '@/types/room';
import Link from 'next/link';

export default function StaysPage() {
  const { stays, getResidentById, getRoomById } = useRoomStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('active');
  const [typeFilter, setTypeFilter] = useState<'all' | StayType>('all');

  // Filtrer et trier les séjours
  const filteredStays = stays
    .filter(stay => {
      if (filter === 'active') return !stay.endDate;
      if (filter === 'ended') return !!stay.endDate;
      return true;
    })
    .filter(stay => {
      if (typeFilter === 'all') return true;
      return stay.stayType === typeFilter;
    })
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des séjours</h1>
        <Link
          href="/stays/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700"
        >
          Nouveau séjour
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tous les séjours
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'active'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Séjours en cours
              </button>
              <button
                onClick={() => setFilter('ended')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'ended'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Séjours terminés
              </button>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  typeFilter === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tous les types
              </button>
              <button
                onClick={() => setTypeFilter('temporary')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  typeFilter === 'temporary'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Temporaires
              </button>
              <button
                onClick={() => setTypeFilter('permanent')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  typeFilter === 'permanent'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Permanents
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                  Entrée
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sortie
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GIR
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStays.map(stay => {
                const resident = getResidentById(stay.residentId);
                const room = getRoomById(stay.roomId);
                if (!resident || !room) return null;

                return (
                  <tr key={stay.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {resident.firstName} {resident.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.number} ({room.sector})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stay.stayType === 'temporary'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {stay.stayType === 'temporary' ? 'Temporaire' : 'Permanent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(stay.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stay.endDate ? new Date(stay.endDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stay.girLevel <= 2
                            ? 'bg-red-100 text-red-800'
                            : stay.girLevel <= 4
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        GIR {stay.girLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link
                          href={`/stays/${stay.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Détails
                        </Link>
                        {!stay.endDate && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              // TODO: Implémenter la fin du séjour
                            }}
                          >
                            Terminer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 