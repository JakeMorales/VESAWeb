export interface BaseSeason {
    id: string;
    name: string;
}

export interface LeagueSeason extends BaseSeason {
    divisions: string[];
}

export interface ArchiveSeason extends BaseSeason {
    startDate: string;
    endDate: string;
    status: 'completed' | 'active' | 'upcoming';
}
