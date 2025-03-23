'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useRoomStore from '@/store/roomStore';
import { GIR_DESCRIPTIONS, GIRLevel, StayType } from '@/types/room';

export default function NewStayPage() {
  const router = useRouter();
  const { rooms, residents, createStay, addResident } = useRoomStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedResidentId, setSelectedResidentId] = useState<'new' | number>('new');

  // État du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    notes: '',
    roomId: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    girLevel: 4 as GIRLevel,
    stayNotes: '',
    stayType: 'temporary' as StayType
  });

  // Filtrer les chambres disponibles
  const availableRooms = rooms
    .filter(room => room.status === 'vacant')
    .sort((a, b) => {
      // D'abord trier par secteur
      if (a.sector !== b.sector) {
        return a.sector.localeCompare(b.sector);
      }
      // Ensuite trier par numéro de chambre
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    });

  // Validation du formulaire
  const validateForm = () => {
    if (formData.stayType === 'temporary' && !formData.endDate) {
      alert('La date de fin est obligatoire pour un séjour temporaire');
      return false;
    }
    return true;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }

    if (!validateForm()) {
      return;
    }

    let residentId: number;
    if (selectedResidentId === 'new') {
      // Créer le résident
      const residentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        notes: formData.notes
      };
      addResident(residentData);
      residentId = Math.max(...useRoomStore.getState().residents.map(r => r.id)) + 1;
    } else {
      residentId = selectedResidentId;
    }

    // Créer le séjour
    createStay({
      residentId,
      roomId: formData.roomId,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      girLevel: formData.girLevel,
      notes: formData.stayNotes,
      stayType: formData.stayType
    });

    // Rediriger vers la liste des séjours
    router.push('/stays');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nouveau séjour</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 1 ? 'text-indigo-600' : 'text-gray-500'}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 1 ? 'border-indigo-600' : 'border-gray-300'
              }`}>
                1
              </span>
              <span className="ml-2 font-medium">Informations du résident</span>
            </div>
            <div className="flex-1 h-px bg-gray-300" />
            <div className={`flex items-center ${step === 2 ? 'text-indigo-600' : 'text-gray-500'}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 2 ? 'border-indigo-600' : 'border-gray-300'
              }`}>
                2
              </span>
              <span className="ml-2 font-medium">Détails du séjour</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sélectionner un résident
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
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={formData.firstName}
                        onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={formData.lastName}
                        onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.dateOfBirth}
                      onChange={e => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.notes}
                      onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                  Chambre
                </label>
                <select
                  id="roomId"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.roomId || ''}
                  onChange={e => setFormData(prev => ({ ...prev, roomId: parseInt(e.target.value) }))}
                >
                  <option value="">Sélectionner une chambre</option>
                  {availableRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.number} ({room.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Date d'entrée
                </label>
                <input
                  type="date"
                  id="startDate"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type de séjour
                </label>
                <select
                  value={formData.stayType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    stayType: e.target.value as StayType,
                    endDate: e.target.value === 'permanent' ? '' : prev.endDate
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="temporary">Temporaire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>

              {formData.stayType === 'temporary' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date de fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="girLevel" className="block text-sm font-medium text-gray-700">
                  Niveau GIR
                </label>
                <select
                  id="girLevel"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.girLevel}
                  onChange={e => setFormData(prev => ({ ...prev, girLevel: parseInt(e.target.value) as GIRLevel }))}
                >
                  {Object.entries(GIR_DESCRIPTIONS).map(([level, desc]) => (
                    <option key={level} value={level}>
                      GIR {level} - {desc.autonomyLevel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="stayNotes" className="block text-sm font-medium text-gray-700">
                  Notes du séjour
                </label>
                <textarea
                  id="stayNotes"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.stayNotes}
                  onChange={e => setFormData(prev => ({ ...prev, stayNotes: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Retour
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700"
            >
              {step === 1 ? 'Suivant' : 'Créer le séjour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 