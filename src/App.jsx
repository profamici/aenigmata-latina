import React, { useState, useEffect } from 'react';
import bgImage from './assets/background.jpeg';

// ==========================================
// DATABASE DIDATTICO
// ==========================================

const PAIRS_DB = [
    { pairId: 1, lat: "in insula", ita: "nell'isola (stato in luogo)" },
    { pairId: 2, lat: "ad oppidum", ita: "verso la città (moto a luogo)" },
    { pairId: 3, lat: "e silva", ita: "fuori dal bosco (moto da luogo)" },
    { pairId: 4, lat: "per vias", ita: "per le strade (moto per luogo)" },
    { pairId: 5, lat: "Romae", ita: "a Roma (locativo)" },
    { pairId: 6, lat: "Athenis", ita: "ad Atene (stato in luogo)" },
    { pairId: 7, lat: "Corinthum", ita: "verso Corinto (moto a luogo)" },
    { pairId: 8, lat: "Delo", ita: "da Delo (moto da luogo)" },
    { pairId: 9, lat: "pueri boni", ita: "i ragazzi buoni (nom. pl.)" },
    { pairId: 10, lat: "puellis pulchris", ita: "alle belle ragazze (dat. pl.)" },
    { pairId: 11, lat: "magistrum severum", ita: "il maestro severo (acc. sing.)" },
    { pairId: 12, lat: "clarorum virorum", ita: "degli uomini famosi (gen. pl.)" },
    { pairId: 13, lat: "sumus", ita: "noi siamo" },
    { pairId: 14, lat: "eratis", ita: "voi eravate" },
    { pairId: 15, lat: "laudabant", ita: "essi lodavano" },
    { pairId: 16, lat: "monet", ita: "egli ammonisce" },
    { pairId: 17, lat: "legebam", ita: "io leggevo" },
    { pairId: 18, lat: "auditis", ita: "voi ascoltate" },
    { pairId: 19, lat: "in agros", ita: "verso i campi (moto a luogo)" },
    { pairId: 20, lat: "a castris", ita: "dall'accampamento (moto da luogo)" },
    { pairId: 21, lat: "domi", ita: "a casa (locativo)" },
    { pairId: 22, lat: "multis curis", ita: "con molti affanni (abl. pl.)" },
    { pairId: 23, lat: "amicorum verorum", ita: "dei veri amici (gen. pl.)" },
    { pairId: 24, lat: "veniebamus", ita: "noi venivamo" },
    { pairId: 25, lat: "dicebas", ita: "tu dicevi" },
    { pairId: 26, lat: "vident", ita: "essi vedono" },
    { pairId: 27, lat: "parant", ita: "essi preparano" },
    { pairId: 28, lat: "in horto", ita: "nel giardino (stato in luogo)" },
    { pairId: 29, lat: "incolae clari", ita: "gli abitanti famosi (nom. pl.)" },
    { pairId: 30, lat: "nautam peritum", ita: "il marinaio esperto (acc. sing.)" }
];

const SENTENCES_DB = [
    {
        latin: "Dum agricolae in agris laborant, pueri in horto ludebant et puellae rosarum coronas parabant.",
        italian: "Mentre i contadini lavorano nei campi, i fanciulli giocavano nel giardino e le ragazze preparavano corone di rose."
    },
    {
        latin: "Legati e castris Romanis veniunt et ad oppidum contendunt, sed incolae portas claudunt.",
        italian: "Gli ambasciatori vengono dall'accampamento romano e si dirigono verso la città, ma gli abitanti chiudono le porte."
    },
    {
        latin: "Romae multa templa erant, sed in parvis oppidis viri deis modicas aras aedificabant.",
        italian: "A Roma c'erano molti templi, ma nelle piccole città gli uomini costruivano modesti altari per gli dei."
    },
    {
        latin: "Nautae, periti periculorum pelagi, ex insula in patriam navigabant et ad oras tutas perveniebant.",
        italian: "I marinai, esperti dei pericoli del mare, navigavano dall'isola verso la patria e giungevano a rive sicure."
    },
    {
        latin: "Syracusis tyrannus saevus imperabat, itaque multi boni viri e patria fugiebant et in alias terras discedebant.",
        italian: "A Siracusa comandava un tiranno crudele, perciò molti uomini buoni fuggivano dalla patria e si allontanavano verso altre terre."
    }
];

// Utility per mescolare array (Fisher-Yates)
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ==========================================
// COMPONENTE PRINCIPALE
// ==========================================

export default function App() {
    // Stati generali
    const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'boss'
    const [teams, setTeams] = useState([]);
    const [numTeams, setNumTeams] = useState(2);
    const [teamNamesInput, setTeamNamesInput] = useState(["Squadra 1", "Squadra 2"]);
    
    // Stati di gioco
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    
    // Boss
    const [currentSentence, setCurrentSentence] = useState(null);
    const [showTranslation, setShowTranslation] = useState(false);

    // Stile globale per lo sfondo a tema romano
    const romanBackgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.50), rgba(15, 23, 42, 0.80)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    };

    // ==========================================
    // LOGICA DI SETUP
    // ==========================================

    const handleNumTeamsChange = (e) => {
        const val = parseInt(e.target.value) || 2;
        setNumTeams(val);
        setTeamNamesInput(Array(val).fill("").map((_, i) => `Squadra ${i + 1}`));
    };

    const handleTeamNameChange = (index, value) => {
        const newNames = [...teamNamesInput];
        newNames[index] = value;
        setTeamNamesInput(newNames);
    };

    const startGame = () => {
        // 1. Inizializza squadre
        const initialTeams = teamNamesInput.map((name, i) => ({
            id: i,
            name: name.trim() || `Squadra ${i + 1}`,
            score: 0
        }));
        setTeams(initialTeams);
        setCurrentTeamIndex(0);

        // 2. Seleziona frase boss
        const randomSentence = SENTENCES_DB[Math.floor(Math.random() * SENTENCES_DB.length)];
        setCurrentSentence(randomSentence);
        setShowTranslation(false);

        // 3. Prepara carte (12 coppie = 24 carte totali)
        const selectedPairs = shuffleArray(PAIRS_DB).slice(0, 12);
        let deck = [];
        selectedPairs.forEach(pair => {
            deck.push({ id: `${pair.pairId}_lat`, pairId: pair.pairId, text: pair.lat, isFlipped: false, isMatched: false, type: 'lat' });
            deck.push({ id: `${pair.pairId}_ita`, pairId: pair.pairId, text: pair.ita, isFlipped: false, isMatched: false, type: 'ita' });
        });
        
        setCards(shuffleArray(deck));
        setFlippedIndices([]);
        setGameState('playing');
        setIsLocked(false);
    };

    // ==========================================
    // LOGICA DI GIOCO (TURNI E MEMORY)
    // ==========================================

    const handleCardClick = (index) => {
        // Previene click se il board è bloccato, se la carta è già girata/risolta
        if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlippedIndices = [...flippedIndices, index];
        setFlippedIndices(newFlippedIndices);

        // Se due carte sono state scoperte
        if (newFlippedIndices.length === 2) {
            setIsLocked(true); // Blocca click aggiuntivi durante l'animazione
            const [firstIndex, secondIndex] = newFlippedIndices;

            if (newCards[firstIndex].pairId === newCards[secondIndex].pairId) {
                // MATCH CORRETTO
                setTimeout(() => {
                    setCards(prev => {
                        const matchedCards = [...prev];
                        matchedCards[firstIndex].isMatched = true;
                        matchedCards[secondIndex].isMatched = true;
                        return matchedCards;
                    });
                    
                    setTeams(prev => {
                        const updated = [...prev];
                        updated[currentTeamIndex].score += 1;
                        return updated;
                    });
                    
                    setFlippedIndices([]);
                    setIsLocked(false);
                }, 1200); // Pausa per far leggere la coppia prima di farla sparire
            } else {
                // MATCH ERRATO
                setTimeout(() => {
                    setCards(prev => {
                        const resetCards = [...prev];
                        resetCards[firstIndex].isFlipped = false;
                        resetCards[secondIndex].isFlipped = false;
                        return resetCards;
                    });
                    
                    setFlippedIndices([]);
                    setCurrentTeamIndex((prev) => (prev + 1) % teams.length);
                    setIsLocked(false);
                }, 2000); // Pausa più lunga per memorizzare l'errore
            }
        }
    };

    // Controllo fine partita
    useEffect(() => {
        if (cards.length > 0 && cards.every(c => c.isMatched)) {
            // Piccolo delay per far gustare l'ultima carta che sparisce
            const timer = setTimeout(() => {
                setGameState('boss');
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [cards]);

    // ==========================================
    // RENDER: SETUP
    // ==========================================
    if (gameState === 'setup') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 font-sans" style={romanBackgroundStyle}>
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-lg w-full border border-slate-200">
                    <div className="bg-slate-900 p-6 text-center">
                        <h1 className="text-3xl font-serif text-amber-400 font-bold tracking-wider">Aenigmata Latina</h1>
                        <p className="text-slate-300 mt-2 font-medium">Gioco di Memoria e Sintassi</p>
                    </div>
                    <div className="p-8">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Numero di Squadre:</label>
                            <select 
                                value={numTeams} 
                                onChange={handleNumTeamsChange}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            >
                                {[2, 3, 4, 5].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4 mb-8">
                            {teamNamesInput.map((name, i) => (
                                <div key={i}>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nome Squadra {i + 1}</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => handleTeamNameChange(i, e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder={`Squadra ${i + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={startGame}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 uppercase tracking-widest shadow-md"
                        >
                            Inizia la Sfida
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER: GAME BOARD & BOSS
    // ==========================================
    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col font-sans" style={romanBackgroundStyle}>
            
            {/* Header: Punteggi e Turno */}
            <header className="mb-6 flex flex-wrap justify-between items-center bg-slate-800/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-slate-700 gap-4">
                <div className="flex flex-wrap gap-4">
                    {teams.map((team, idx) => (
                        <div 
                            key={team.id} 
                            className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                                currentTeamIndex === idx && gameState === 'playing'
                                ? 'border-amber-400 bg-slate-700 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
                                : 'border-transparent bg-slate-900 opacity-70'
                            }`}
                        >
                            <div className="text-xs uppercase tracking-wider text-slate-400">{team.name}</div>
                            <div className={`text-2xl font-bold ${currentTeamIndex === idx && gameState === 'playing' ? 'text-amber-400' : 'text-slate-200'}`}>
                                {team.score} pt
                            </div>
                        </div>
                    ))}
                </div>
                {gameState === 'playing' && (
                    <div className="text-right flex-shrink-0 bg-amber-900/40 px-6 py-3 rounded-lg border border-amber-900/50">
                        <span className="text-slate-400 text-sm block uppercase tracking-wider mb-1">Turno di</span>
                        <span className="text-amber-400 font-bold text-xl">{teams[currentTeamIndex].name}</span>
                    </div>
                )}
                {gameState === 'boss' && (
                    <div className="text-right">
                        <span className="text-amber-400 font-bold text-xl uppercase tracking-widest">Fase Finale</span>
                    </div>
                )}
            </header>

            {/* Area di Gioco Principale */}
            <main className="flex-grow flex flex-col items-center justify-center relative w-full max-w-7xl mx-auto">
                
                {/* Il contenitore ha aspect-ratio per mantenere la struttura stabile */}
                <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] rounded-2xl overflow-hidden shadow-2xl bg-[#fdf6e3] border-4 border-amber-800">
                    
                    {/* LIVELLO 1: Il Boss Finale (sempre presente ma coperto dalle carte) */}
                    <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12 z-0">
                        {/* Calibrazione finale: testo ingrandito (fino a 6xl) e interlinea dilatata a 1.8 */}
                        <h2 className="w-full text-center text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-amber-950/85 uppercase tracking-widest drop-shadow-sm text-balance leading-relaxed md:leading-[1.8]">
                            {currentSentence.latin}
                        </h2>
                    </div>

                    {/* LIVELLO 2: La Griglia delle Carte */}
                    <div className={`absolute inset-0 z-10 grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-4 p-2 md:p-4 bg-transparent transition-opacity duration-1000 ${gameState === 'boss' ? 'pointer-events-none' : ''}`}>
                        {cards.map((card, index) => (
                            <div 
                                key={card.id}
                                onClick={() => handleCardClick(index)}
                                className={`
                                    relative cursor-pointer transition-all duration-300 transform rounded-xl border-2 shadow-md
                                    flex items-center justify-center p-2 text-center overflow-hidden
                                    ${card.isMatched ? 'opacity-0 scale-90 invisible' : 'opacity-100 scale-100'}
                                    ${card.isFlipped 
                                        ? 'bg-amber-50 border-amber-600 text-amber-950 rotate-0' 
                                    : 'bg-slate-800 border-slate-600 text-transparent hover:bg-slate-700 hover:-translate-y-1'
                                    }
                                `}
                            >
                                {/* Dorso della carta: Immagine e pattern */}
                                {!card.isFlipped && (
                                <div className="absolute inset-0 w-full h-full bg-slate-800">
                                        <img 
                                            src="https://images.unsplash.com/photo-1555985202-12975b0235dc?q=80&w=300&auto=format&fit=crop" 
                                            alt="Dorso Classico" 
                                            className="w-full h-full object-cover opacity-50 mix-blend-overlay hover:opacity-70 hover:scale-110 transition-all duration-500"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    <div className="absolute inset-0 hidden items-center justify-center opacity-30 bg-slate-800">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Testo della carta scoperta */}
                                <span className={`font-medium relative z-10 text-xs sm:text-sm md:text-base lg:text-lg transition-opacity duration-300 ${card.isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                                    {card.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pannello di Controllo Boss (appare quando le carte sono finite) */}
                {gameState === 'boss' && (
                    <div className="mt-8 w-full max-w-3xl bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl animate-fade-in-up">
                        <div className="text-center mb-6">
                            <h3 className="text-xl md:text-2xl font-bold text-amber-400 mb-2 uppercase tracking-widest">Tabula Revelata!</h3>
                            <p className="text-slate-300">Squadre, analizzate i costrutti logici e traducete la frase.</p>
                        </div>
                        
                        {showTranslation ? (
                            <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-amber-500 mb-6">
                                <p className="text-lg text-slate-200 italic font-serif leading-relaxed">
                                    "{currentSentence.italian}"
                                </p>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setShowTranslation(true)}
                                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-4 px-6 rounded-lg transition-colors duration-200 mb-6 border border-slate-600"
                            >
                                Mostra Traduzione (Riservato al Docente)
                            </button>
                        )}

                        <button 
                            onClick={startGame}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 uppercase tracking-widest"
                        >
                            Nuova Partita
                        </button>
                    </div>
                )}
            </main>
            
            <style jsx="true">{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
