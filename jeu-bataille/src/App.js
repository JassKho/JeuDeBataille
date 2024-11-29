import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [deck, setDeck] = useState(null);
  const [playerCard, setPlayerCard] = useState(null);
  const [computerCard, setComputerCard] = useState(null);
  const [nextPlayerCards, setNextPlayerCards] = useState([]);
  const [playerDeck, setPlayerDeck] = useState([]);
  const [computerDeck, setComputerDeck] = useState([]);
  const [burnedCards, setBurnedCards] = useState([]);
  const [burnedCardNames, setBurnedCardNames] = useState([]);
  const [winner, setWinner] = useState("");
  const [battleMessage, setBattleMessage] = useState("");
  const [remainingCards, setRemainingCards] = useState(0);
  const [burnCount, setBurnCount] = useState(0);

  useEffect(() => {
    axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => {
        setDeck(response.data);
        drawInitialCards(response.data.deck_id);
      })
      .catch(error => console.log(error));
  }, []);

  const drawInitialCards = (deck_id) => {
    axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=52`)
      .then(response => {
        const cards = response.data.cards;
        setPlayerDeck(cards.slice(0, 26));
        setComputerDeck(cards.slice(26, 52));
        setRemainingCards(52); // Fixed maximum number of cards
        setNextPlayerCards(cards.slice(26, 31));
      })
      .catch(error => console.log(error));
  };

  const calculateCardValue = (value) => {
    const values = {
      "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
      "8": 8, "9": 9, "10": 10, "JACK": 11,
      "QUEEN": 12, "KING": 13, "ACE": 14
    };
    return values[value];
  };

  const selectPlayerCard = (card) => {
    if (playerDeck.length === 0 || computerDeck.length === 0) {
      setWinner(playerDeck.length > computerDeck.length ? "Le joueur gagne la partie !" : "L'ordinateur gagne la partie !");
      return;
    }

    const localBurnedCards = [...burnedCards];
    const localBurnedCardNames = [...burnedCardNames];
    const playerCurrentCard = card;
    const computerCurrentCard = computerDeck.shift();

    const playerCardValue = calculateCardValue(playerCurrentCard.value);
    const computerCardValue = calculateCardValue(computerCurrentCard.value);

    localBurnedCards.push(playerCurrentCard, computerCurrentCard);
    localBurnedCardNames.push(playerCurrentCard.value, computerCurrentCard.value);

    setBurnedCardNames(localBurnedCardNames);
    setBurnedCards(localBurnedCards);
    setBurnCount(prevCount => prevCount + 2);

    if (burnCount === 5) {
      setBurnedCards([]);
      setBurnedCardNames([]);
      setBurnCount(0);
    }

    if (playerCardValue === computerCardValue) {
      if (playerCurrentCard.value === "ACE" && computerCurrentCard.value === "ACE") {
        handleAceBattle(localBurnedCards, localBurnedCardNames);
        return;
      }
      setBattleMessage("Égalité ! Les cartes sont redistribuées.");
      setPlayerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
      setComputerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
    } else if (playerCardValue > computerCardValue) {
      setPlayerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
      setBattleMessage("");
    } else {
      setComputerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
      setBattleMessage("");
    }

    setRemainingCards(playerDeck.length + computerDeck.length + burnedCards.length);
    setPlayerCard(playerCurrentCard);
    setComputerCard(computerCurrentCard);

    setNextPlayerCards(playerDeck.slice(0, 5));
  };

  const handleAceBattle = (localBurnedCards, localBurnedCardNames) => {
    if (playerDeck.length === 0 || computerDeck.length === 0) {
      setWinner(playerDeck.length > computerDeck.length ? "Le joueur gagne la partie !" : "L'ordinateur gagne la partie !");
      return;
    }

    const playerExtraCard = playerDeck.shift();
    const computerExtraCard = computerDeck.shift();

    const playerExtraValue = calculateCardValue(playerExtraCard.value);
    const computerExtraValue = calculateCardValue(computerExtraCard.value);

    localBurnedCards.push(playerExtraCard, computerExtraCard);
    localBurnedCardNames.push(playerExtraCard.value, computerExtraCard.value);

    if (playerExtraValue > computerExtraValue) {
      setPlayerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
      setBattleMessage("Bataille d'As : Le joueur remporte le point !");
    } else if (playerExtraValue < computerExtraValue) {
      setComputerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
      setBattleMessage("Bataille d'As : L'ordinateur remporte le point !");
    } else {
      setBattleMessage("Bataille d'As : Égalité ! Les cartes sont redistribuées.");
      setPlayerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
      setComputerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
    }

    setRemainingCards(playerDeck.length + computerDeck.length + burnedCards.length);
    setBurnedCards([]);
    setBurnedCardNames([]);
    setBurnCount(0);
    setPlayerCard(playerExtraCard);
    setComputerCard(computerExtraCard);

    setNextPlayerCards(playerDeck.slice(0, 5));
  };

  const playRound = () => {
    if (nextPlayerCards.length > 0) {
      selectPlayerCard(nextPlayerCards[0]);
    }
  };

  return (
    <div className="app">
      <h1>Simple Bataille</h1>
      {winner ? (
        <p className="winner">{winner}</p>
      ) : (
        <>
          <button onClick={playRound} className="play-button">Jouer un tour</button>
          <div className="card-container">
            <div className="card">
              <h2>Carte du Joueur</h2>
              {playerCard && <img src={playerCard.image} alt="Carte du Joueur" />}
            </div>
            <div className="card">
              <h2>Carte de l'Ordinateur</h2>
              {computerCard && <img src={computerCard.image} alt="Carte de l'Ordinateur" />}
            </div>
          </div>
          <div className="next-card">
            <h3>Prochaine carte du Joueur :</h3>
            <div className="card-options">
              {nextPlayerCards.map((card, index) => (
                <button key={index} onClick={() => selectPlayerCard(card)} className="card-option">
                  {card.value} {card.suit}
                </button>
              ))}
            </div>
          </div>
          <div className="battle-message">
            <p>{battleMessage}</p>
          </div>
          <div className="remaining-cards">
            <p>Cartes restantes : {remainingCards}</p>
          </div>
          <div className="burned-cards">
            <h3>Cartes brûlées :</h3>
            <ul>
              {burnedCardNames.slice(-5).map((cardName, index) => (
                <li key={index}>{cardName}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
