/**
 * NPC vendors (docs/GDD.md's "Vendors & currency" section) — the first piece of a shared economy
 * beyond direct player-to-player trading: a small, curated general-goods catalog per hub zone,
 * not a full auction house. Buy prices are hand-authored here (unlike sellValue in items.ts,
 * which is formula-driven) so each vendor can have real personality in what's worth stocking.
 */
export interface VendorListing {
  itemId: string;
  price: number; // gold cost to buy one
}

export interface VendorDef {
  id: string;
  name: string;
  title: string;
  greeting: string;
  sells: VendorListing[];
}

export const VENDORS: VendorDef[] = [
  {
    id: "wares_keeper_tomlin",
    name: "Wares-Keeper Tomlin",
    title: "Threadhold Trading Post",
    greeting: "Potions, herbs, timber. Coin's coin, wherever it falls from.",
    sells: [
      { itemId: "potion_minor_health", price: 8 },
      { itemId: "potion_minor_resource", price: 8 },
      { itemId: "mat_herb", price: 3 },
      { itemId: "mat_wood", price: 3 }
    ]
  },
  {
    id: "quartermaster_hesk",
    name: "Quartermaster Hesk",
    title: "Ashmire Supply Cache",
    greeting: "Ore's dear out here. So's water. Pick your poison.",
    sells: [
      { itemId: "potion_minor_health", price: 8 },
      { itemId: "potion_greater_health", price: 20 },
      { itemId: "mat_iron_ore", price: 3 },
      { itemId: "mat_silver_ore", price: 9 }
    ]
  },
  {
    id: "driftmonger_sael",
    name: "Driftmonger Sael",
    title: "Sunken Llyr Wares",
    greeting: "Everything here washed up from somewhere. Doesn't make it worth less.",
    sells: [
      { itemId: "potion_minor_health", price: 8 },
      { itemId: "mat_essence", price: 3 },
      { itemId: "mat_moonpetal", price: 10 }
    ]
  },
  {
    id: "cairntrader_yune",
    name: "Cairn-Trader Yune",
    title: "Mourncrown Waystall",
    greeting: "Don't linger past dusk. Buy what you need and go.",
    sells: [
      { itemId: "potion_minor_health", price: 8 },
      { itemId: "potion_greater_health", price: 20 },
      { itemId: "mat_silver_ore", price: 9 }
    ]
  },
  {
    id: "provisioner_denna",
    name: "Archive Provisioner Denna",
    title: "Spirechain Stores",
    greeting: "Licensed by the Order. Priced accordingly.",
    sells: [
      { itemId: "potion_minor_resource", price: 8 },
      { itemId: "mat_essence", price: 3 },
      { itemId: "mat_starlight_essence", price: 28 }
    ]
  },
  {
    id: "fringe_trader_oskar",
    name: "Fringe Trader Oskar",
    title: "Frayedge Waystall",
    greeting: "Out here, gold's the only thing that hasn't started whispering back.",
    sells: [
      { itemId: "potion_elixir_full_moon", price: 35 },
      { itemId: "mat_moonpetal", price: 10 },
      { itemId: "mat_starlight_essence", price: 28 }
    ]
  }
];

export function getVendor(id: string): VendorDef | undefined {
  return VENDORS.find((v) => v.id === id);
}
