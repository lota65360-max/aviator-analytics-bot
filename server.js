const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static("public"));

let rounds = [
  1.36, 2.95, 1.17, 13.70,
  4.47, 105.75, 4.39, 1.12
];

function getStats() {
  const data = rounds.slice(-100);

  if (!data.length) {
    return {
      count: 0,
      average: 0,
      median: 0,
      below2x: 0,
      above10x: 0,
      status: "WAIT"
    };
  }

  const sorted = [...data].sort((a, b) => a - b);

  const average =
    data.reduce((sum, value) => sum + value, 0) / data.length;

  const middle = Math.floor(sorted.length / 2);

  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  const below2x =
    (data.filter(value => value < 2).length / data.length) * 100;

  const above10x =
    (data.filter(value => value >= 10).length / data.length) * 100;

  let status = "WAIT";

  if (data.length >= 5) {
    if (below2x >= 70) {
      status = "HIGH-VARIANCE";
    } else {
      status = "WATCH";
    }
  }

  return {
    count: data.length,
    average: Number(average.toFixed(2)),
    median: Number(median.toFixed(2)),
    below2x: Number(below2x.toFixed(1)),
    above10x: Number(above10x.toFixed(1)),
    status
  };
}

app.get("/api/stats", (req, res) => {
  res.json(getStats());
});

app.get("/api/rounds", (req, res) => {
  res.json(rounds.slice(-100));
});

app.post("/api/rounds", (req, res) => {
  const multiplier = Number(req.body.multiplier);

  if (!Number.isFinite(multiplier) || multiplier < 1) {
    return res.status(400).json({
      error: "Invalid multiplier"
    });
  }

  rounds.push(Number(multiplier.toFixed(2)));

  if (rounds.length > 500) {
    rounds = rounds.slice(-500);
  }

  res.json({
    success: true,
    multiplier,
    statistics: getStats()
  });
});

app.post("/api/import", (req, res) => {
  if (!Array.isArray(req.body.multipliers)) {
    return res.status(400).json({
      error: "multipliers must be an array"
    });
  }

  const values = req.body.multipliers
    .map(Number)
    .filter
