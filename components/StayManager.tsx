'use client';

import { useState } from 'react';
import useRoomStore from '../store/roomStore';
import { Room, Resident, Stay, CareLevel } from '../types/room';

interface StayManagerProps {
  room: Room;
  onClose: () => void;
}

const StayManager = ({ room, onClose }: StayManagerProps) => {
  const { 
    createStay, 
    endStay, 
    residents, 
    addResident, 
    getActiveStayByRoomId,
    getResidentById
  } = useRoomStore();

  const [newResident, setNewResident] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });

  const [selectedResidentId, setSelectedResidentId] = useState<number | 'new'>('new');
  const [careLevel, setCareLevel] = useState<CareLevel>('low');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const activeStay = getActiveStayByRoomId(room.id);
  const currentResident = activeStay ? getResidentById(activeStay.residentId) : null;

  const handleCreateStay = () => {
    if (selectedResidentId === 'new') {
      // Créer d'abord le nouveau résident
      addResident({
        firstName: newResident.firstName,
        lastName: newResident.lastName,
        dateOfBirth: newResident.dateOfBirth ? new Date(newResident.dateOfBirth) : undefined
      });
    }

    const residentId = selectedResidentId === 'new' 
      ? Math.max(0, ...residents.map(r => r.id)) + 1 
      : selectedResidentId;

    createStay({
      residentId,
      roomId: room.id,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      careLevel,
      notes
    });

    onClose();
  };

  const handleEndStay = () => {
    if (activeStay) {
      endStay(activeStay.id, new Date());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900">
            Gestion du séjour - Chambre {room.number}
          </h3>

          {activeStay ? (
            <div className="mt-4">
              <h4 className="font-medium">Séjour en cours</h4>
              <p>Résident : {currentResident?.firstName} {currentResident?.lastName}</p>
              <p>Début : {new Date(activeStay.startDate).toLocaleDateString()}</p>
              <p>Niveau de soins : {activeStay.careLevel}</p>
              {activeStay.notes && <p>Notes : {activeStay.notes}</p>}
              
              <button
                onClick={handleEndStay}
                className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Terminer le séjour
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Résident
                </label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value === 'new' ? 'new' : Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="new">Nouveau résident</option>
                  {residents.map(resident => (
                    <option key={resident.id} value={resident.id}>
                      {resident.firstName} {resident.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedResidentId === 'new' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={newResident.firstName}
                      onChange={(e) => setNewResident({ ...newResident, firstName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={newResident.lastName}
                      onChange={(e) => setNewResident({ ...newResident, lastName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      value={newResident.dateOfBirth}
                      onChange={(e) => setNewResident({ ...newResident, dateOfBirth: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date d'entrée
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de sortie prévue (optionnel)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Niveau de soins
                </label>
                <select
                  value={careLevel}
                  onChange={(e) => setCareLevel(e.target.value as CareLevel)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyen</option>
                  <option value="high">Élevé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleCreateStay}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Créer le séjour
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default StayManager; 