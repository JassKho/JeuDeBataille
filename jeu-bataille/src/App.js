import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [deck, setDeck] = useState(null);
  const [playerCard, setPlayerCard] = useState(null);
  const [computerCard, setComputerCard] = useState(null);
  const [playerDeck, setPlayerDeck] = useState([]);
  const [computerDeck, setComputerDeck] = useState([]);
  const [burnedCards, setBurnedCards] = useState([]); // Cartes brûlées
  const [burnedCardNames, setBurnedCardNames] = useState([]); // Noms des cartes brûlées
  const [winner, setWinner] = useState("");
  const [battleMessage, setBattleMessage] = useState(""); // Message spécial pour la bataille
  const [remainingCards, setRemainingCards] = useState(0); // Nombre de cartes restantes
  const [burnCount, setBurnCount] = useState(0); // Compteur des cartes brûlées

  useEffect(() => {
    // Créer un nouveau paquet de cartes
    axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => {
        setDeck(response.data);
        drawInitialCards(response.data.deck_id);
      })
      .catch(error => console.log(error));
  }, []);

  const drawInitialCards = (deck_id) => {
    // Tirer 52 cartes et les répartir entre le joueur et l'ordinateur
    axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=52`)
      .then(response => {
        const cards = response.data.cards;
        setPlayerDeck(cards.slice(0, 26));
        setComputerDeck(cards.slice(26, 52));
        setRemainingCards(response.data.remaining); // Nombre de cartes restantes dans le paquet
      })
      .catch(error => console.log(error));
  };

  const playRound = () => {
    if (playerDeck.length === 0 || computerDeck.length === 0) {
      setWinner(playerDeck.length > computerDeck.length ? "Le joueur gagne la partie !" : "L'ordinateur gagne la partie !");
      return;
    }

    let localBurnedCards = [...burnedCards];
    let localBurnedCardNames = [...burnedCardNames];
    let playerCurrentCard = playerDeck.shift(); // Tirer la carte du joueur
    let computerCurrentCard = computerDeck.shift(); // Tirer la carte de l'ordinateur

    let playerCardValue = calculateCardValue(playerCurrentCard.value);
    let computerCardValue = calculateCardValue(computerCurrentCard.value);

    localBurnedCards.push(playerCurrentCard, computerCurrentCard); // Ajouter les cartes jouées aux cartes brûlées
    localBurnedCardNames.push(playerCurrentCard.value, computerCurrentCard.value); // Ajouter les noms des cartes brûlées

    setBurnedCardNames(localBurnedCardNames); // Mettre à jour les noms des cartes brûlées

    // Afficher les cartes brûlées à chaque tour
    console.log("Cartes brûlées: ", localBurnedCardNames);

    if (burnCount === 5) {
      // Réinitialiser les cartes brûlées et le compteur
      setBurnedCards([]);
      setBurnedCardNames([]);
      setBurnCount(0);
    }

    // Incrémenter le compteur des cartes brûlées
    setBurnCount(prevCount => prevCount + 2);

    if (playerCardValue === computerCardValue) {
      if (playerCurrentCard.value === "ACE" && computerCurrentCard.value === "ACE") {
        // Déclencher une bataille pour les As
        handleAceBattle(localBurnedCards, localBurnedCardNames);
        return;
      }
      // En cas d'égalité (non-As), les cartes sont redistribuées
      setBattleMessage("Égalité ! Les cartes sont redistribuées.");
      setPlayerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
      setComputerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
    } else if (playerCardValue > computerCardValue) {
      setPlayerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
      setBattleMessage(""); // Réinitialiser le message de bataille si le joueur gagne
    } else {
      setComputerDeck(prevDeck => [...prevDeck, ...localBurnedCards]);
      setBattleMessage(""); // Réinitialiser le message de bataille si l'ordinateur gagne
    }

    setRemainingCards(deck.remaining); // Mise à jour du nombre de cartes restantes
    setBurnedCards([]); // Réinitialiser les cartes brûlées
    setPlayerCard(playerCurrentCard);
    setComputerCard(computerCurrentCard);
  };

  const handleAceBattle = (localBurnedCards, localBurnedCardNames) => {
    if (playerDeck.length === 0 || computerDeck.length === 0) {
      setWinner(playerDeck.length > computerDeck.length ? "Le joueur gagne la partie !" : "L'ordinateur gagne la partie !");
      return;
    }

    // Tirer une nouvelle carte pour chaque joueur
    const playerExtraCard = playerDeck.shift();
    const computerExtraCard = computerDeck.shift();

    const playerExtraValue = calculateCardValue(playerExtraCard.value);
    const computerExtraValue = calculateCardValue(computerExtraCard.value);

    // Ajouter les cartes supplémentaires aux cartes brûlées
    localBurnedCards.push(playerExtraCard, computerExtraCard);
    localBurnedCardNames.push(playerExtraCard.value, computerExtraCard.value);

    // Afficher les noms des cartes brûlées supplémentaires
    console.log("Cartes brûlées après la bataille d'As: ", localBurnedCardNames);

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

    setRemainingCards(deck.remaining); // Mise à jour du nombre de cartes restantes
    setBurnedCards([]); // Réinitialiser les cartes brûlées
    setBurnedCardNames([]); // Réinitialiser les noms des cartes brûlées
    setBurnCount(0); // Réinitialiser le compteur des cartes brûlées
    setPlayerCard(playerExtraCard);
    setComputerCard(computerExtraCard);
  };

  const calculateCardValue = (value) => {
    // Valeurs simplifiées des cartes
    const values = {
      "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
      "8": 8, "9": 9, "10": 10, "JACK": 11,
      "QUEEN": 12, "KING": 13, "ACE": 14
    };
    return values[value];
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
          {battleMessage && <p className="battle-message">{battleMessage}</p>}
          <div className="deck-info">
            <p>Cartes du joueur : {playerDeck.length}</p>
            <p>Cartes de l'ordinateur : {computerDeck.length}</p>
            <p>Cartes restantes : {remainingCards}</p>
            <p>Cartes brûlées : {burnedCardNames.join(', ')}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
