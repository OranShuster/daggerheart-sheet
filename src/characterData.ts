import hesinImage from "./assets/hesin.jpg";

export type Card = {
  title: string;
  type?: string;
  recallCost?: number;
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
  level: 2,
  image: hesinImage,
  stats: {
    hp: { current: 3, max: 5 },
    stress: { current: 4, max: 6 },
    hope: { current: 3, max: 6 },
    armor: { current: 3, max:4 },
    evasion: 12,
  },
  attributes: {
    agility: { value: 0, marked: false },
    strength: { value: -1, marked: false },
    finesse: { value: 1, marked: false },
    instinct: { value: 1, marked: true },
    presence: { value: 3, marked: true, isMagicStat: true },
    knowledge: { value: 1, marked: false },
  },
  thresholds: { minor: 10, major: 19 }
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
  },
  {
    title: "Experiences",
    text: "**Loner**: +2\n\n**One with nature**: +2\n\n**Calming music**: +2\n\n**Coins**: +1 City,Wealth,Hunting"
  }

];


// --- Equipment Items ---
export const equipmentItems: Card[] = [
  {
    title: "Improved Scepter",
    text: "Presence Far\n\nD6+3 Magical\n\n**Versatile**: This weapon can also be used with these statistics—Presence, Melee, d8+3."
  },
  {
    title: "Improved Gambeson Armor",
    text: "Base Thrsholds 7/16\n\n+1 to evasion"
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
  },
  {
    title: "Gold",
    text: "5 Handfuls\n\n2 Bags"
  }
];

// --- Right Column Cards (Domain Cards) ---
export const domainCards: Card[] = [
  {
    title: "Inspirational Words",
    type: "Level 1 Grace Domain",
    recallCost: 1,
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
    recallCost: 2,
    text: `**Slumber**: Make a Spellcast Roll against a target within *Very Close range*.
On a success, they're Asleep until they take damage or the GM spends a Fear on their turn to clear this condition.

* **Arcane Barrage**: *Once per rest*, spend any number of Hope and shoot magical projectiles that strike a target of your choice within Close range. Roll a number of d6s equal to the Hope spent and deal that much magic damage to the target.

* **Telepathy**: Spend a Hope to open a line of mental communication with one target you can see. This connection lasts until your next rest or you cast Telepathy again.`
  },
  {
    title: "Book of Vagras",
    type: "Level 2 Codex Grimoire",
    recallCost: 2,
    text: `**Runic Lock:** Make a **Spellcast Roll (15)** on an object you’re touching that can close (such as a lock, chest, or box).
    **Once per rest** on a success, you can lock the object so it can only be opened by creatures of your choice.
    Someone with access to magic and an hour of time to study the spell can break it.

    **Arcane Door:** When you have no adversaries within Melee range, make a Spellcast Roll (13).
    On a success, **spend a Hope** to create a portal from where you are to a point within Far range you can see.
    It closes once a creature has passed through it.

    **Reveal:** Make a Spellcast Roll. If there is anything magically hidden within Close range, it is revealed.`
  },
  {
    title: "Troublemaker",
    type: "Level 2 Grace Ability",
    recallCost: 2,
    text: `When you taunt or provoke a target within Far range, make a **Presence** Roll against them.\n\n**Once per rest** on a success, roll a number of d4s equal to your **Proficiency**.\n\nThe target must mark **Stress** equal to the highest result rolled.`
  },
  {
    title: "Book Of Norai",
    type: "Level 3 Codex Grimoire",
    recallCost: 2,
    text: `**Mystic Tether:** Make a Spellcast Roll against a target within Far range. On a success, they’re temporarily Restrained and must mark a Stress. If you target a flying creature, this spell grounds and temporarily Restrains them.\n\n**Fireball:** Make a Spellcast Roll against a target within Very Far range. On a success, hurl a sphere of fire toward them that explodes on impact. The target and all creatures within Very Close range of them must make a Reaction Roll (13). Targets who fail take 4d20+5 magic damage using your Proficiency. Targets who succeed take half damage.`
  }
];

// --- Level Up Data ---
// This represents the character at level 3
// When leveling up: HP/armor/stress/hope are preserved, domain cards are combined, attributes/evasion/thresholds are overridden
export const levelUpCharacter: Partial<CharacterData> = {
  level: 4,
  stats: {
    hp: { current: 3, max: 5 },
    stress: { current: 4, max: 6 },
    hope: { current: 3, max: 6 },
    armor: { current: 3, max: 4 },
    evasion: 12,
  },
  attributes: {
    agility: { value: 0, marked: false },
    strength: { value: -1, marked: false },
    finesse: { value: 1, marked: false },
    instinct: { value: 2, marked: true },
    presence: { value: 3, marked: true, isMagicStat: true },
    knowledge: { value: 1, marked: false },
  },
  thresholds: { minor: 11, major: 20 }
};

export const levelUpDomainCards: Card[] = [

];
