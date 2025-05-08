const adjectives = [
    'Fluffy', 'Brave', 'Cuddly', 'Tiny', 'Sneaky', 'Bouncy', 'Lazy',
    'Zappy', 'Wiggly', 'Snuggly', 'Frosty', 'Zany', 'Jumpy'
  ];
  
  const nouns = [
    'Whiskers', 'Paws', 'Snout', 'Tail', 'Furball', 'Wiggle', 'Snore',
    'Blink', 'Sniff', 'Mittens', 'Zoomie', 'Boop', 'Bark'
  ];
  
  module.exports = function generatePetName() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${number}`;
  };
  