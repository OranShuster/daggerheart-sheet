import { StrictMode, useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';
import './App.css';
import { 
  type Card, 
  type CharacterData,
  type CharacterStat,
  initialCharacter, 
  traitCards, 
  inventoryItems, 
  domainCards,
  equipmentItems,
  levelUpCharacter,
  levelUpDomainCards
} from './characterData';
import circleIcon from './assets/circle.png';
import roundIcon from './assets/round.png';

// Types and helpers for localStorage persistence
type SavedStats = {
  hp: number;
  armor: number;
  stress: number;
  hope: number;
};

const STORAGE_KEY = 'daggerheart-character-stats';
const LEVEL_UP_KEY = 'daggerheart-leveled-up';

// Helper to merge character data when leveling up
function mergeCharacterForLevelUp(
  base: CharacterData,
  levelUp: Partial<CharacterData>,
  currentStats: { hp: number; armor: number; stress: number; hope: number }
): CharacterData {
  return {
    ...base,
    level: levelUp.level ?? base.level,
    stats: {
      // Preserve current values for HP, armor, stress, hope
      hp: { 
        current: Math.min(currentStats.hp, levelUp.stats?.hp.max ?? base.stats.hp.max), 
        max: levelUp.stats?.hp.max ?? base.stats.hp.max 
      },
      stress: { 
        current: Math.min(currentStats.stress, levelUp.stats?.stress.max ?? base.stats.stress.max), 
        max: levelUp.stats?.stress.max ?? base.stats.stress.max 
      },
      hope: { 
        current: Math.min(currentStats.hope, levelUp.stats?.hope.max ?? base.stats.hope.max), 
        max: levelUp.stats?.hope.max ?? base.stats.hope.max 
      },
      armor: { 
        current: Math.min(currentStats.armor, levelUp.stats?.armor.max ?? base.stats.armor.max), 
        max: levelUp.stats?.armor.max ?? base.stats.armor.max 
      },
      // Override evasion
      evasion: levelUp.stats?.evasion ?? base.stats.evasion,
    },
    // Override attributes
    attributes: levelUp.attributes ?? base.attributes,
    // Override thresholds
    thresholds: levelUp.thresholds ?? base.thresholds,
  };
}

function loadSavedStats(): SavedStats | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as SavedStats;
    }
  } catch (e) {
    console.error('Failed to load saved stats:', e);
  }
  return null;
}

function saveStats(stats: SavedStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

// Card Title Component for Hidden Cards
type CardTitleProps = {
  card: Card;
  showType?: boolean;
};

function CardTitle({ card, showType = true }: CardTitleProps) {
  return (
    <div className="card-deck-title">
      {showType && card.type && <small>{card.type}</small>}
      <h3>{card.title}</h3>
    </div>
  );
}

// Card Deck Component for Mobile
type CardDeckProps = {
  cards: Card[];
  title: string;
  variant?: 'default' | 'domain' | 'inventory' | 'equipment';
};

function CardDeck({ cards, title, variant = 'default' }: CardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (isAnimating) return;
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setIsAnimating(true);
      setExitingIndex(currentIndex);
      setSwipeDirection(isLeftSwipe ? 'left' : 'right');
      
      // Calculate next index
      const nextIndex = isLeftSwipe
        ? (currentIndex + 1) % cards.length
        : (currentIndex - 1 + cards.length) % cards.length;
      
      // After animation completes, update the index
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setIsAnimating(false);
        setSwipeDirection(null);
        setExitingIndex(null);
      }, 350);
    }
  };

  // Calculate visible order: current card on top, then cards in order after it
  const getCardOrder = (index: number) => {
    // How many positions after current card
    let offset = index - currentIndex;
    if (offset < 0) offset += cards.length;
    return offset;
  };

  return (
    <div className="card-deck">
      <h2>{title}</h2>
      <div 
        className="card-deck-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {cards.map((card, index) => {
          const order = getCardOrder(index);
          const isTop = order === 0;
          const isExiting = exitingIndex === index;
          
          // Show all cards in the stack
          const isInStack = order > 0;
          const shouldShow = isTop || isInStack || isExiting;
          
          // Calculate stack-offset: 0 for bottom card, increasing to top
          const maxVisibleOrder = cards.length - 1;
          const stackPosition = isTop ? maxVisibleOrder : (maxVisibleOrder - order);
          
          // During animation, adjust positions
          let animationClass = '';
          if (isAnimating) {
            if (isExiting) {
              animationClass = swipeDirection === 'left' ? 'card-exit-left' : 'card-exit-right';
            } else if (isInStack || (swipeDirection === 'left' && order === 1)) {
              animationClass = 'card-slide-up';
            }
          }
          
          let variantClass = '';
          if (variant === 'equipment') {
            variantClass = 'equipment-card';
          } else if (variant === 'inventory') {
            variantClass = 'inventory-card';
          } else if (variant === 'domain') {
            variantClass = 'domain-card';
          } else {
            variantClass = '';
          }
          
          return (
            <div
              key={index}
              className={`card-deck-card ${variantClass} ${isTop && !isExiting ? 'card-deck-card-top' : ''} ${isInStack ? 'card-deck-card-stacked' : ''} ${animationClass}`}
              style={{
                zIndex: isTop ? 1 : (10 - order),
                '--stack-offset': stackPosition,
                display: shouldShow ? 'flex' : 'none',
              } as React.CSSProperties}
            >
              {isTop && !isExiting ? (
                <>
                  {variant !== 'inventory' && card.type && <small>{card.type}</small>}
                  {variant === 'domain' && card.recallCost !== undefined && (
                    <small className="recall-cost">Recall Cost: {card.recallCost}</small>
                  )}
                  <h3>{card.title}</h3>
                  <ReactMarkdown>{card.text}</ReactMarkdown>
                </>
              ) : (
                <CardTitle card={card} showType={variant !== 'inventory'} />
              )}
            </div>
          );
        })}
      </div>
      <div className="card-deck-indicator">
        {currentIndex + 1} / {cards.length}
      </div>
    </div>
  );
}

// Attribute Component for the 6 character stats
type AttributeBoxProps = {
  name: string;
  stat: CharacterStat;
};

function AttributeBox({ name, stat }: AttributeBoxProps) {
  const formatValue = (val: number) => (val >= 0 ? `+${val}` : `${val}`);
  
  return (
    <div className="attribute-box">
      <div className="attribute-value">{formatValue(stat.value)}</div>
      <div className="attribute-name">
        {name}
        {stat.isMagicStat && <span className="magic-indicator" title="Spellcast Trait">✨</span>}
      </div>
      <img 
        src={stat.marked ? roundIcon : circleIcon} 
        alt={stat.marked ? 'marked' : 'unmarked'}
        className={`attribute-mark ${stat.marked ? 'marked' : ''}`}
      />
    </div>
  );
}

// Helper Component for the Stat Boxes (HP/Stress/Hope)
type StatBoxProps = {
  label: string;
  current: number;
  max: number;
  color: string;
  icon: string;
  textDark?: boolean;
  editable?: boolean;
  singleValue?: boolean;
  showXWhenEmpty?: boolean;
  onCurrentChange?: (value: number) => void;
};

function StatBox({ label, current, max, color, icon, textDark, editable, singleValue, showXWhenEmpty, onCurrentChange }: StatBoxProps) {
  const textColor = textDark ? '#333' : '#fff';

  const handleIncrement = () => {
    if (editable && !singleValue && current < max) {
      onCurrentChange?.(current + 1);
    }
  };

  const handleDecrement = () => {
    if (editable && !singleValue && current > 0) {
      onCurrentChange?.(current - 1);
    }
  };

  return (
    <div className="stat-box" style={{ backgroundColor: color, color: textColor }}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-controls">
        {editable && !singleValue && (
          <button
            className="stat-arrow stat-arrow-down"
            onClick={handleDecrement}
            disabled={current <= 0}
            style={{ color: textColor }}
          >
            ▼
          </button>
        )}
        <div className="stat-icons">
          {Array.from({ length: Math.min(max, 12) }).map((_, index) => {
            const isFilled = index < current;
            return (
              <span
                key={index}
                className={`stat-icon ${isFilled ? 'stat-icon-filled' : 'stat-icon-empty'} ${showXWhenEmpty ? 'stat-icon-crossed' : ''}`}
                style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
              >
                {icon}
              </span>
            );
          })}
        </div>
        {editable && !singleValue && (
          <button
            className="stat-arrow stat-arrow-up"
            onClick={handleIncrement}
            disabled={current >= max}
            style={{ color: textColor }}
          >
            ▲
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  // Check if mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Level up toggle state with localStorage persistence
  const [isLeveledUp, setIsLeveledUp] = useState(() => {
    try {
      return localStorage.getItem(LEVEL_UP_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleLevelUp = () => {
    setIsLeveledUp(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem(LEVEL_UP_KEY, String(newValue));
      } catch (e) {
        console.error('Failed to save level up state:', e);
      }
      return newValue;
    });
  };

  // Character state initialized from characterData with localStorage persistence
  const [character, setCharacter] = useState<CharacterData>(() => {
    const saved = loadSavedStats();
    if (saved) {
      // Use saved values for current stats
      return {
        ...initialCharacter,
        stats: {
          ...initialCharacter.stats,
          hp: { ...initialCharacter.stats.hp, current: saved.hp },
          armor: { ...initialCharacter.stats.armor, current: saved.armor },
          stress: { ...initialCharacter.stats.stress, current: saved.stress },
          hope: { ...initialCharacter.stats.hope, current: saved.hope },
        }
      };
    } else {
      // No saved data - set current to max and save
      const defaultStats: SavedStats = {
        hp: initialCharacter.stats.hp.max,
        armor: initialCharacter.stats.armor.max,
        stress: initialCharacter.stats.stress.max,
        hope: initialCharacter.stats.hope.max,
      };
      saveStats(defaultStats);
      return {
        ...initialCharacter,
        stats: {
          ...initialCharacter.stats,
          hp: { ...initialCharacter.stats.hp, current: defaultStats.hp },
          armor: { ...initialCharacter.stats.armor, current: defaultStats.armor },
          stress: { ...initialCharacter.stats.stress, current: defaultStats.stress },
          hope: { ...initialCharacter.stats.hope, current: defaultStats.hope },
        }
      };
    }
  });

  // Compute the displayed character based on level up state
  const displayedCharacter = isLeveledUp
    ? mergeCharacterForLevelUp(initialCharacter, levelUpCharacter, {
        hp: character.stats.hp.current,
        armor: character.stats.armor.current,
        stress: character.stats.stress.current,
        hope: character.stats.hope.current,
      })
    : character;

  // Compute the active domain cards (combined when leveled up)
  const activeDomainCards = isLeveledUp
    ? [...domainCards, ...levelUpDomainCards]
    : domainCards;

  // Helper to update a stat and save to localStorage
  const updateStatAndSave = (statKey: 'hp' | 'armor' | 'stress' | 'hope', value: number) => {
    setCharacter(prev => {
      const newCharacter = {
        ...prev,
        stats: { 
          ...prev.stats, 
          [statKey]: { ...prev.stats[statKey], current: value } 
        }
      };
      // Save all current stats to localStorage
      saveStats({
        hp: newCharacter.stats.hp.current,
        armor: newCharacter.stats.armor.current,
        stress: newCharacter.stats.stress.current,
        hope: newCharacter.stats.hope.current,
      });
      return newCharacter;
    });
  };

  return (
    <div className="sheet-container">

      {/* --- MAIN ROW: 3 Columns --- */}
      <div className="main-row">
        {/* --- MIDDLE COLUMN: Stats & Image --- */}
        <div className="column center-column">
          <header className="character-header">
            <h1>{displayedCharacter.name}</h1>
            <span className="header-divider">•</span>
            <span className="subtitle">Lvl {displayedCharacter.level} {displayedCharacter.class}</span>
            <button 
              className={`level-up-toggle ${isLeveledUp ? 'active' : ''}`}
              onClick={toggleLevelUp}
              title={'Toggle level up'}
            >
              ⬆️ Lvl {levelUpCharacter.level}
            </button>
          </header>

          <div className="image-container">
            <img src={displayedCharacter.image} alt="Character" />
          </div>

          <div className="attributes-row">
            <AttributeBox name="Agility" stat={displayedCharacter.attributes.agility} />
            <AttributeBox name="Strength" stat={displayedCharacter.attributes.strength} />
            <AttributeBox name="Finesse" stat={displayedCharacter.attributes.finesse} />
            <AttributeBox name="Instinct" stat={displayedCharacter.attributes.instinct} />
            <AttributeBox name="Presence" stat={displayedCharacter.attributes.presence} />
            <AttributeBox name="Knowledge" stat={displayedCharacter.attributes.knowledge} />
          </div>

          <div className="secondary-stats-line">
            <div className="stat-pill stat-pill-small">Evasion: <strong>{displayedCharacter.stats.evasion}</strong></div>
            <div className="stat-pill stat-pill-small">Damage Thresholds: <strong>{displayedCharacter.thresholds.minor} / {displayedCharacter.thresholds.major}</strong></div>
          </div>

          <div className="stats-grid">
            <StatBox
              label="HP"
              current={displayedCharacter.stats.hp.current}
              max={displayedCharacter.stats.hp.max}
              color="#2d5016"
              icon="❤️"
              editable
              showXWhenEmpty
              onCurrentChange={(value) => updateStatAndSave('hp', value)}
            />
            <StatBox
              label="Stress"
              current={displayedCharacter.stats.stress.current}
              max={displayedCharacter.stats.stress.max}
              color="#a8dadc"
              icon="🧠"
              editable
              onCurrentChange={(value) => updateStatAndSave('stress', value)}
            />
            <StatBox
              label="Hope"
              current={displayedCharacter.stats.hope.current}
              max={displayedCharacter.stats.hope.max}
              color="#f1faee"
              textDark
              icon="⬆️"
              editable
              onCurrentChange={(value) => updateStatAndSave('hope', value)}
            />
            <StatBox
              label="Armor"
              current={displayedCharacter.stats.armor.current}
              max={displayedCharacter.stats.armor.max}
              color="#444"
              icon="🛡️"
              editable
              showXWhenEmpty
              onCurrentChange={(value) => updateStatAndSave('armor', value)}
            />
          </div>
        </div>

        {/* --- LEFT COLUMN: Background/Subclass --- */}
        <div className="column side-column">
          <div className="card-deck-desktop">
            <h2>Traits</h2>
            {traitCards.map((card, index) => (
              <div key={index} className="card">
                <h3>{card.title}</h3>
                <ReactMarkdown>{card.text}</ReactMarkdown>
              </div>
            ))}
          </div>
          {isMobile && <CardDeck cards={traitCards} title="Traits" />}
        </div>

        {/* --- RIGHT COLUMN: Domain Cards --- */}
        <div className="column side-column">
          <div className="card-deck-desktop">
            <h2>Domain</h2>
            {activeDomainCards.map((card, index) => (
              <div key={index} className="card domain-card">
                <small>{card.type}</small>
                {card.recallCost !== undefined && (
                  <small className="recall-cost">Recall Cost: {card.recallCost}</small>
                )}
                <h3>{card.title}</h3>
                <ReactMarkdown>{card.text}</ReactMarkdown>
              </div>
            ))}
          </div>
          {isMobile && <CardDeck cards={activeDomainCards} title="Domain" variant="domain" />}
        </div>
      </div>

      {/* --- EQUIPMENT SECTION --- */}
      <div className="equipment-section">
        {/* Desktop: Horizontal row of cards */}
        <div className="equipment-desktop">
          <h2>Equipment</h2>
          <div className="equipment-row">
            {equipmentItems.map((item, index) => (
              <div key={index} className="card equipment-card">
                <h3>{item.title}</h3>
                <ReactMarkdown>{item.text}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile: Stacked deck */}
        {isMobile && <CardDeck cards={equipmentItems} title="Equipment" variant="equipment" />}
      </div>

      {/* --- INVENTORY SECTION --- */}
      <div className="inventory-section">
        {/* Desktop: Horizontal row of cards */}
        <div className="inventory-desktop">
          <h2>Inventory</h2>
          <div className="inventory-row">
            {inventoryItems.map((item, index) => (
              <div key={index} className="card inventory-card">
                <h3>{item.title}</h3>
                <ReactMarkdown>{item.text}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile: Stacked deck */}
        {isMobile && <CardDeck cards={inventoryItems} title="Inventory" variant="inventory" />}
      </div>

    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
