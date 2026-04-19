/**
 * Mapping of Apex Legends internal map names to display names.
 * Internal names sourced from https://apexlegends.wiki.gg/wiki/Map
 */
export const APEX_MAP_NAMES: Record<string, string> = {
  // Kings Canyon
  'mp_rr_canyonlands_staging':        'Firing Range',
  'mp_rr_canyonlands_64k_x_64k':      'Kings Canyon',
  'mp_rr_canyonlands_mu1':            'Kings Canyon',
  'mp_rr_canyonlands_mu1_night':      'Kings Canyon After Dark',
  'mp_rr_canyonlands_mu2':            'Kings Canyon',
  'mp_rr_canyonlands_mu3':            'Kings Canyon',
  'mp_rr_canyonlands_hu':             'Kings Canyon',
  'mp_rr_freedm_skulltown':           'Kings Canyon',

  // World's Edge
  'mp_rr_desertlands_64k_x_64k':      "World's Edge",
  'mp_rr_desertlands_holiday':        "World's Edge",
  'mp_rr_desertlands_hu':             "World's Edge",
  'mp_rr_desertlands_mu1':            "World's Edge",
  'mp_rr_desertlands_mu2':            "World's Edge",
  'mp_rr_desertlands_mu3':            "World's Edge",
  'mp_rr_desertlands_mu4':            "World's Edge",

  // Olympus
  'mp_rr_olympus':                    'Olympus',
  'mp_rr_olympus_mu1':                'Olympus',
  'mp_rr_olympus_mu1_night':          'Olympus After Dark',
  'mp_rr_olympus_mu2':                'Olympus',

  // Storm Point
  'mp_rr_tropic_island':              'Storm Point',
  'mp_rr_tropic_island_mu1':          'Storm Point',
  'mp_rr_tropic_island_mu2':          'Storm Point',
  'mp_rr_tropic_island_mu2_landscape':'Storm Point',

  // Broken Moon
  'mp_rr_divided_moon':               'Broken Moon',
  'mp_rr_divided_moon_mu1':           'Broken Moon',

  // E-District
  'mp_rr_district':                   'E-District',
  'mp_rr_district_mu1':               'E-District',

  // Mixtape / Arenas
  'mp_rr_party_crasher':              'Party Crasher',
  'mp_rr_arena_phase_runner':         'Phase Runner',
  'mp_rr_aqueduct':                   'Overflow',
  'mp_rr_arena_skygarden':            'Encore',
  'mp_rr_arena_habitat':              'Habitat 4',
  'mp_rr_arena_composite':            'Drop-Off',
};

export function getApexMapDisplayName(internalName: string): string {
  return APEX_MAP_NAMES[internalName] ?? internalName;
}
