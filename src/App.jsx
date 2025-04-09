import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [words, setWords] = useState([]);
  const [vocab, setVocab] = useState([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const inputRef = useRef();

  useEffect(() => {
    Papa.parse('/vocab_list.csv', {
      header: true,
      download: true,
      complete: (results) => {
        setVocab(results.data);
        startWordDrop(results.data);
      },
    });
  }, []);

  const startWordDrop = (data) => {
    const interval = setInterval(() => {
      setWords(prev => {
        // Drop existing words
        const moved = prev
          .map(word => ({ ...word, y: word.y + word.speed }))
          .filter(word => {
            if (word.y >= 90) {
              setScore(s => s - 1); // too slow
              return false;
            }
            return true;
          });

        // Randomly add new word
        if (Math.random() < 0.005 && data.length > 0) {
          const random = data[Math.floor(Math.random() * data.length)];
          moved.push({
            id: Date.now() + Math.random(),
            syriac: random.Syriac,
            english: random.English.trim().toLowerCase(),
            x: Math.random() * 90,
            y: 0,
            speed: 0.1 + Math.random() * 0.05,
          });
        }

        return moved;
      });
    }, 50);

    return () => clearInterval(interval);
  };

  const handleInput = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setInput(value);

    setWords(prev => {
      const match = prev.find(word => word.english === value);
      if (match) {
        setScore(s => s + 1);
        setInput('');
        return prev.filter(w => w.id !== match.id);
      }
      return prev;
    });
  };

  return (
    <div className="game-area">
      <div className="score">Score: {score}</div>
      <input
        ref={inputRef}
        className="type-box"
        value={input}
        onChange={handleInput}
        placeholder="Type English translation..."
        autoFocus
      />
      {words.map(word => (
        <div
          key={word.id}
          className="falling-word"
          style={{ top: `${word.y}%`, left: `${word.x}%` }}
        >
          {word.syriac}
        </div>
      ))}
    </div>
  );
}

export default App;