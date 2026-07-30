// icon  = emoji (legacy, keeps old screens working until they're restyled)
// vicon = @expo/vector-icons/Ionicons name (the real icon, going forward)
// tint  = this part's signature color (drives its tile glow)

export const PART_CATEGORIES = [
  { id: 'brakes',        label: 'Brake Pads',      icon: '🛑', vicon: 'disc-outline',          tint: '#EF4444', term: 'brake pads' },
  { id: 'rotors',        label: 'Brake Rotors',    icon: '⚙️', vicon: 'disc',                  tint: '#F97316', term: 'brake rotors' },
  { id: 'oil-filter',    label: 'Oil Filter',      icon: '🛢️', vicon: 'filter',                tint: '#EAB308', term: 'oil filter' },
  { id: 'air-filter',    label: 'Air Filter',      icon: '🌬️', vicon: 'cloud-outline',          tint: '#38BDF8', term: 'engine air filter' },
  { id: 'cabin-filter',  label: 'Cabin Filter',    icon: '❄️', vicon: 'snow',                  tint: '#22D3EE', term: 'cabin air filter' },
  { id: 'battery',       label: 'Battery',         icon: '🔋', vicon: 'battery-charging',      tint: '#84CC16', term: 'car battery' },
  { id: 'spark-plugs',   label: 'Spark Plugs',     icon: '⚡', vicon: 'flash',                 tint: '#FACC15', term: 'spark plugs' },
  { id: 'wipers',        label: 'Wiper Blades',    icon: '💧', vicon: 'water',                 tint: '#3B82F6', term: 'windshield wiper blades' },
  { id: 'alternator',    label: 'Alternator',      icon: '🔌', vicon: 'pulse-outline',         tint: '#A855F7', term: 'alternator' },
  { id: 'starter',       label: 'Starter',         icon: '🔑', vicon: 'key-outline',           tint: '#F472B6', term: 'starter motor' },
  { id: 'headlight',     label: 'Headlight Bulb',  icon: '💡', vicon: 'bulb-outline',          tint: '#FDE047', term: 'headlight bulb' },
  { id: 'serpentine',    label: 'Serpentine Belt', icon: '➰', vicon: 'link-outline',          tint: '#FB923C', term: 'serpentine belt' },
  { id: 'thermostat',    label: 'Thermostat',      icon: '🌡️', vicon: 'thermometer-outline',   tint: '#F87171', term: 'engine thermostat' },
  { id: 'fuel-pump',     label: 'Fuel Pump',       icon: '⛽', vicon: 'flame-outline',         tint: '#34D399', term: 'fuel pump' },
  { id: 'radiator',      label: 'Radiator',        icon: '♨️', vicon: 'hardware-chip-outline', tint: '#2DD4BF', term: 'radiator' },
  { id: 'oxygen-sensor', label: 'O2 Sensor',       icon: '🧪', vicon: 'analytics-outline',     tint: '#818CF8', term: 'oxygen sensor' },
];

export const MAINTENANCE_ITEMS = [
  { id: 'oil',        label: 'Oil Change',         icon: '🛢️', vicon: 'filter',            tint: '#EAB308', intervalMiles: 5000,  intervalMonths: 6  },
  { id: 'tire-rot',   label: 'Tire Rotation',      icon: '🔄', vicon: 'reload-outline',    tint: '#38BDF8', intervalMiles: 7500,  intervalMonths: 6  },
  { id: 'brakes',     label: 'Brake Inspection',   icon: '🛑', vicon: 'disc-outline',      tint: '#EF4444', intervalMiles: 12000, intervalMonths: 12 },
  { id: 'air-filter', label: 'Air Filter',         icon: '🌬️', vicon: 'cloud-outline',      tint: '#22D3EE', intervalMiles: 15000, intervalMonths: 12 },
  { id: 'battery',    label: 'Battery Check',      icon: '🔋', vicon: 'battery-charging',  tint: '#84CC16', intervalMiles: 0,     intervalMonths: 6  },
  { id: 'coolant',    label: 'Coolant Flush',      icon: '♨️', vicon: 'snow',              tint: '#2DD4BF', intervalMiles: 30000, intervalMonths: 24 },
  { id: 'trans',      label: 'Transmission Fluid', icon: '⚙️', vicon: 'cog-outline',       tint: '#A855F7', intervalMiles: 60000, intervalMonths: 48 },
  { id: 'spark',      label: 'Spark Plugs',        icon: '⚡', vicon: 'flash',             tint: '#FACC15', intervalMiles: 30000, intervalMonths: 24 },
  { id: 'belts',      label: 'Belt Inspection',    icon: '➰', vicon: 'link-outline',      tint: '#FB923C', intervalMiles: 60000, intervalMonths: 48 },
  { id: 'wipers',     label: 'Wiper Blades',       icon: '💧', vicon: 'water',             tint: '#3B82F6', intervalMiles: 0,     intervalMonths: 12 },
];