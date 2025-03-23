'use client';

import { useState } from 'react';
import { Room, RoomStatus } from '../types/room';
import useRoomStore from '../store/roomStore';
import StayManager from './StayManager';

interface RoomDetailsProps {
  room: Room;
  onClose: () => void;
}

const RoomDetails = ({ room, onClose }: RoomDetailsProps) => {
  const { updateRoomStatus, updateRoomNotes, getActiveStayByRoomId, getResidentById } = useRoomStore();
  const [notes, setNotes] = useState(room.notes || '');
  const [showStayManager, setShowStayManager] = useState(false);

  const activeStay = getActiveStayByRoomId(room.id);
  const currentResident = activeStay ? getResidentById(activeStay.residentId) : null;

  const handleStatusChange = (status: RoomStatus) => {
    updateRoomStatus(room.id, status);
  };

  const handleNotesChange = () => {
    updateRoomNotes(room.id, notes);
  };

  if (showStayManager) {
    return <StayManager room={room} onClose={() => setShowStayManager(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900">
            Chambre {room.number} - {room.sector.replace('_', ' ')}
          </h3>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleStatusChange('vacant')}
                className={`px-3 py-1 rounded ${
                  room.status === 'vacant'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Libre
              </button>
              <button
                onClick={() => handleStatusChange('occupied')}
                className={`px-3 py-1 rounded ${
                  room.status === 'occupied'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Occupée
              </button>
              <button
                onClick={() => handleStatusChange('maintenance')}
                className={`px-3 py-1 rounded ${
                  room.status === 'maintenance'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Travaux
              </button>
            </div>
          </div>

          {/* Informations sur le séjour en cours */}
          {activeStay && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h4 className="font-medium">Séjour en cours</h4>
              <p>Résident : {currentResident?.firstName} {currentResident?.lastName}</p>
              <p>Début : {new Date(activeStay.startDate).toLocaleDateString()}</p>
              <p>Niveau de soins : {
                activeStay.careLevel === 'low' ? 'Faible' :
                activeStay.careLevel === 'medium' ? 'Moyen' : 'Élevé'
              }</p>
              {activeStay.notes && <p>Notes : {activeStay.notes}</p>}
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={() => setShowStayManager(true)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {activeStay ? 'Gérer le séjour' : 'Nouveau séjour'}
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
            <button
              onClick={handleNotesChange}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Sauvegarder les notes
            </button>
          </div>

          <div className="mt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails; 