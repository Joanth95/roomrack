'use client';

import { useState } from 'react';
import useRoomStore from '../store/roomStore';
import { Room, Sector, RoomStatus } from '../types/room';

const RoomAdmin = () => {
  const { rooms, addRoom, deleteRoom, updateRoomStatus } = useRoomStore();
  const [newRoom, setNewRoom] = useState({
    number: '',
    sector: 'UP1' as Sector
  });

  const handleAddRoom = () => {
    if (!newRoom.number) return;
    
    const room: Room = {
      id: Math.max(0, ...rooms.map(r => r.id)) + 1,
      number: newRoom.number,
      sector: newRoom.sector,
      status: 'vacant',
      notes: '',
      lastStatusChange: new Date()
    };

    addRoom(room);
    setNewRoom({ number: '', sector: 'UP1' });
  };

  const handleStatusChange = (roomId: number, status: RoomStatus) => {
    updateRoomStatus(roomId, status);
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'vacant':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: RoomStatus) => {
    switch (status) {
      case 'vacant':
        return 'Libre';
      case 'occupied':
        return 'Occupée';
      case 'maintenance':
        return 'En travaux';
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulaire d'ajout */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Ajouter une chambre</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de chambre
            </label>
            <input
              type="text"
              value={newRoom.number}
              onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secteur
            </label>
            <select
              value={newRoom.sector}
              onChange={(e) => setNewRoom({ ...newRoom, sector: e.target.value as Sector })}
              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="UP1">UP1</option>
              <option value="UP2">UP2</option>
              <option value="AILE_A">AILE A</option>
              <option value="AILE_B">AILE B</option>
              <option value="AILE_C">AILE C</option>
              <option value="AILE_D">AILE D</option>
            </select>
          </div>
          <button
            onClick={handleAddRoom}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste des chambres */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Gestion des chambres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(
            rooms.reduce((acc, room) => {
              if (!acc[room.sector]) acc[room.sector] = [];
              acc[room.sector].push(room);
              return acc;
            }, {} as Record<Sector, Room[]>)
          ).map(([sector, sectorRooms]) => (
            <div key={sector} className="border rounded-lg p-4">
              <h4 className="font-medium mb-4">{sector.replace('_', ' ')}</h4>
              <div className="space-y-3">
                {sectorRooms
                  .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
                  .map(room => (
                    <div key={room.id} className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Chambre {room.number}</span>
                        <button
                          onClick={() => deleteRoom(room.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(room.id, 'vacant')}
                          className={`flex-1 px-2 py-1 rounded-md text-sm font-medium ${
                            room.status === 'vacant'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Libre
                        </button>
                        <button
                          onClick={() => handleStatusChange(room.id, 'occupied')}
                          className={`flex-1 px-2 py-1 rounded-md text-sm font-medium ${
                            room.status === 'occupied'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Occupée
                        </button>
                        <button
                          onClick={() => handleStatusChange(room.id, 'maintenance')}
                          className={`flex-1 px-2 py-1 rounded-md text-sm font-medium ${
                            room.status === 'maintenance'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Travaux
                        </button>
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded-full text-center ${getStatusColor(room.status)}`}>
                        {getStatusText(room.status)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomAdmin; 