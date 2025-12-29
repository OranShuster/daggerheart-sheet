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
  equipmentItems
} from './characterData';

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
  onToggleMark?: () => void;
};

function AttributeBox({ name, stat, onToggleMark }: AttributeBoxProps) {
  const formatValue = (val: number) => (val >= 0 ? `+${val}` : `${val}`);
  
  return (
    <div className="attribute-box">
      <div className="attribute-value">{formatValue(stat.value)}</div>
      <div className="attribute-name">
        {name}
        {stat.isMagicStat && <span className="magic-indicator" title="Spellcast Trait">✨</span>}
      </div>
      <button 
        className={`attribute-mark ${stat.marked ? 'marked' : ''}`}
        onClick={onToggleMark}
        title={stat.marked ? 'Unmark' : 'Mark'}
      >
        {stat.marked ? '●' : '○'}
      </button>
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
  onCurrentChange?: (value: number) => void;
};

function StatBox({ label, current, max, color, icon, textDark, editable, singleValue, onCurrentChange }: StatBoxProps) {
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
        {!singleValue && (
          <span className="stat-value-box">
            {current} / {max}
          </span>
        )}
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
                className={`stat-icon ${isFilled ? 'stat-icon-filled' : 'stat-icon-empty'}`}
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

  // Character state initialized from characterData
  const [character, setCharacter] = useState<CharacterData>(initialCharacter);

  return (
    <div className="sheet-container">

      {/* --- MAIN ROW: 3 Columns --- */}
      <div className="main-row">
        {/* --- MIDDLE COLUMN: Stats & Image --- */}
        <div className="column center-column">
          <header className="character-header">
            <h1>{character.name}</h1>
            <span className="header-divider">•</span>
            <span className="subtitle">Lvl {character.level} {character.class}</span>
          </header>

          <div className="image-container">
            <img src={character.image} alt="Character" />
          </div>

          <div className="attributes-row">
            <AttributeBox 
              name="Agility" 
              stat={character.attributes.agility}
              onToggleMark={() => setCharacter(prev => ({
                ...prev,
                attributes: { 
                  ...prev.attributes, 
                  agility: { ...prev.attributes.agility, marked: !prev.attributes.agility.marked } 
                }
              }))}
            />
            <AttributeBox 
              name="Strength" 
              stat={character.attributes.strength}
              onToggleMark={() => setCharacter(prev => ({
                ...prev,
                attributes: { 
                  ...prev.attributes, 
                  strength: { ...prev.attributes.strength, marked: !prev.attributes.strength.marked } 
                }
              }))}
            />
            <AttributeBox 
              name="Finesse" 
              stat={character.attributes.finesse}
              onToggleMark={() => setCharacter(prev => ({
                ...prev,
                attributes: { 
                  ...prev.attributes, 
                  finesse: { ...prev.attributes.finesse, marked: !prev.attributes.finesse.marked } 
                }
              }))}
            />
            <AttributeBox 
              name="Instinct" 
              stat={character.attributes.instinct}
              onToggleMark={() => setCharacter(prev => ({
                ...prev,
                attributes: { 
                  ...prev.attributes, 
                  instinct: { ...prev.attributes.instinct, marked: !prev.attributes.instinct.marked } 
                }
              }))}
            />
            <AttributeBox 
              name="Presence" 
              stat={character.attributes.presence}
              onToggleMark={() => setCharacter(prev => ({
                ...prev,
                attributes: { 
                  ...prev.attributes, 
                  presence: { ...prev.attributes.presence, marked: !prev.attributes.presence.marked } 
                }
              }))}
            />
            <AttributeBox 
              name="Knowledge" 
              stat={character.attributes.knowledge}
              onToggleMark={() => setCharacter(prev => ({
                ...prev,
                attributes: { 
                  ...prev.attributes, 
                  knowledge: { ...prev.attributes.knowledge, marked: !prev.attributes.knowledge.marked } 
                }
              }))}
            />
          </div>

          <div className="secondary-stats-line">
            <div className="stat-pill stat-pill-small">Evasion: <strong>{character.stats.evasion}</strong></div>
            <div className="stat-pill stat-pill-small">Damage Thresholds: <strong>{character.thresholds.minor} / {character.thresholds.major}</strong></div>
          </div>

          <div className="stats-grid">
            <StatBox
              label="HP"
              current={character.stats.hp.current}
              max={character.stats.hp.max}
              color="#2d5016"
              icon="❤️"
              editable
              onCurrentChange={(value) => setCharacter(prev => ({
                ...prev,
                stats: { ...prev.stats, hp: { ...prev.stats.hp, current: value } }
              }))}
            />
            <StatBox
              label="Stress"
              current={character.stats.stress.current}
              max={character.stats.stress.max}
              color="#a8dadc"
              icon="🧠"
              editable
              onCurrentChange={(value) => setCharacter(prev => ({
                ...prev,
                stats: { ...prev.stats, stress: { ...prev.stats.stress, current: value } }
              }))}
            />
            <StatBox
              label="Hope"
              current={character.stats.hope.current}
              max={character.stats.hope.max}
              color="#f1faee"
              textDark
              icon="⬆️"
              editable
              onCurrentChange={(value) => setCharacter(prev => ({
                ...prev,
                stats: { ...prev.stats, hope: { ...prev.stats.hope, current: value } }
              }))}
            />
            <StatBox
              label="Armor"
              current={character.stats.armor.current}
              max={character.stats.armor.max}
              color="#444"
              icon="🛡️"
              editable
              onCurrentChange={(value) => setCharacter(prev => ({
                ...prev,
                stats: { ...prev.stats, armor: { ...prev.stats.armor, current: value } }
              }))}
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
            {domainCards.map((card, index) => (
              <div key={index} className="card domain-card">
                <small>{card.type}</small>
                <h3>{card.title}</h3>
                <ReactMarkdown>{card.text}</ReactMarkdown>
              </div>
            ))}
          </div>
          {isMobile && <CardDeck cards={domainCards} title="Domain" variant="domain" />}
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
