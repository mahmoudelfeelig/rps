export const calculateParlayOdds = (selections) => {
    let odds = 1;
    Object.values(selections).forEach((opt) => {
      if (opt?.odds) odds *= opt.odds;
    });
    return parseFloat(odds.toFixed(2));
  };
  