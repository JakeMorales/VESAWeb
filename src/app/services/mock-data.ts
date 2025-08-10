import { MatchDayResults, TeamGameResult, PlayerStats } from '../models/match-day-results.model';
import { MatchResults, GameResult } from '../components/match/match-results.component';

export class MockMatchData {
  
  static getMatchDayResults(): MatchDayResults {
    return {
      1: [
        {
          gameNumber: 1,
          teamName: 'Apex Predators',
          placement: 1,
          teamKills: 12,
          placementPoints: 10,
          totalPoints: 22,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Predator_Alpha', kills: 5, damage: 1850, downs: 7, revives: 2, respawns: 0 },
            { playerName: 'Predator_Beta', kills: 4, damage: 1620, downs: 5, revives: 1, respawns: 1 },
            { playerName: 'Predator_Gamma', kills: 3, damage: 1340, downs: 4, revives: 3, respawns: 0 }
          ]
        },
        {
          gameNumber: 1,
          teamName: 'Storm Legends',
          placement: 2,
          teamKills: 8,
          placementPoints: 6,
          totalPoints: 14,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Storm_Thunder', kills: 3, damage: 1420, downs: 4, revives: 1, respawns: 0 },
            { playerName: 'Storm_Lightning', kills: 3, damage: 1380, downs: 3, revives: 2, respawns: 1 },
            { playerName: 'Storm_Tempest', kills: 2, damage: 1150, downs: 3, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 1,
          teamName: 'Shadow Squad',
          placement: 3,
          teamKills: 6,
          placementPoints: 5,
          totalPoints: 11,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Shadow_Wraith', kills: 3, damage: 1280, downs: 4, revives: 0, respawns: 1 },
            { playerName: 'Shadow_Ghost', kills: 2, damage: 1090, downs: 2, revives: 2, respawns: 0 },
            { playerName: 'Shadow_Phantom', kills: 1, damage: 950, downs: 2, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 1,
          teamName: 'Digital Legends',
          placement: 4,
          teamKills: 4,
          placementPoints: 4,
          totalPoints: 8,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Digital_One', kills: 2, damage: 1020, downs: 3, revives: 1, respawns: 0 },
            { playerName: 'Digital_Two', kills: 1, damage: 890, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Digital_Three', kills: 1, damage: 760, downs: 2, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 1,
          teamName: 'Void Runners',
          placement: 5,
          teamKills: 3,
          placementPoints: 3,
          totalPoints: 6,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Void_Runner1', kills: 2, damage: 920, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Void_Runner2', kills: 1, damage: 680, downs: 1, revives: 1, respawns: 0 },
            { playerName: 'Void_Runner3', kills: 0, damage: 540, downs: 1, revives: 0, respawns: 1 }
          ]
        },
        {
          gameNumber: 1,
          teamName: 'Elite Force',
          placement: 6,
          teamKills: 5,
          placementPoints: 3,
          totalPoints: 8,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Elite_Commander', kills: 3, damage: 1180, downs: 4, revives: 1, respawns: 0 },
            { playerName: 'Elite_Soldier', kills: 1, damage: 890, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Elite_Sniper', kills: 1, damage: 740, downs: 1, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 1,
          teamName: 'Chaos Theory',
          placement: 7,
          teamKills: 2,
          placementPoints: 2,
          totalPoints: 4,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Chaos_Prime', kills: 1, damage: 720, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Chaos_Vector', kills: 1, damage: 640, downs: 1, revives: 1, respawns: 1 },
            { playerName: 'Chaos_Matrix', kills: 0, damage: 480, downs: 1, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 1,
          teamName: 'Neon Dynasty',
          placement: 8,
          teamKills: 4,
          placementPoints: 2,
          totalPoints: 6,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Neon_Blade', kills: 2, damage: 980, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Neon_Strike', kills: 2, damage: 850, downs: 2, revives: 1, respawns: 0 },
            { playerName: 'Neon_Flash', kills: 0, damage: 420, downs: 0, revives: 0, respawns: 2 }
          ]
        },
        {
          gameNumber: 1,
          teamName: 'Iron Wolves',
          placement: 9,
          teamKills: 1,
          placementPoints: 1,
          totalPoints: 2,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Iron_Alpha', kills: 1, damage: 650, downs: 1, revives: 1, respawns: 1 },
            { playerName: 'Iron_Beta', kills: 0, damage: 420, downs: 0, revives: 0, respawns: 1 },
            { playerName: 'Iron_Gamma', kills: 0, damage: 380, downs: 1, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 1,
          teamName: 'Last Resort',
          placement: 10,
          teamKills: 0,
          placementPoints: 1,
          totalPoints: 1,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Resort_One', kills: 0, damage: 320, downs: 0, revives: 0, respawns: 1 },
            { playerName: 'Resort_Two', kills: 0, damage: 280, downs: 0, revives: 1, respawns: 1 },
            { playerName: 'Resort_Three', kills: 0, damage: 240, downs: 0, revives: 0, respawns: 2 }
          ]
        }
      ],
      2: [
        {
          gameNumber: 2,
          teamName: 'Storm Legends',
          placement: 1,
          teamKills: 10,
          placementPoints: 10,
          totalPoints: 20,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Storm_Thunder', kills: 4, damage: 1920, downs: 6, revives: 1, respawns: 0 },
            { playerName: 'Storm_Lightning', kills: 4, damage: 1780, downs: 5, revives: 0, respawns: 0 },
            { playerName: 'Storm_Tempest', kills: 2, damage: 1340, downs: 3, revives: 2, respawns: 1 }
          ]
        },
        {
          gameNumber: 2,
          teamName: 'Shadow Squad',
          placement: 2,
          teamKills: 7,
          placementPoints: 6,
          totalPoints: 13,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Shadow_Wraith', kills: 3, damage: 1540, downs: 4, revives: 1, respawns: 0 },
            { playerName: 'Shadow_Ghost', kills: 2, damage: 1320, downs: 3, revives: 1, respawns: 1 },
            { playerName: 'Shadow_Phantom', kills: 2, damage: 1180, downs: 2, revives: 0, respawns: 0 }
          ]
        },
        {
          gameNumber: 2,
          teamName: 'Apex Predators',
          placement: 3,
          teamKills: 5,
          placementPoints: 5,
          totalPoints: 10,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Predator_Alpha', kills: 2, damage: 1280, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Predator_Beta', kills: 2, damage: 1150, downs: 2, revives: 2, respawns: 0 },
            { playerName: 'Predator_Gamma', kills: 1, damage: 980, downs: 2, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 2,
          teamName: 'Void Runners',
          placement: 4,
          teamKills: 6,
          placementPoints: 4,
          totalPoints: 10,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Void_Runner1', kills: 3, damage: 1420, downs: 4, revives: 0, respawns: 0 },
            { playerName: 'Void_Runner2', kills: 2, damage: 1180, downs: 2, revives: 1, respawns: 1 },
            { playerName: 'Void_Runner3', kills: 1, damage: 890, downs: 1, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 2,
          teamName: 'Digital Legends',
          placement: 5,
          teamKills: 2,
          placementPoints: 3,
          totalPoints: 5,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Digital_One', kills: 1, damage: 820, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Digital_Two', kills: 1, damage: 740, downs: 1, revives: 1, respawns: 0 },
            { playerName: 'Digital_Three', kills: 0, damage: 590, downs: 1, revives: 0, respawns: 1 }
          ]
        },
        {
          gameNumber: 2,
          teamName: 'Neon Dynasty',
          placement: 6,
          teamKills: 7,
          placementPoints: 3,
          totalPoints: 10,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Neon_Blade', kills: 4, damage: 1520, downs: 5, revives: 1, respawns: 0 },
            { playerName: 'Neon_Strike', kills: 2, damage: 1180, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Neon_Pulse', kills: 1, damage: 890, downs: 2, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 2,
          teamName: 'Elite Force',
          placement: 7,
          teamKills: 3,
          placementPoints: 2,
          totalPoints: 5,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Elite_Commander', kills: 2, damage: 980, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Elite_Soldier', kills: 1, damage: 720, downs: 1, revives: 1, respawns: 1 },
            { playerName: 'Elite_Recruit', kills: 0, damage: 560, downs: 1, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 2,
          teamName: 'Iron Wolves',
          placement: 8,
          teamKills: 4,
          placementPoints: 2,
          totalPoints: 6,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Iron_Alpha', kills: 2, damage: 1050, downs: 3, revives: 1, respawns: 0 },
            { playerName: 'Iron_Beta', kills: 1, damage: 780, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Iron_Delta', kills: 1, damage: 640, downs: 1, revives: 2, respawns: 1 }
          ]
        },
        {
          gameNumber: 2,
          teamName: 'Chaos Theory',
          placement: 9,
          teamKills: 1,
          placementPoints: 1,
          totalPoints: 2,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Chaos_Prime', kills: 1, damage: 580, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Chaos_Vector', kills: 0, damage: 420, downs: 0, revives: 1, respawns: 1 },
            { playerName: 'Chaos_Matrix', kills: 0, damage: 360, downs: 0, revives: 0, respawns: 2 }
          ]
        },
        {
          gameNumber: 2,
          teamName: 'Last Resort',
          placement: 10,
          teamKills: 2,
          placementPoints: 1,
          totalPoints: 3,
          mapName: 'Kings Canyon',
          players: [
            { playerName: 'Resort_One', kills: 1, damage: 680, downs: 2, revives: 1, respawns: 0 },
            { playerName: 'Resort_Four', kills: 1, damage: 520, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Resort_Three', kills: 0, damage: 380, downs: 1, revives: 1, respawns: 1 }
          ]
        }
      ],
      3: [
        {
          gameNumber: 3,
          teamName: 'Digital Legends',
          placement: 1,
          teamKills: 9,
          placementPoints: 10,
          totalPoints: 19,
          mapName: 'Olympus',
          players: [
            { playerName: 'Digital_One', kills: 4, damage: 1720, downs: 5, revives: 1, respawns: 0 },
            { playerName: 'Digital_Two', kills: 3, damage: 1480, downs: 4, revives: 0, respawns: 0 },
            { playerName: 'Digital_Three', kills: 2, damage: 1240, downs: 3, revives: 2, respawns: 1 }
          ]
        },
        {
          gameNumber: 3,
          teamName: 'Apex Predators',
          placement: 2,
          teamKills: 8,
          placementPoints: 6,
          totalPoints: 14,
          mapName: 'Olympus',
          players: [
            { playerName: 'Predator_Alpha', kills: 4, damage: 1680, downs: 5, revives: 0, respawns: 0 },
            { playerName: 'Predator_Beta', kills: 2, damage: 1290, downs: 3, revives: 1, respawns: 1 },
            { playerName: 'Predator_Gamma', kills: 2, damage: 1120, downs: 2, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 3,
          teamName: 'Storm Legends',
          placement: 3,
          teamKills: 6,
          placementPoints: 5,
          totalPoints: 11,
          mapName: 'Olympus',
          players: [
            { playerName: 'Storm_Thunder', kills: 2, damage: 1180, downs: 3, revives: 1, respawns: 1 },
            { playerName: 'Storm_Lightning', kills: 2, damage: 1090, downs: 2, revives: 0, respawns: 0 },
            { playerName: 'Storm_Tempest', kills: 2, damage: 1020, downs: 2, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 3,
          teamName: 'Shadow Squad',
          placement: 4,
          teamKills: 4,
          placementPoints: 4,
          totalPoints: 8,
          mapName: 'Olympus',
          players: [
            { playerName: 'Shadow_Wraith', kills: 2, damage: 1050, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Shadow_Ghost', kills: 1, damage: 890, downs: 1, revives: 1, respawns: 0 },
            { playerName: 'Shadow_Phantom', kills: 1, damage: 780, downs: 2, revives: 0, respawns: 1 }
          ]
        },
        {
          gameNumber: 3,
          teamName: 'Void Runners',
          placement: 5,
          teamKills: 2,
          placementPoints: 3,
          totalPoints: 5,
          mapName: 'Olympus',
          players: [
            { playerName: 'Void_Runner1', kills: 1, damage: 720, downs: 1, revives: 1, respawns: 0 },
            { playerName: 'Void_Runner2', kills: 1, damage: 650, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Void_Runner3', kills: 0, damage: 480, downs: 0, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 3,
          teamName: 'Iron Wolves',
          placement: 6,
          teamKills: 8,
          placementPoints: 3,
          totalPoints: 11,
          mapName: 'Olympus',
          players: [
            { playerName: 'Iron_Alpha', kills: 4, damage: 1640, downs: 5, revives: 0, respawns: 0 },
            { playerName: 'Iron_Beta', kills: 3, damage: 1280, downs: 4, revives: 1, respawns: 1 },
            { playerName: 'Iron_Delta', kills: 1, damage: 890, downs: 2, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 3,
          teamName: 'Elite Force',
          placement: 7,
          teamKills: 5,
          placementPoints: 2,
          totalPoints: 7,
          mapName: 'Olympus',
          players: [
            { playerName: 'Elite_Commander', kills: 3, damage: 1350, downs: 4, revives: 1, respawns: 0 },
            { playerName: 'Elite_Soldier', kills: 2, damage: 980, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Elite_Sniper', kills: 0, damage: 620, downs: 1, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 3,
          teamName: 'Last Resort',
          placement: 8,
          teamKills: 6,
          placementPoints: 2,
          totalPoints: 8,
          mapName: 'Olympus',
          players: [
            { playerName: 'Resort_One', kills: 3, damage: 1280, downs: 4, revives: 0, respawns: 1 },
            { playerName: 'Resort_Two', kills: 2, damage: 980, downs: 3, revives: 1, respawns: 0 },
            { playerName: 'Resort_Four', kills: 1, damage: 720, downs: 1, revives: 2, respawns: 1 }
          ]
        },
        {
          gameNumber: 3,
          teamName: 'Neon Dynasty',
          placement: 9,
          teamKills: 3,
          placementPoints: 1,
          totalPoints: 4,
          mapName: 'Olympus',
          players: [
            { playerName: 'Neon_Blade', kills: 2, damage: 920, downs: 3, revives: 1, respawns: 1 },
            { playerName: 'Neon_Strike', kills: 1, damage: 680, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Neon_Flash', kills: 0, damage: 420, downs: 0, revives: 1, respawns: 2 }
          ]
        },
        {
          gameNumber: 3,
          teamName: 'Chaos Theory',
          placement: 10,
          teamKills: 1,
          placementPoints: 1,
          totalPoints: 2,
          mapName: 'Olympus',
          players: [
            { playerName: 'Chaos_Prime', kills: 1, damage: 540, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Chaos_Omega', kills: 0, damage: 380, downs: 0, revives: 1, respawns: 1 },
            { playerName: 'Chaos_Matrix', kills: 0, damage: 320, downs: 0, revives: 0, respawns: 2 }
          ]
        }
      ],
      4: [
        {
          gameNumber: 4,
          teamName: 'Shadow Squad',
          placement: 1,
          teamKills: 11,
          placementPoints: 10,
          totalPoints: 21,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Shadow_Wraith', kills: 5, damage: 1920, downs: 6, revives: 1, respawns: 0 },
            { playerName: 'Shadow_Ghost', kills: 4, damage: 1650, downs: 5, revives: 0, respawns: 0 },
            { playerName: 'Shadow_Phantom', kills: 2, damage: 1280, downs: 3, revives: 2, respawns: 1 }
          ]
        },
        {
          gameNumber: 4,
          teamName: 'Void Runners',
          placement: 2,
          teamKills: 7,
          placementPoints: 6,
          totalPoints: 13,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Void_Runner1', kills: 3, damage: 1480, downs: 4, revives: 1, respawns: 0 },
            { playerName: 'Void_Runner2', kills: 2, damage: 1220, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Void_Runner3', kills: 2, damage: 1040, downs: 2, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 4,
          teamName: 'Digital Legends',
          placement: 3,
          teamKills: 6,
          placementPoints: 5,
          totalPoints: 11,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Digital_One', kills: 3, damage: 1380, downs: 4, revives: 0, respawns: 1 },
            { playerName: 'Digital_Two', kills: 2, damage: 1150, downs: 2, revives: 1, respawns: 0 },
            { playerName: 'Digital_Three', kills: 1, damage: 920, downs: 2, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 4,
          teamName: 'Storm Legends',
          placement: 4,
          teamKills: 5,
          placementPoints: 4,
          totalPoints: 9,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Storm_Thunder', kills: 2, damage: 1120, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Storm_Lightning', kills: 2, damage: 980, downs: 2, revives: 1, respawns: 0 },
            { playerName: 'Storm_Tempest', kills: 1, damage: 840, downs: 1, revives: 2, respawns: 1 }
          ]
        },
        {
          gameNumber: 4,
          teamName: 'Apex Predators',
          placement: 5,
          teamKills: 3,
          placementPoints: 3,
          totalPoints: 6,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Predator_Alpha', kills: 2, damage: 980, downs: 2, revives: 1, respawns: 1 },
            { playerName: 'Predator_Beta', kills: 1, damage: 720, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Predator_Gamma', kills: 0, damage: 590, downs: 1, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 4,
          teamName: 'Elite Force',
          placement: 6,
          teamKills: 4,
          placementPoints: 3,
          totalPoints: 7,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Elite_Commander', kills: 2, damage: 1080, downs: 3, revives: 1, respawns: 0 },
            { playerName: 'Elite_Soldier', kills: 1, damage: 820, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Elite_Sniper', kills: 1, damage: 680, downs: 1, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 4,
          teamName: 'Neon Dynasty',
          placement: 7,
          teamKills: 6,
          placementPoints: 2,
          totalPoints: 8,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Neon_Blade', kills: 3, damage: 1320, downs: 4, revives: 0, respawns: 1 },
            { playerName: 'Neon_Strike', kills: 2, damage: 1050, downs: 3, revives: 1, respawns: 0 },
            { playerName: 'Neon_Flash', kills: 1, damage: 780, downs: 2, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 4,
          teamName: 'Iron Wolves',
          placement: 8,
          teamKills: 2,
          placementPoints: 2,
          totalPoints: 4,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Iron_Alpha', kills: 1, damage: 720, downs: 2, revives: 1, respawns: 1 },
            { playerName: 'Iron_Beta', kills: 1, damage: 580, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Iron_Delta', kills: 0, damage: 420, downs: 1, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 4,
          teamName: 'Chaos Theory',
          placement: 9,
          teamKills: 3,
          placementPoints: 1,
          totalPoints: 4,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Chaos_Prime', kills: 2, damage: 920, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Chaos_Vector', kills: 1, damage: 680, downs: 1, revives: 1, respawns: 0 },
            { playerName: 'Chaos_Matrix', kills: 0, damage: 480, downs: 1, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 4,
          teamName: 'Last Resort',
          placement: 10,
          teamKills: 1,
          placementPoints: 1,
          totalPoints: 2,
          mapName: 'Storm Point',
          players: [
            { playerName: 'Resort_One', kills: 1, damage: 540, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Resort_Two', kills: 0, damage: 380, downs: 0, revives: 1, respawns: 1 },
            { playerName: 'Resort_Four', kills: 0, damage: 320, downs: 0, revives: 0, respawns: 2 }
          ]
        }
      ],
      5: [
        {
          gameNumber: 5,
          teamName: 'Void Runners',
          placement: 1,
          teamKills: 13,
          placementPoints: 10,
          totalPoints: 23,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Void_Runner1', kills: 6, damage: 2120, downs: 7, revives: 1, respawns: 0 },
            { playerName: 'Void_Runner2', kills: 4, damage: 1840, downs: 5, revives: 0, respawns: 0 },
            { playerName: 'Void_Runner3', kills: 3, damage: 1520, downs: 4, revives: 2, respawns: 1 }
          ]
        },
        {
          gameNumber: 5,
          teamName: 'Digital Legends',
          placement: 2,
          teamKills: 9,
          placementPoints: 6,
          totalPoints: 15,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Digital_One', kills: 4, damage: 1680, downs: 5, revives: 1, respawns: 0 },
            { playerName: 'Digital_Two', kills: 3, damage: 1420, downs: 4, revives: 0, respawns: 1 },
            { playerName: 'Digital_Three', kills: 2, damage: 1180, downs: 3, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 5,
          teamName: 'Apex Predators',
          placement: 3,
          teamKills: 8,
          placementPoints: 5,
          totalPoints: 13,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Predator_Alpha', kills: 3, damage: 1520, downs: 4, revives: 1, respawns: 0 },
            { playerName: 'Predator_Beta', kills: 3, damage: 1380, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Predator_Gamma', kills: 2, damage: 1120, downs: 2, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 5,
          teamName: 'Shadow Squad',
          placement: 4,
          teamKills: 6,
          placementPoints: 4,
          totalPoints: 10,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Shadow_Wraith', kills: 3, damage: 1240, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Shadow_Ghost', kills: 2, damage: 1050, downs: 2, revives: 1, respawns: 0 },
            { playerName: 'Shadow_Phantom', kills: 1, damage: 890, downs: 2, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 5,
          teamName: 'Storm Legends',
          placement: 5,
          teamKills: 4,
          placementPoints: 3,
          totalPoints: 7,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Storm_Thunder', kills: 2, damage: 1020, downs: 2, revives: 1, respawns: 1 },
            { playerName: 'Storm_Lightning', kills: 1, damage: 820, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Storm_Tempest', kills: 1, damage: 680, downs: 1, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 5,
          teamName: 'Elite Force',
          placement: 6,
          teamKills: 7,
          placementPoints: 3,
          totalPoints: 10,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Elite_Commander', kills: 4, damage: 1580, downs: 5, revives: 1, respawns: 0 },
            { playerName: 'Elite_Soldier', kills: 2, damage: 1180, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Elite_Sniper', kills: 1, damage: 920, downs: 2, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 5,
          teamName: 'Iron Wolves',
          placement: 7,
          teamKills: 5,
          placementPoints: 2,
          totalPoints: 7,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Iron_Alpha', kills: 3, damage: 1280, downs: 4, revives: 0, respawns: 1 },
            { playerName: 'Iron_Beta', kills: 2, damage: 980, downs: 2, revives: 1, respawns: 0 },
            { playerName: 'Iron_Delta', kills: 0, damage: 620, downs: 1, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 5,
          teamName: 'Neon Dynasty',
          placement: 8,
          teamKills: 3,
          placementPoints: 2,
          totalPoints: 5,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Neon_Blade', kills: 2, damage: 880, downs: 2, revives: 1, respawns: 1 },
            { playerName: 'Neon_Strike', kills: 1, damage: 720, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Neon_Flash', kills: 0, damage: 520, downs: 1, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 5,
          teamName: 'Chaos Theory',
          placement: 9,
          teamKills: 2,
          placementPoints: 1,
          totalPoints: 3,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Chaos_Prime', kills: 1, damage: 640, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Chaos_Vector', kills: 1, damage: 520, downs: 1, revives: 1, respawns: 1 },
            { playerName: 'Chaos_Matrix', kills: 0, damage: 380, downs: 0, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 5,
          teamName: 'Last Resort',
          placement: 10,
          teamKills: 1,
          placementPoints: 1,
          totalPoints: 2,
          mapName: 'Broken Moon',
          players: [
            { playerName: 'Resort_One', kills: 1, damage: 480, downs: 1, revives: 0, respawns: 1 },
            { playerName: 'Resort_Two', kills: 0, damage: 340, downs: 0, revives: 1, respawns: 1 },
            { playerName: 'Resort_Three', kills: 0, damage: 280, downs: 0, revives: 0, respawns: 2 }
          ]
        }
      ],
      6: [
        {
          gameNumber: 6,
          teamName: 'Storm Legends',
          placement: 1,
          teamKills: 14,
          placementPoints: 10,
          totalPoints: 24,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Storm_Thunder', kills: 6, damage: 2280, downs: 8, revives: 1, respawns: 0 },
            { playerName: 'Storm_Lightning', kills: 5, damage: 1960, downs: 6, revives: 0, respawns: 0 },
            { playerName: 'Storm_Tempest', kills: 3, damage: 1640, downs: 4, revives: 2, respawns: 1 }
          ]
        },
        {
          gameNumber: 6,
          teamName: 'Apex Predators',
          placement: 2,
          teamKills: 10,
          placementPoints: 6,
          totalPoints: 16,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Predator_Alpha', kills: 4, damage: 1720, downs: 5, revives: 1, respawns: 0 },
            { playerName: 'Predator_Beta', kills: 4, damage: 1580, downs: 4, revives: 0, respawns: 1 },
            { playerName: 'Predator_Gamma', kills: 2, damage: 1280, downs: 3, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 6,
          teamName: 'Shadow Squad',
          placement: 3,
          teamKills: 7,
          placementPoints: 5,
          totalPoints: 12,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Shadow_Wraith', kills: 3, damage: 1420, downs: 4, revives: 0, respawns: 1 },
            { playerName: 'Shadow_Ghost', kills: 2, damage: 1180, downs: 3, revives: 1, respawns: 0 },
            { playerName: 'Shadow_Phantom', kills: 2, damage: 1050, downs: 2, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 6,
          teamName: 'Void Runners',
          placement: 4,
          teamKills: 5,
          placementPoints: 4,
          totalPoints: 9,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Void_Runner1', kills: 2, damage: 1120, downs: 3, revives: 1, respawns: 1 },
            { playerName: 'Void_Runner2', kills: 2, damage: 980, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Void_Runner3', kills: 1, damage: 760, downs: 1, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 6,
          teamName: 'Digital Legends',
          placement: 5,
          teamKills: 3,
          placementPoints: 3,
          totalPoints: 6,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Digital_One', kills: 2, damage: 920, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Digital_Two', kills: 1, damage: 680, downs: 1, revives: 1, respawns: 1 },
            { playerName: 'Digital_Three', kills: 0, damage: 540, downs: 1, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 6,
          teamName: 'Iron Wolves',
          placement: 6,
          teamKills: 6,
          placementPoints: 3,
          totalPoints: 9,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Iron_Alpha', kills: 3, damage: 1380, downs: 4, revives: 1, respawns: 0 },
            { playerName: 'Iron_Beta', kills: 2, damage: 1120, downs: 3, revives: 0, respawns: 1 },
            { playerName: 'Iron_Gamma', kills: 1, damage: 820, downs: 2, revives: 2, respawns: 0 }
          ]
        },
        {
          gameNumber: 6,
          teamName: 'Elite Force',
          placement: 7,
          teamKills: 4,
          placementPoints: 2,
          totalPoints: 6,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Elite_Commander', kills: 2, damage: 1050, downs: 3, revives: 1, respawns: 1 },
            { playerName: 'Elite_Soldier', kills: 1, damage: 780, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Elite_Sniper', kills: 1, damage: 650, downs: 1, revives: 1, respawns: 0 }
          ]
        },
        {
          gameNumber: 6,
          teamName: 'Neon Dynasty',
          placement: 8,
          teamKills: 2,
          placementPoints: 2,
          totalPoints: 4,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Neon_Blade', kills: 1, damage: 720, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Neon_Strike', kills: 1, damage: 580, downs: 1, revives: 1, respawns: 1 },
            { playerName: 'Neon_Flash', kills: 0, damage: 420, downs: 1, revives: 1, respawns: 1 }
          ]
        },
        {
          gameNumber: 6,
          teamName: 'Chaos Theory',
          placement: 9,
          teamKills: 5,
          placementPoints: 1,
          totalPoints: 6,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Chaos_Prime', kills: 3, damage: 1180, downs: 4, revives: 1, respawns: 0 },
            { playerName: 'Chaos_Vector', kills: 2, damage: 890, downs: 2, revives: 0, respawns: 1 },
            { playerName: 'Chaos_Matrix', kills: 0, damage: 520, downs: 1, revives: 2, respawns: 1 }
          ]
        },
        {
          gameNumber: 6,
          teamName: 'Last Resort',
          placement: 10,
          teamKills: 0,
          placementPoints: 1,
          totalPoints: 1,
          mapName: 'World\'s Edge',
          players: [
            { playerName: 'Resort_One', kills: 0, damage: 380, downs: 0, revives: 0, respawns: 1 },
            { playerName: 'Resort_Two', kills: 0, damage: 290, downs: 0, revives: 1, respawns: 1 },
            { playerName: 'Resort_Three', kills: 0, damage: 220, downs: 0, revives: 0, respawns: 2 }
          ]
        }
      ]
    };
  }

  static getGameResults(): MatchResults {
    return {
      1: [
        { gameNumber: 1, teamName: 'Apex Predators', placement: 1, kills: 12, points: 22, isWinner: true },
        { gameNumber: 1, teamName: 'Storm Legends', placement: 2, kills: 8, points: 14, isWinner: false },
        { gameNumber: 1, teamName: 'Shadow Squad', placement: 3, kills: 6, points: 11, isWinner: false },
        { gameNumber: 1, teamName: 'Digital Legends', placement: 4, kills: 4, points: 8, isWinner: false },
        { gameNumber: 1, teamName: 'Void Runners', placement: 5, kills: 3, points: 6, isWinner: false },
        { gameNumber: 1, teamName: 'Elite Force', placement: 6, kills: 5, points: 8, isWinner: false },
        { gameNumber: 1, teamName: 'Chaos Theory', placement: 7, kills: 2, points: 4, isWinner: false },
        { gameNumber: 1, teamName: 'Neon Dynasty', placement: 8, kills: 4, points: 6, isWinner: false },
        { gameNumber: 1, teamName: 'Iron Wolves', placement: 9, kills: 1, points: 2, isWinner: false },
        { gameNumber: 1, teamName: 'Last Resort', placement: 10, kills: 0, points: 1, isWinner: false }
      ],
      2: [
        { gameNumber: 2, teamName: 'Storm Legends', placement: 1, kills: 10, points: 20, isWinner: true },
        { gameNumber: 2, teamName: 'Shadow Squad', placement: 2, kills: 7, points: 13, isWinner: false },
        { gameNumber: 2, teamName: 'Apex Predators', placement: 3, kills: 5, points: 10, isWinner: false },
        { gameNumber: 2, teamName: 'Void Runners', placement: 4, kills: 6, points: 10, isWinner: false },
        { gameNumber: 2, teamName: 'Digital Legends', placement: 5, kills: 2, points: 5, isWinner: false },
        { gameNumber: 2, teamName: 'Neon Dynasty', placement: 6, kills: 7, points: 10, isWinner: false },
        { gameNumber: 2, teamName: 'Elite Force', placement: 7, kills: 3, points: 5, isWinner: false },
        { gameNumber: 2, teamName: 'Iron Wolves', placement: 8, kills: 4, points: 6, isWinner: false },
        { gameNumber: 2, teamName: 'Chaos Theory', placement: 9, kills: 1, points: 2, isWinner: false },
        { gameNumber: 2, teamName: 'Last Resort', placement: 10, kills: 2, points: 3, isWinner: false }
      ],
      3: [
        { gameNumber: 3, teamName: 'Digital Legends', placement: 1, kills: 9, points: 19, isWinner: true },
        { gameNumber: 3, teamName: 'Apex Predators', placement: 2, kills: 8, points: 14, isWinner: false },
        { gameNumber: 3, teamName: 'Storm Legends', placement: 3, kills: 6, points: 11, isWinner: false },
        { gameNumber: 3, teamName: 'Shadow Squad', placement: 4, kills: 4, points: 8, isWinner: false },
        { gameNumber: 3, teamName: 'Void Runners', placement: 5, kills: 2, points: 5, isWinner: false },
        { gameNumber: 3, teamName: 'Iron Wolves', placement: 6, kills: 8, points: 11, isWinner: false },
        { gameNumber: 3, teamName: 'Elite Force', placement: 7, kills: 5, points: 7, isWinner: false },
        { gameNumber: 3, teamName: 'Last Resort', placement: 8, kills: 6, points: 8, isWinner: false },
        { gameNumber: 3, teamName: 'Neon Dynasty', placement: 9, kills: 3, points: 4, isWinner: false },
        { gameNumber: 3, teamName: 'Chaos Theory', placement: 10, kills: 1, points: 2, isWinner: false }
      ],
      4: [
        { gameNumber: 4, teamName: 'Shadow Squad', placement: 1, kills: 11, points: 21, isWinner: true },
        { gameNumber: 4, teamName: 'Void Runners', placement: 2, kills: 7, points: 13, isWinner: false },
        { gameNumber: 4, teamName: 'Digital Legends', placement: 3, kills: 6, points: 11, isWinner: false },
        { gameNumber: 4, teamName: 'Storm Legends', placement: 4, kills: 5, points: 9, isWinner: false },
        { gameNumber: 4, teamName: 'Apex Predators', placement: 5, kills: 3, points: 6, isWinner: false },
        { gameNumber: 4, teamName: 'Elite Force', placement: 6, kills: 4, points: 7, isWinner: false },
        { gameNumber: 4, teamName: 'Neon Dynasty', placement: 7, kills: 6, points: 8, isWinner: false },
        { gameNumber: 4, teamName: 'Iron Wolves', placement: 8, kills: 2, points: 4, isWinner: false },
        { gameNumber: 4, teamName: 'Chaos Theory', placement: 9, kills: 3, points: 4, isWinner: false },
        { gameNumber: 4, teamName: 'Last Resort', placement: 10, kills: 1, points: 2, isWinner: false }
      ],
      5: [
        { gameNumber: 5, teamName: 'Void Runners', placement: 1, kills: 13, points: 23, isWinner: true },
        { gameNumber: 5, teamName: 'Digital Legends', placement: 2, kills: 9, points: 15, isWinner: false },
        { gameNumber: 5, teamName: 'Apex Predators', placement: 3, kills: 8, points: 13, isWinner: false },
        { gameNumber: 5, teamName: 'Shadow Squad', placement: 4, kills: 6, points: 10, isWinner: false },
        { gameNumber: 5, teamName: 'Storm Legends', placement: 5, kills: 4, points: 7, isWinner: false },
        { gameNumber: 5, teamName: 'Elite Force', placement: 6, kills: 7, points: 10, isWinner: false },
        { gameNumber: 5, teamName: 'Iron Wolves', placement: 7, kills: 5, points: 7, isWinner: false },
        { gameNumber: 5, teamName: 'Neon Dynasty', placement: 8, kills: 3, points: 5, isWinner: false },
        { gameNumber: 5, teamName: 'Chaos Theory', placement: 9, kills: 2, points: 3, isWinner: false },
        { gameNumber: 5, teamName: 'Last Resort', placement: 10, kills: 1, points: 2, isWinner: false }
      ],
      6: [
        { gameNumber: 6, teamName: 'Storm Legends', placement: 1, kills: 14, points: 24, isWinner: true },
        { gameNumber: 6, teamName: 'Apex Predators', placement: 2, kills: 10, points: 16, isWinner: false },
        { gameNumber: 6, teamName: 'Shadow Squad', placement: 3, kills: 7, points: 12, isWinner: false },
        { gameNumber: 6, teamName: 'Void Runners', placement: 4, kills: 5, points: 9, isWinner: false },
        { gameNumber: 6, teamName: 'Digital Legends', placement: 5, kills: 3, points: 6, isWinner: false },
        { gameNumber: 6, teamName: 'Iron Wolves', placement: 6, kills: 6, points: 9, isWinner: false },
        { gameNumber: 6, teamName: 'Elite Force', placement: 7, kills: 4, points: 6, isWinner: false },
        { gameNumber: 6, teamName: 'Neon Dynasty', placement: 8, kills: 2, points: 4, isWinner: false },
        { gameNumber: 6, teamName: 'Chaos Theory', placement: 9, kills: 5, points: 6, isWinner: false },
        { gameNumber: 6, teamName: 'Last Resort', placement: 10, kills: 0, points: 1, isWinner: false }
      ]
    };
  }
}
