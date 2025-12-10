import './App.css';

function App() {
  // --- Character Data (You can edit this!) ---
  const character = {
    name: "Garrick The Brave",
    class: "Warrior",
    level: 1,
    image: "https://placehold.co/400x400/333/FFF?text=Character+Img", // Replace with your image URL
    stats: {
      hp: { current: 6, max: 6 },
      stress: { current: 0, max: 5 },
      hope: { current: 2, max: 5 },
      armor: 2,
      evasion: 8,
    },
    thresholds: { minor: 5, major: 10, severe: 15 }
  };

  // --- Left Column Cards (Ancestry, Community, etc) ---
  const leftCards = [
    { title: "Human (Ancestry)", text: "Gain an extra Hope at the start of a session." },
    { title: "Ridgeborne (Community)", text: "+1 to Strength or Agility." },
    { title: "Slayer (Subclass)", text: "When you deal damage to an enemy with max HP, add +2 damage." }
  ];

  // --- Right Column Cards (Domain Cards) ---
  const rightCards = [
    { title: "Combat Training", type: "Bone Domain", text: "Take 1 Stress to reroll a damage die." },
    { title: "Shield Wall", type: "Blade Domain", text: "Spend 1 Hope to add +2 to your Armor score for one minute." }
  ];

  return (
    <div className="sheet-container">
      
      {/* --- LEFT COLUMN: Background/Subclass --- */}
      <div className="column side-column">
        <h2>Traits</h2>
        {leftCards.map((card, index) => (
          <div key={index} className="card">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>

      {/* --- MIDDLE COLUMN: Stats & Image --- */}
      <div className="column center-column">
        <header>
          <h1>{character.name}</h1>
          <span className="subtitle">Lvl {character.level} {character.class}</span>
        </header>

        <div className="image-container">
          <img src={character.image} alt="Character" />
        </div>

        <div className="stats-grid">
          <StatBox label="HP" current={character.stats.hp.current} max={character.stats.hp.max} color="#e63946" />
          <StatBox label="Stress" current={character.stats.stress.current} max={character.stats.stress.max} color="#a8dadc" />
          <StatBox label="Hope" current={character.stats.hope.current} max={character.stats.hope.max} color="#f1faee" textDark />
        </div>

        <div className="secondary-stats">
          <div className="stat-pill">Armor: <strong>{character.stats.armor}</strong></div>
          <div className="stat-pill">Evasion: <strong>{character.stats.evasion}</strong></div>
        </div>
        
        <div className="thresholds">
          <small>Damage Thresholds: {character.thresholds.minor} / {character.thresholds.major} / {character.thresholds.severe}</small>
        </div>
      </div>

      {/* --- RIGHT COLUMN: Domain Cards --- */}
      <div className="column side-column">
        <h2>Domain Deck</h2>
        {rightCards.map((card, index) => (
          <div key={index} className="card domain-card">
            <small>{card.type}</small>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

// Helper Component for the Stat Boxes (HP/Stress/Hope)
type StatBoxProps = {
  label: string;
  current: number;
  max: number;
  color: string;
  textDark?: boolean;
};

function StatBox({ label, current, max, color, textDark }: StatBoxProps) {
  return (
    <div className="stat-box" style={{ backgroundColor: color, color: textDark ? '#333' : '#fff' }}>
      <span className="stat-label">{label}</span>
      <div className="stat-value">
        <span>{current}</span>
        <span className="stat-max">/{max}</span>
      </div>
    </div>
  );
}

export default App;