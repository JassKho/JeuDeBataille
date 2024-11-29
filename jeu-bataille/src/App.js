import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [deck, setDeck] = useState(null);
  const [playerCard, setPlayerCard] = useState(null);
  const [computerCard, setComputerCard] = useState(null);
  const [playerDeck, setPlayerDeck] = useState([]);
  const [computerDeck, setComputerDeck] = useState([]);
  const [winner, setWinner] = useState("");

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
      })
      .catch(error => console.log(error));
  };

  const playRound = () => {
    if (!playerDeck.length || !computerDeck.length) {
      if (playerDeck.length > 0) {
        setWinner("Le joueur gagne la partie !");
      } else {
        setWinner("L'ordinateur gagne la partie !");
      }
      return;
    }

    const playerCurrentCard = playerDeck.shift();
    const computerCurrentCard = computerDeck.shift();
    setPlayerCard(playerCurrentCard);
    setComputerCard(computerCurrentCard);

    const playerCardValue = calculateCardValue(playerCurrentCard.value);
    const computerCardValue = calculateCardValue(computerCurrentCard.value);

    if (playerCardValue > computerCardValue) {
      setPlayerDeck(prevDeck => [...prevDeck, playerCurrentCard, computerCurrentCard]);
    } else {
      setComputerDeck(prevDeck => [...prevDeck, playerCurrentCard, computerCurrentCard]);
    }
  };

  const calculateCardValue = (value) => {
    const values = {
      "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
      "JACK": 11, "QUEEN": 12, "KING": 13, "ACE": 14
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
        </>
      )}
    </div>
  );
}

export default App;