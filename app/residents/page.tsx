'use client';

import { useState } from 'react';
import useRoomStore from '@/store/roomStore';
import { GIR_DESCRIPTIONS, Resident, Stay } from '@/types/room';

interface NewResidentModalProps {
  onClose: () => void;
}

const NewResidentModal = ({ onClose }: NewResidentModalProps) => {
  const { addResident } = useRoomStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addResident({
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      notes: formData.notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h2 className="text-xl font-bold mb-4">Nouveau résident</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de naissance
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ResidentsPage() {
  const { stays, residents, getResidentById } = useRoomStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewResidentModal, setShowNewResidentModal] = useState(false);

  // Récupérer les séjours actifs
  const activeStays = stays.filter(stay => !stay.endDate);
  const activeStaysByResidentId = new Map(
    activeStays.map(stay => [stay.residentId, stay])
  );

  // Filtrer les résidents selon la recherche
  const filteredResidents = residents.filter((resident) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      resident.firstName.toLowerCase().includes(searchLower) ||
      resident.lastName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des résidents
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher un résident..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowNewResidentModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Nouveau résident
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredResidents.map((resident) => {
            const activeStay = activeStaysByResidentId.get(resident.id);
            return (
              <li key={resident.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {resident.firstName} {resident.lastName}
                      </p>
                      {activeStay && (
                        <p className="mt-1 text-sm text-gray-500">
                          GIR {activeStay.girLevel} - {GIR_DESCRIPTIONS[activeStay.girLevel].autonomyLevel}
                        </p>
                      )}
                      {resident.dateOfBirth && (
                        <p className="mt-1 text-sm text-gray-500">
                          Né(e) le {new Date(resident.dateOfBirth).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {activeStay ? (
                        <p className="text-sm text-gray-500">
                          En séjour depuis le {new Date(activeStay.startDate).toLocaleDateString()}
                        </p>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Sans séjour actif
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {resident.notes && (
                      <p className="text-sm text-gray-500">{resident.notes}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {showNewResidentModal && (
        <NewResidentModal onClose={() => setShowNewResidentModal(false)} />
      )}
    </div>
  );
} 