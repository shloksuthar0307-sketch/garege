export const vehicleZones: Record<string, string[]> = {
  front_bumper: ['bumper_front', 'front_fascia', 'grille', 'mesh_front'],
  rear_bumper: ['bumper_rear', 'rear_fascia', 'diffuser'],
  hood: ['hood', 'bonnet'],
  roof: ['roof', 'top'],
  front_left_door: ['door_fl', 'door_front_left'],
  front_right_door: ['door_fr', 'door_front_right'],
  rear_left_door: ['door_rl', 'door_rear_left'],
  rear_right_door: ['door_rr', 'door_rear_right'],
  front_left_fender: ['fender_fl', 'wing_fl'],
  front_right_fender: ['fender_fr', 'wing_fr'],
  rear_left_fender: ['fender_rl', 'quarter_panel_l'],
  rear_right_fender: ['fender_rr', 'quarter_panel_r'],
  trunk: ['trunk', 'boot', 'tailgate'],
  windshield: ['glass_front', 'windscreen'],
  rear_glass: ['glass_rear'],
  side_mirror_left: ['mirror_l'],
  side_mirror_right: ['mirror_r'],
  headlight_left: ['headlight_l'],
  headlight_right: ['headlight_r'],
  taillight_left: ['taillight_l'],
  taillight_right: ['taillight_r'],
  wheel_left_front: ['wheel_fl', 'rim_fl', 'tire_fl'],
  wheel_right_front: ['wheel_fr', 'rim_fr', 'tire_fr'],
  wheel_left_rear: ['wheel_rl', 'rim_rl', 'tire_rl'],
  wheel_right_rear: ['wheel_rr', 'rim_rr', 'tire_rr']
};

export function getZoneFromMeshName(meshName: string): string {
  const normalized = meshName.toLowerCase();
  for (const [zone, identifiers] of Object.entries(vehicleZones)) {
    if (identifiers.some(id => normalized.includes(id))) {
      return zone.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  return 'General Body';
}

