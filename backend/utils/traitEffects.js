module.exports = {
    forager: {
      generate: () => ({ coins: 10 })
    },
    resourceful: {
      modifyGeneration: (resources) => {
        resources.coins += 5;
        return resources;
      }
    },
    snuggly: {
      modifyAffection: (base) => base + 5
    },
    naptime: {
      passiveExp: () => 2
    },
    cheerful: {
      modifyPlayBonus: (base) => Math.ceil(base * 1.2)
    },
    splashy: {
      doubleMiniGame: (score) => (Math.random() < 0.1 ? score * 2 : score)
    }
  };
  