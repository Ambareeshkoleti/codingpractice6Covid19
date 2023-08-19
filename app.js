const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbpath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initial = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("sucess");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};
initial();

convertPlayers = (o) => {
  return {
    playerId: o.player_id,
    playerName: o.player_name,
  };
};

convertMatches = (o) => {
  return {
    matchId: o.match_id,
    match: o.match,
    year: o.year,
  };
};

convertScores = (o) => {
  return {
    playerId: o.player_id,
    playerName: o.player_name,
    totalScore: o.score,
    totalFours: o.fours,
    totalSix: o.sixes,
  };
};

app.get("/players/", async (request, response) => {
  const query = `select * from player_details;`;
  const result = await db.all(query);
  response.send(result.map((each) => convertPlayers(each)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `select * from player_details where player_id=${playerId};`;
  const result = await db.get(query);
  response.send(convertPlayers(result));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const query = `update player_details set player_name='${playerName}' where player_id=${playerId};`;
  await db.run(query);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `select * from match_details where match_id=${matchId};`;
  const result = await db.get(query);
  response.send(convertMatches(result));
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query = `select * from player_match_score inner join match_details on player_match_score.match_id=match_details.match_id where player_id=${playerId};`;
  const result = await db.all(query);
  response.send(result.map((each) => convertMatches(each)));
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query = `select * from player_match_score inner join player_details on player_match_score.player_id=player_details.player_id where match_id=${matchId};`;
  const result = await db.all(query);
  response.send(result.map((each) => convertPlayers(each)));
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const query = `select 
    player_id as playerId,
    player_name as playerName,
    sum(score) as totalScore,
    sum(fours) as totalFours,
    sum(sixes) as totalSixes
  from 
    player_match_score  join player_details 
 
  where 
    player_id=${playerId};`;
  const result = await db.get(query);
  response.send(result);
});

module.exports = app;
