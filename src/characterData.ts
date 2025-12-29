import hesinImage from "./assets/hesin.jpg";

export type Card = {
  title: string;
  type?: string;
  text: string;
};

export type CharacterStat = {
  value: number;  // -1 to +5
  marked: boolean;
  isMagicStat?: boolean;
};

export type CharacterData = {
  name: string;
  class: string;
  level: number;
  image: string;
  stats: {
    hp: { current: number; max: number };
    stress: { current: number; max: number };
    hope: { current: number; max: number };
    armor: { current: number; max: number };
    evasion: number;
  };
  attributes: {
    agility: CharacterStat;
    strength: CharacterStat;
    finesse: CharacterStat;
    instinct: CharacterStat;
    presence: CharacterStat;
    knowledge: CharacterStat;
  };
  thresholds: { minor: number; major: number; };
};

export const initialCharacter: CharacterData = {
  name: "Hesin",
  class: "Bard",
  level: 1,
  image: hesinImage,
  stats: {
    hp: { current: 6, max: 5 },
    stress: { current: 0, max: 6 },
    hope: { current: 2, max: 6 },
    armor: { current: 2, max: 3 },
    evasion: 11,
  },
  attributes: {
    agility: { value: 0, marked: false },
    strength: { value: -1, marked: false },
    finesse: { value: +1, marked: false },
    instinct: { value: 0, marked: false },
    presence: { value: 2, marked: false, isMagicStat: true },
    knowledge: { value: 1, marked: false },
  },
  thresholds: { minor: 6, major: 12 }
};

// --- Left Column Cards (Ancestry, Community, etc) ---
export const traitCards: Card[] = [
  {
    title: "Elf (Ancestry)",
    text: "**Quick Reactions**\n\nMark a Stress to gain advantage on a reaction roll.\n\n**Celestial Trance**\n\nDuring a rest, you can drop into a trance to choose an additional downtime move"
  },
  {
    title: "Wanderborne (Community)",
    text: "**Nomadic Pack**\n\nAdd a Nomadic Pack to your inventory.\n\n**Once per session**, you can **spend a Hope** to reach into this pack and pull out a mundane item that's useful to your situation.\n\nWork with the GM to figure out what item you take out."
  },
  {
    title: "Troubadour (Subclass)",
    text: "**Gifted Performer**\n\nDescribe how you perform for others. You can play each song *once per long rest*:\n\n  * **Relaxing Song**: You and all allies within *Close range* clear a Hit Point\n\n  * **Epic Song**: Make a target within *Close range* temporarily Vulnerable\n\n  * **Heartbreaking Song**: You and all allies within *Close range gain a Hope*"
  }
];


// --- Equipment Items ---
export const equipmentItems: Card[] = [
  {
    title: "Rapier",
    text: "Presence Melee\n\nD8 Physical\n\n**Quick**: When you make an attack, you can *mark a Stress* to target another creature within range."
  },
  {
    title: "Hand Crossbow",
    text: "Finesse Far\n\nD6+1 Physical"
  },
  {
    title: "Gambeson Armor",
    text: "Base Thrsholds 5/11\n\n+1 to evasion"
  }
];

// --- Inventory Items ---
export const inventoryItems: Card[] = [
  {
    title: "50ft of rope",
    text: ""
  },
  {
    title: "Basic supplies",
    text:""
  },
  {
    title: "Torch",
    text: ""
  },
  {
    title: "Romance Novel",
    text: ""
  }
];

// --- Right Column Cards (Domain Cards) ---
export const domainCards: Card[] = [
  {
    title: "Inspirational Words",
    type: "Level 1 Grace Domain",
    text: `Your speech is imbued with power.\n
After a *long rest*, place a number of tokens on this card equal to your **Presence**.\n
When you speak with an ally,\n you can spend a token from this card to give them one benefit from the
following options:

* Your ally clears a Stress.
* Your ally clears a Hit Point.
* Your ally gains a Hope.

When you take a *long rest*, clear all unspent tokens.`
  },
  {
    title: "Book of Illiat",
    type: "Level 1 Codex Grimoire",
    text: `* **Slumber**: Make a Spellcast Roll against a target within *Very Close range*.
On a success, they're Asleep until they take damage or the GM spends a Fear on their turn to clear this condition.

* **Arcane Barrage**: *Once per rest*, spend any number of Hope and shoot magical projectiles that strike a target of your choice within Close range. Roll a number of d6s equal to the Hope spent and deal that much magic damage to the target.

* **Telepathy**: Spend a Hope to open a line of mental communication with one target you can see. This connection lasts until your next rest or you cast Telepathy again.`
  }
];

