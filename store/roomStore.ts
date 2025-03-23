import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room, RoomStatus, Sector, Stay, Resident } from '../types/room';
import { initializeRooms } from '../utils/initializeRooms';

interface RoomStore {
    rooms: Room[];
    stays: Stay[];
    residents: Resident[];
    
    // Gestion des chambres
    addRoom: (room: Room) => void;
    deleteRoom: (roomId: number) => void;
    updateRoomStatus: (roomId: number, status: RoomStatus) => void;
    updateRoomNotes: (roomId: number, notes: string) => void;
    
    // Gestion des résidents
    addResident: (resident: Omit<Resident, 'id'>) => void;
    updateResident: (resident: Resident) => void;
    deleteResident: (residentId: number) => void;
    
    // Gestion des séjours
    createStay: (stay: Omit<Stay, 'id'>) => void;
    updateStay: (stay: Stay) => void;
    endStay: (stayId: number, endDate: Date) => void;
    deleteStay: (stayId: number) => void;
    
    // Getters
    getRoomsBySector: (sector: Sector) => Room[];
    getActiveStayByRoomId: (roomId: number) => Stay | undefined;
    getResidentById: (residentId: number) => Resident | undefined;
    getStayById: (stayId: number) => Stay | undefined;
    getRoomById: (roomId: number) => Room | undefined;
    getOccupancyRate: () => number;
    getSectorOccupancyRate: (sector: Sector) => number;
}

const useRoomStore = create<RoomStore>()(
    persist(
        (set, get) => ({
            rooms: initializeRooms(),
            stays: [],
            residents: [],
            
            // Gestion des chambres
            addRoom: (room) => set((state) => ({
                rooms: [...state.rooms, room]
            })),

            deleteRoom: (roomId) => set((state) => ({
                rooms: state.rooms.filter(room => room.id !== roomId)
            })),

            updateRoomStatus: (roomId, status) => set((state) => ({
                rooms: state.rooms.map(room =>
                    room.id === roomId
                        ? { ...room, status, lastStatusChange: new Date() }
                        : room
                )
            })),

            updateRoomNotes: (roomId, notes) => set((state) => ({
                rooms: state.rooms.map(room =>
                    room.id === roomId
                        ? { ...room, notes }
                        : room
                )
            })),

            // Gestion des résidents
            addResident: (residentData) => set((state) => {
                const newResident: Resident = {
                    ...residentData,
                    id: Math.max(0, ...state.residents.map(r => r.id)) + 1
                };
                return { residents: [...state.residents, newResident] };
            }),

            updateResident: (resident) => set((state) => ({
                residents: state.residents.map(r =>
                    r.id === resident.id ? resident : r
                )
            })),

            deleteResident: (residentId) => set((state) => ({
                residents: state.residents.filter(r => r.id !== residentId)
            })),

            // Gestion des séjours
            createStay: (stayData) => set((state) => {
                const newStay: Stay = {
                    ...stayData,
                    id: Math.max(0, ...state.stays.map(s => s.id)) + 1
                };
                
                // Mise à jour du currentStayId de la chambre
                const updatedRooms = state.rooms.map(room =>
                    room.id === stayData.roomId
                        ? { ...room, currentStayId: newStay.id, status: 'occupied' as RoomStatus }
                        : room
                );

                return {
                    stays: [...state.stays, newStay],
                    rooms: updatedRooms
                };
            }),

            updateStay: (stay) => set((state) => ({
                stays: state.stays.map(s =>
                    s.id === stay.id ? stay : s
                )
            })),

            endStay: (stayId, endDate) => set((state) => {
                const stay = state.stays.find(s => s.id === stayId);
                if (!stay) return state;

                const updatedStays = state.stays.map(s =>
                    s.id === stayId ? { ...s, endDate } : s
                );

                const updatedRooms = state.rooms.map(room =>
                    room.id === stay.roomId
                        ? { ...room, currentStayId: undefined, status: 'vacant' as RoomStatus }
                        : room
                );

                return {
                    stays: updatedStays,
                    rooms: updatedRooms
                };
            }),

            deleteStay: (stayId) => set((state) => {
                const stay = state.stays.find(s => s.id === stayId);
                if (!stay) return state;

                const updatedRooms = state.rooms.map(room =>
                    room.currentStayId === stayId
                        ? { ...room, currentStayId: undefined, status: 'vacant' as RoomStatus }
                        : room
                );

                return {
                    stays: state.stays.filter(s => s.id !== stayId),
                    rooms: updatedRooms
                };
            }),

            // Getters
            getRoomsBySector: (sector) => {
                return get().rooms.filter(room => room.sector === sector);
            },

            getActiveStayByRoomId: (roomId) => {
                const room = get().rooms.find(r => r.id === roomId);
                if (!room?.currentStayId) return undefined;
                return get().stays.find(s => s.id === room.currentStayId);
            },

            getResidentById: (residentId) => {
                return get().residents.find(r => r.id === residentId);
            },

            getStayById: (stayId) => {
                return get().stays.find(s => s.id === stayId);
            },

            getRoomById: (roomId) => {
                return get().rooms.find(r => r.id === roomId);
            },

            getOccupancyRate: () => {
                const rooms = get().rooms;
                if (rooms.length === 0) return 0;
                return (rooms.filter(room => room.status === 'occupied').length / rooms.length) * 100;
            },

            getSectorOccupancyRate: (sector) => {
                const sectorRooms = get().getRoomsBySector(sector);
                if (sectorRooms.length === 0) return 0;
                return (sectorRooms.filter(room => room.status === 'occupied').length / sectorRooms.length) * 100;
            },
        }),
        {
            name: 'room-storage',
            partialize: (state) => ({
                rooms: state.rooms,
                stays: state.stays,
                residents: state.residents
            })
        }
    )
);

export default useRoomStore; 