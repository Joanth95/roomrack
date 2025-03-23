'use client';

import { useState } from 'react';
import useRoomStore from '../store/roomStore';
import { Sector, Room } from '../types/room';
import RoomDetails from './RoomDetails';
import CareStats from './CareStats';
import StayStats from './StayStats';

const sectors: Sector[] = ['UP1', 'UP2', 'AILE_A', 'AILE_B', 'AILE_C', 'AILE_D'];

const Dashboard = () => {
  const [selectedSector, setSelectedSector] = useState<Sector>('UP1');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { rooms, getOccupancyRate, getSectorOccupancyRate, getRoomsBySector } = useRoomStore();

  const globalOccupancy = getOccupancyRate();
  const sectorOccupancy = getSectorOccupancyRate(selectedSector);
  const sectorRooms = getRoomsBySector(selectedSector);

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Taux d'occupation global</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{globalOccupancy.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Chambres occupées</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {rooms.filter(r => r.status === 'occupied').length} / {rooms.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Chambres en travaux</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {rooms.filter(r => r.status === 'maintenance').length}
          </p>
        </div>
      </div>

      {/* Statistiques de charge en soins */}
      <CareStats />

      {/* Statistiques des séjours */}
      <StayStats />

      {/* Sélecteur de secteur */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap space-x-4 mb-4">
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2 rounded-md mb-2 ${
                selectedSector === sector
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sector.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Détails du secteur */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">
            Détails du secteur {selectedSector.replace('_', ' ')}
          </h3>
          <p className="mt-2">
            Taux d'occupation : <span className="font-bold">{sectorOccupancy.toFixed(1)}%</span>
          </p>
          
          {/* Grille des chambres */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {sectorRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 rounded-lg cursor-pointer transform hover:scale-105 transition-transform ${
                  room.status === 'occupied'
                    ? 'bg-red-100'
                    : room.status === 'maintenance'
                    ? 'bg-yellow-100'
                    : 'bg-green-100'
                }`}
              >
                <p className="font-bold text-center">{room.number}</p>
                <p className="text-sm text-center mt-1">
                  {room.status === 'occupied' ? 'Occupée' : room.status === 'maintenance' ? 'Travaux' : 'Libre'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal des détails de la chambre */}
      {selectedRoom && (
        <RoomDetails
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
};

export default Dashboard; 