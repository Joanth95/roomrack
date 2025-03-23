'use client';

import { useMemo } from 'react';
import useRoomStore from '../store/roomStore';
import { Room } from '../types/room';

interface StayHistoryProps {
  room?: Room;  // Si non fourni, affiche l'historique complet
}

const StayHistory = ({ room }: StayHistoryProps) => {
  const { stays, getResidentById, getRoomById } = useRoomStore();

  const filteredStays = useMemo(() => {
    let staysToShow = [...stays].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    if (room) {
      staysToShow = staysToShow.filter(stay => stay.roomId === room.id);
    }

    return staysToShow.map(stay => ({
      ...stay,
      resident: getResidentById(stay.residentId),
      room: getRoomById(stay.roomId)
    }));
  }, [stays, room, getResidentById, getRoomById]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {room ? `Historique des séjours - Chambre ${room.number}` : 'Historique complet des séjours'}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {!room && (
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chambre
                </th>
              )}
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Résident
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'entrée
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de sortie
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Niveau de soins
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStays.map((stay) => {
              const startDate = new Date(stay.startDate);
              const endDate = stay.endDate ? new Date(stay.endDate) : new Date();
              const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <tr key={stay.id}>
                  {!room && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stay.room?.number} ({stay.room?.sector.replace('_', ' ')})
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stay.resident?.firstName} {stay.resident?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {startDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stay.endDate ? new Date(stay.endDate).toLocaleDateString() : 'En cours'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stay.careLevel === 'low' ? 'Faible' :
                     stay.careLevel === 'medium' ? 'Moyen' : 'Élevé'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {durationDays} jour{durationDays > 1 ? 's' : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StayHistory; 