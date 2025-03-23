'use client';

import { useState } from 'react';
import useRoomStore from '@/store/roomStore';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GIRLevel, StayType } from '@/types/room';

interface NewStayModalProps {
  roomId: number;
  startDate: Date;
  onClose: () => void;
}

const NewStayModal = ({ roomId, startDate, onClose }: NewStayModalProps) => {
  const { residents, createStay, addResident } = useRoomStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    notes: '',
    stayType: 'temporary' as StayType,
    endDate: '',
    girLevel: 4 as GIRLevel,
    selectedResidentId: 'new' as string | 'new'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let residentId: number;
    if (formData.selectedResidentId === 'new') {
      // Créer un nouveau résident
      addResident({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        notes: formData.notes
      });
      residentId = Math.max(0, ...residents.map(r => r.id)) + 1;
    } else {
      residentId = parseInt(formData.selectedResidentId);
    }

    // Créer le séjour
    createStay({
      residentId,
      roomId,
      startDate,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      girLevel: formData.girLevel,
      stayType: formData.stayType
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h2 className="text-xl font-bold mb-4">Nouveau séjour</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Résident
            </label>
            <select
              value={formData.selectedResidentId}
              onChange={(e) => setFormData(prev => ({ ...prev, selectedResidentId: e.target.value }))}
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

          {formData.selectedResidentId === 'new' && (
            <>
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
            </>
          )}

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
            <label className="block text-sm font-medium text-gray-700">
              Niveau GIR
            </label>
            <select
              value={formData.girLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, girLevel: parseInt(e.target.value) as GIRLevel }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6].map(level => (
                <option key={level} value={level}>
                  GIR {level}
                </option>
              ))}
            </select>
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

interface StayDetailsModalProps {
  stay: any;
  onClose: () => void;
}

const StayDetailsModal = ({ stay, onClose }: StayDetailsModalProps) => {
  const { getResidentById } = useRoomStore();
  const resident = getResidentById(stay.residentId);

  if (!resident) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h2 className="text-xl font-bold mb-4">Détails du séjour</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Résident</p>
            <p className="text-lg">{resident.firstName} {resident.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Type de séjour</p>
            <p className="text-lg">{stay.stayType === 'temporary' ? 'Temporaire' : 'Permanent'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date d'entrée</p>
            <p className="text-lg">{new Date(stay.startDate).toLocaleDateString()}</p>
          </div>
          {stay.endDate && (
            <div>
              <p className="text-sm font-medium text-gray-500">Date de fin</p>
              <p className="text-lg">{new Date(stay.endDate).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">Niveau GIR</p>
            <p className="text-lg">GIR {stay.girLevel}</p>
          </div>
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PlanningPage() {
  const { rooms, stays, getResidentById } = useRoomStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStay, setSelectedStay] = useState<any | null>(null);

  // Générer les dates de la semaine
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

  // Préparer les données du planning
  const planningData = rooms.map(room => {
    const roomStays = stays.filter(stay => stay.roomId === room.id);
    const occupancyData = weekDates.map(date => {
      const stayOnDate = roomStays.find(stay => {
        const startDate = new Date(stay.startDate);
        const endDate = stay.endDate ? new Date(stay.endDate) : new Date();
        return date >= startDate && date <= endDate;
      });
      const resident = stayOnDate ? getResidentById(stayOnDate.residentId) : null;
      return {
        date,
        isOccupied: !!stayOnDate,
        stay: stayOnDate,
        resident
      };
    });

    return {
      room,
      occupancy: occupancyData
    };
  });

  const handleCellClick = (room: any, date: Date, stay: any) => {
    if (stay) {
      setSelectedStay(stay);
    } else {
      setSelectedRoom(room.id);
      setSelectedDate(date);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Planning des chambres</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentDate(addDays(weekStart, -14))}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← 2 semaines
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setCurrentDate(addDays(weekStart, 14))}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            2 semaines →
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white z-10 border-r">
                  Chambre
                </th>
                {weekDates.map(date => (
                  <th
                    key={date.toISOString()}
                    className={`px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] ${
                      isSameDay(date, new Date()) ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div>{format(date, 'EEEE', { locale: fr })}</div>
                    <div>{format(date, 'd MMM', { locale: fr })}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {planningData.map(({ room, occupancy }) => (
                <tr key={room.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white border-r">
                    {room.number} ({room.sector})
                  </td>
                  {occupancy.map(({ date, isOccupied, stay, resident }) => (
                    <td
                      key={date.toISOString()}
                      onClick={() => handleCellClick(room, date, stay)}
                      className={`px-6 py-4 text-center text-sm ${
                        isSameDay(date, new Date()) ? 'bg-indigo-50' : ''
                      } cursor-pointer hover:bg-gray-50`}
                    >
                      <div
                        className={`min-h-[2.5rem] p-1 rounded ${
                          isOccupied
                            ? 'bg-red-100 border border-red-200 hover:bg-red-200'
                            : 'bg-green-100 border border-green-200 hover:bg-green-200'
                        }`}
                        title={
                          stay
                            ? `${resident?.firstName} ${resident?.lastName} - GIR ${stay.girLevel}`
                            : 'Disponible - Cliquer pour créer un séjour'
                        }
                      >
                        {isOccupied && resident && (
                          <div className="text-xs text-gray-600 truncate">
                            {resident.firstName}<br/>{resident.lastName}
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRoom && selectedDate && (
        <NewStayModal
          roomId={selectedRoom}
          startDate={selectedDate}
          onClose={() => {
            setSelectedRoom(null);
            setSelectedDate(null);
          }}
        />
      )}

      {selectedStay && (
        <StayDetailsModal
          stay={selectedStay}
          onClose={() => setSelectedStay(null)}
        />
      )}
    </div>
  );
} 