export type RoomStatus = 'occupied' | 'vacant' | 'maintenance';

export type Sector = 'UP1' | 'UP2' | 'AILE_A' | 'AILE_B' | 'AILE_C' | 'AILE_D';

export type GIRLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface GIRDescription {
  level: GIRLevel;
  description: string;
  autonomyLevel: string;
}

export const GIR_DESCRIPTIONS: Record<GIRLevel, GIRDescription> = {
  1: {
    level: 1,
    description: "Personne confinée au lit ou au fauteuil, dont les fonctions mentales sont gravement altérées",
    autonomyLevel: "Dépendance totale"
  },
  2: {
    level: 2,
    description: "Personne confinée au lit ou au fauteuil, dont les fonctions mentales ne sont pas totalement altérées",
    autonomyLevel: "Dépendance majeure"
  },
  3: {
    level: 3,
    description: "Personne ayant conservé son autonomie mentale, partiellement son autonomie locomotrice",
    autonomyLevel: "Dépendance partielle"
  },
  4: {
    level: 4,
    description: "Personne ayant besoin d'aide pour le lever, le coucher, la toilette",
    autonomyLevel: "Dépendance moyenne"
  },
  5: {
    level: 5,
    description: "Personne ayant besoin d'une aide ponctuelle pour la toilette, la préparation des repas",
    autonomyLevel: "Dépendance légère"
  },
  6: {
    level: 6,
    description: "Personne encore autonome pour les actes essentiels de la vie courante",
    autonomyLevel: "Autonomie"
  }
};

export interface Resident {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    notes?: string;
}

export type StayType = 'temporary' | 'permanent';

export interface Stay {
    id: number;
    residentId: number;
    roomId: number;
    startDate: Date;
    endDate?: Date;
    girLevel: GIRLevel;
    notes?: string;
    stayType: StayType;
}

export interface Room {
    id: number;
    number: string;
    sector: Sector;
    status: RoomStatus;
    notes?: string;
    lastStatusChange: Date;
    currentStayId?: number;
}

export interface SectorStats {
    sector: Sector;
    totalRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    averageGIR: number;
} 