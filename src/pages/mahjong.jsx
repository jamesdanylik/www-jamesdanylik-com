import React, { Component } from "react";
import Helmet from "react-helmet";
import { Line } from "react-chartjs-2";
import Dropdown from "react-dropdown";
import palette from "google-palette";

require("es6-promise").polyfill();
require("isomorphic-fetch");

const parse = require("csv-parse/lib/sync");

import Layout from "../layout";
import config from "../../data/SiteConfig";

class MahjongPage extends Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    console.log("constructor");

    this.state = {
      activeRoom: "all",
      activeType: "all",
      activeSeason: "overall"
    };
  }

  componentWillMount() {
    console.log("componentWillMount");
  }

  getSeasons() {
    const seasons = [];
    let start = new Date(Date.parse("01/01/17"));
    let end = new Date(Date.parse("03/01/17"));
    const now = new Date();

    while (end < now) {
      seasons.push({
        start,
        end,
        name: "",
        data: {}
      });
      start = end;
      end = new Date(start.setMonth(start.getMonth() + 3));
    }
    return seasons;
  }

  createGraphDataset(activeSeason, activeRoom, activeType) {
    console.log(`${activeSeason} ${activeRoom} ${activeType}`);
    const graphData = {
      labels: this.state.data.players.James.house.three.overall.data.map(
        p => (p.t ? p.t : 0)
      ),
      datasets: []
    };

    const types = activeType !== "all" ? [activeType] : ["four", "three"];

    const seasons =
      activeSeason === "overall"
        ? activeSeason
        : activeSeason === "all"
          ? this.getSeasons().map((s, i) => i)
          : [Number(activeSeason.slice(7, 8)) - 1];

    console.log(seasons);

    const colors = palette("mpn65", 64);
    console.log(colors);
    let colorId = 0;

    Object.keys(this.state.data.players).forEach(player => {
      const aliasCopy = Object.keys(this.state.data.players[player]);

      if (activeRoom === "house") {
        for (const a in aliasCopy) {
          if (aliasCopy[a] !== "house") {
            delete aliasCopy[a];
          }
        }
      } else if (activeRoom === "tenhou") {
        delete aliasCopy.house;
      } else {
        // all; process whole array
      }

      aliasCopy.forEach(alias => {
        types.forEach(type => {
          if (seasons === "overall") {
            if (this.state.data.players[player][alias][type]) {
              if (
                this.state.data.players[player][alias][type] &&
                this.state.data.players[player][alias][type].overall.data
              ) {
                if (activeRoom === "tenhou" && alias === "house") {
                  return;
                }
                graphData.datasets.push({
                  label: `${player} (${alias})`,
                  data: this.state.data.players[player][alias][type].overall
                    .data,
                  fill: false,
                  lineTension: 0.1,
                  borderColor: `#${colors[colorId]}`,
                  backgroundColor: `#${colors[colorId]}`,
                  pointRadius: 2
                });
                colorId += 1;
              }
            }
          } else {
            // Do season processing
            graphData.labels = this.state.data.players.James.house.three.seasons[
              seasons[0]
            ].data.data.map(p => (p.t ? p.t : 0));
            seasons.forEach(season => {
              if (this.state.data.players[player][alias][type]) {
                if (
                  this.state.data.players[player][alias][type] &&
                  this.state.data.players[player][alias][type].seasons[
                    season
                  ] &&
                  this.state.data.players[player][alias][type].seasons[season]
                    .data &&
                  this.state.data.players[player][alias][type].seasons[season]
                    .data.data &&
                  this.state.data.players[player][alias][type].seasons[season]
                    .data.data.length > 0
                ) {
                  if (activeRoom === "tenhou" && alias === "house") {
                    return;
                  }
                  graphData.datasets.push({
                    label: `${player} (${alias})`,
                    data: this.state.data.players[player][alias][type].seasons[
                      season
                    ].data.data,
                    fill: false,
                    lineTension: 0.1,
                    borderColor: `#${colors[colorId]}`,
                    backgroundColor: `#${colors[colorId]}`,
                    pointRadius: 2
                  });
                  colorId += 1;
                }
              }
            });
          }
        });
      });
    });
    console.log(graphData);

    const seasonOptions = this.getSeasons().map(
      (s, i) =>
        `Season ${i +
          1}: ${s.start.toLocaleDateString()} - ${s.end.toLocaleDateString()}`
    );
    seasonOptions.push("all");
    seasonOptions.push("overall");

    const dStyle = {
      float: "left",
      paddingLeft: "10px"
    };

    const iStyle = {
      fontSize: "24px",
      fontWeight: "bold"
    };

    const dropdowns = (
      <div>
        <div style={dStyle}>
          <h5>Season</h5>
          <div style={iStyle}>
            <Dropdown
              options={seasonOptions}
              value={activeSeason}
              onChange={option => {
                this.createGraphDataset(option.value, activeRoom, activeType);
              }}
            />
          </div>
        </div>
        <div style={dStyle}>
          <h5>Room</h5>
          <div style={iStyle}>
            <Dropdown
              options={["house", "tenhou", "all"]}
              value={activeRoom}
              onChange={option => {
                this.createGraphDataset(activeSeason, option.value, activeType);
              }}
            />
          </div>
        </div>
        <div style={dStyle}>
          <h5>Players</h5>
          <div style={iStyle}>
            <Dropdown
              options={["three", "four", "all"]}
              value={activeType}
              onChange={option => {
                this.createGraphDataset(activeSeason, activeRoom, option.value);
              }}
            />
          </div>
        </div>
      </div>
    );

    this.setState({
      graphData,
      dropdowns,
      test: new Date(),
      activeRoom,
      activeType,
      activeSeason
    });
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
    console.log("componentDidMount");

    // This is the main data object
    const data = {
      players: {}
    };

    const seasons = this.getSeasons();

    // Helper function to return all the tenhou usernames we know about
    const getTenhouUsers = () => {
      let users = [];
      for (const houseName in data.players) {
        const playerCopy = Object.assign({}, data.players[houseName]);
        delete playerCopy.house;
        const aliases = Object.keys(playerCopy);
        users = users.concat(aliases);
      }
      return users;
    };

    // Helper function that returns whether or not a tenhou user is a house user
    const isHouseAlias = unknownAlias => {
      for (const houseName in data.players) {
        if (data.players[houseName][unknownAlias]) {
          return true;
        }
      }
      return false;
    };

    // Helper function that returns a given tenhou players house name
    const getHouseName = tenhouName => {
      for (const houseName in data.players) {
        if (data.players[houseName][tenhouName]) {
          return houseName;
        }
      }
      return "";
    };

    const getGameSeason = date => {
      for (let i = 0; i < seasons.length; i += 1) {
        if (seasons[i].start < date && seasons[i].end > date) {
          return i;
        }
      }
      return -1;
    };

    // Help function called on all game objects to process them
    const processGame = game => {
      let num = 0;
      let word = "zero";
      let aliases = ["unknown"];
      let date = "unknown";
      if (Array.isArray(game)) {
        aliases = ["house"];
        date = new Date(Date.parse(game[0]));
        if (game.length === 7) {
          num = 3;
          word = "three";
        } else if (game.length === 10) {
          num = 4;
          word = "four";
        }
      } else if (typeof game === "object") {
        date = Date.parse(game.starttime);
        aliases = getTenhouUsers();
        if (game.player4) {
          num = 4;
          word = "four";
        } else {
          num = 3;
          word = "three";
        }
      }

      aliases.forEach(alias => {
        for (let i = 0; i < num; i += 1) {
          let player = "unknown";
          let score = "unknown";
          if (alias === "house") {
            player = game[1 + i];
            score = Number(game[1 + num + i]);
          } else if (game[`player${i + 1}`] === alias) {
            player = getHouseName(alias);
            score = Number(game[`player${i + 1}pts`]);
          } else {
            continue;
          }

          if (data.players[player][alias][word].overall.score) {
            const { score: subtotal } = data.players[player][alias][
              word
            ].overall;

            data.players[player][alias][word].overall.data.push({
              t: date,
              y: subtotal + score
            });
            data.players[player][alias][word].overall.score = subtotal + score;
            data.players[player][alias][word].overall.count += 1;
          } else {
            data.players[player][alias][word].overall = {
              data: [
                {
                  t: new Date(Date.parse("01-15-2017")),
                  y: 0
                },
                {
                  t: date,
                  y: score
                }
              ],
              score,
              count: 1
            };
          }

          if (data.players[player][alias][word].seasons.length > 0) {
            const seasonId = getGameSeason(date);

            if (
              data.players[player][alias][word].seasons[seasonId].data.score
            ) {
              const { score: subtotal } = data.players[player][alias][
                word
              ].seasons[seasonId].data;

              data.players[player][alias][word].seasons[
                seasonId
              ].data.data.push({
                t: date,
                y: subtotal + score
              });
              data.players[player][alias][word].seasons[seasonId].data.score =
                subtotal + score;
              data.players[player][alias][word].seasons[
                seasonId
              ].data.count += 1;
            } else {
              const startDate =
                data.players[player][alias][word].seasons[seasonId].start;
              data.players[player][alias][word].seasons[seasonId].data = {
                data: [
                  {
                    t: startDate,
                    y: 0
                  },
                  {
                    t: date,
                    y: score
                  }
                ],
                score,
                count: 1
              };
            }
          }
        }
      });
    };

    const MAHJONG_CSV_URL =
      "https://proxy.danylik.com/gsheets/spreadsheets/d/e/2PACX-1vTnhaUOyUmX4o7bQf1nUcWNr37WcQR80S7_fU4_exvwXBXU7QXTHVtwaJv5Q2qWlk6oEDH2jDDEW3Vw/pub?gid=869579873&single=true&output=csv";

    // STAGE 1: Fetch the House mahjong spreadsheet from google spreadsheets via proxy
    fetch(MAHJONG_CSV_URL)
      .then(resp => resp.text())
      .then(txt => parse(txt))
      .then(csv => {
        // STAGE 2: Do first pass on the resulting concatenated tables
        this.setState({ status: "Starting csv" });
        const table = [];

        // For each row, split into component tables
        // Build lexicon of which players exist in which rooms
        csv.forEach(row => {
          const [pHouseName, pTenhouName] = row.slice(-2);
          const [s1, s2] = row.slice(-4, -2);
          const game4Man = row.slice(7, 17);
          const game3Man = row.slice(0, 7);

          if (pHouseName !== "" && pHouseName !== "House Player") {
            if (data[pHouseName]) {
              data.players[pHouseName][pTenhouName] = {};
            } else {
              data.players[pHouseName] = {
                house: {},
                [pTenhouName]: {}
              };
            }
          }

          [
            {
              game: game4Man,
              num: 4,
              word: "four"
            },
            {
              game: game3Man,
              num: 3,
              word: "three"
            }
          ].forEach(({ game, num, word }) => {
            if (game[0] !== "" && game[0] !== "Time") {
              game.slice(1, 1 + num).forEach(player => {
                const skeleton = {
                  overall: {},
                  seasons: JSON.parse(JSON.stringify(seasons))
                };
                if (data.players[player]) {
                  if (data.players[player].house) {
                    data.players[player].house[word] = skeleton;
                  } else {
                    data.players[player].house = {
                      [word]: skeleton
                    };
                  }
                } else {
                  data.players[player] = {
                    house: {
                      [word]: skeleton
                    }
                  };
                }
              });
              table.push(game);
            }
          });
        }); // close csv foreach
        data.table = table;
        this.setState({ status: "Starting tenhou fetch..." });
        return getTenhouUsers();
      })
      .then(aliases =>
        // STAGE 3: Fetch all tenhou results via proxy and wait for all to return
        Promise.all(
          aliases.map(async alias =>
            fetch(
              `https://tenhou.danylik.com/index.php?user=${alias}`
            )
          )
        )
      )
      .then(responses =>
        Promise.all(responses.map(async response => response.json()))
      )
      .then(responses => {
	// STAGE 4: First pass on tenhou data
	let collected = [];
	console.log(responses);
        responses.forEach(response => {
          collected = collected.concat(response);
        });

        // uniqueify
        collected = Array.from(new Set(collected));


        // sort & preprocess
        collected.sort((a, b) => {
          const keyA = Date.parse(a.starttime);
          const keyB = Date.parse(b.starttime);
  
	  [a, b].forEach(game => {
	    const num = game.player4 ? 4 : 3; 
            const word = num === 4 ? "four" : "three";

            for (let i = 0; i < num; i += 1) {
              const alias = game[`player${i + 1}`];
              if (isHouseAlias(alias)) {
                // is tenhou player
                const player = getHouseName(alias);

                data.players[player][alias][word] = {
                  overall: {},
                  seasons: JSON.parse(JSON.stringify(seasons))
                };
              }
            }
          });

          if (keyA > keyB) return 1;
          if (keyA < keyB) return -1;
          return 0;
        });

        return data.table.concat(collected);
      })
      .then(table => {
        // STAGE 5: Process games by feeding to processGame
        this.setState({ status: "Starting game processing..." });
        table.forEach(game => {
          processGame(game);
        });

        delete data.table;

        this.setState({
          status: "Done",
          data,
          activeRoom: "all",
          activeType: "all",
          test: new Date()
        });
        console.log(data);
      })
      .then(() => {
        this.createGraphDataset(
          this.state.activeSeason,
          this.state.activeRoom,
          this.state.activeType
        );
      });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    const status =
      this.state && this.state.status
        ? this.state.data ? "" : this.state.status
        : "Initializing...";
    const cOptions = {
      hover: {
        mode: "x"
      },
      tooltips: {
        mode: "x"
      },
      scales: {
        xAxes: [
          {
            title: "time",
            type: "time",
            time: {
              unit: "month",
              unitStepSize: 1,
              displayFormats: {
                millisecond: "MMM YY",
                second: "MMM YY",
                minute: "MMM YY",
                hour: "MMM YY",
                day: "MMM YY",
                week: "MMM YY",
                month: "MMM YY",
                quarter: "MMM YY",
                year: "MMM YY"
              }
            }
          }
        ]
      }
    };

    const c1 =
      this.state && this.state.graphData ? (
        <Line
          key={this.state.test}
          options={cOptions}
          data={this.state.graphData}
        />
      ) : (
        ""
      );

    return (
      <Layout location={this.props.location}>
        <Helmet title={`Mahjong | ${config.siteTitle}`} />
        <div>{status}</div>
        {this.state && this.state.data ? (
          <div>
            <a href="/">Back to home</a>
            {this.state.dropdowns}
          </div>
        ) : (
          ""
        )}
        {c1}
      </Layout>
    );
  }
}

export default MahjongPage;
