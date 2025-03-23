import { Room, Sector } from '../types/room';

const createRoomNumber = (sector: Sector, number: number): string => {
  switch (sector) {
    case 'UP1':
    case 'UP2':
      return number.toString().padStart(2, '0');
    default:
      return number.toString();
  }
};

export const initializeRooms = (): Room[] => {
  const rooms: Room[] = [];
  let id = 1;

  // Création des chambres pour chaque secteur
  const sectors: Sector[] = ['UP1', 'UP2', 'AILE_A', 'AILE_B', 'AILE_C', 'AILE_D'];
  const roomsPerSector = {
    UP1: { start: 15, end: 28 },
    UP2: { start: 1, end: 14 },
    AILE_A: { start: 101, end: 114 },
    AILE_B: { start: 115, end: 128 },
    AILE_C: { start: 130, end: 156 },
    AILE_D: { start: 137, end: 149 }
  };

  sectors.forEach(sector => {
    const { start, end } = roomsPerSector[sector];
    for (let number = start; number <= end; number++) {
      rooms.push({
        id: id++,
        number: createRoomNumber(sector, number),
        sector,
        status: 'vacant',
        careLevel: 'low',
        notes: '',
        lastStatusChange: new Date()
      });
    }
  });

  return rooms;
}; 