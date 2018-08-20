import React, { Component } from "react";
import Helmet from "react-helmet";
import { Line } from "react-chartjs-2";

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
  }

  componentWillMount() {
    console.log("componentWillMount");
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
    console.log("componentDidMount");


    const data = {
      players: {},
    };

    const getTenhouUsers = () => {
      let users = []
      for (const houseName in data.players) {
	const playerCopy = Object.assign({}, data.players[houseName])
	delete playerCopy.house
	const aliases = Object.keys(playerCopy)
	users = users.concat(aliases)
      }
      return users
    };

    const isHouseAlias = unknownAlias => {
      for( const houseName in data.players) {
	if(data.players[houseName][unknownAlias]) {
	  return true
	}
      }
      return false
    }

    const getHouseName = tenhouName => {
      for (const houseName in data.players) {
        if (data.players[houseName][tenhouName]) {
          return houseName;
        }
      }
      return "";
    };

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
        date = new Date(game.starttime * 1000);
        aliases = getTenhouUsers();
        if (game.playernum === "4") {
          num = 4;
          word = "four";
        } else if (game.playernum === "3") {
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
            score = Number(game[`player${i + 1}ptr`]);
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
        }
      });
    };

    const MAHJONG_CSV_URL =
      "https://proxy.danylik.com/gsheets/spreadsheets/d/e/2PACX-1vTnhaUOyUmX4o7bQf1nUcWNr37WcQR80S7_fU4_exvwXBXU7QXTHVtwaJv5Q2qWlk6oEDH2jDDEW3Vw/pub?gid=869579873&single=true&output=csv";

    fetch(MAHJONG_CSV_URL)
      .then(resp => resp.text())
      .then(txt => parse(txt))
      .then(csv => {
	this.setState({status: "Starting csv"})
        const table = []

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
              word: "four",
            },
            {
              game: game3Man,
              num: 3,
              word: "three",
            }
          ].forEach(({ game, num, word }) => {
            if (game[0] !== "" && game[0] !== "Time") {
              game.slice(1, 1 + num).forEach(player => {
                const skeleton = { overall: {}, seasons: [] };
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
	this.setState({status: "Starting tenhou fetch..."})
	return getTenhouUsers();
      })
      .then( aliases => Promise.all(aliases.map(async (alias) => 
	fetch(`https://proxy.danylik.com/nodocchi/api/listuser.php?name=${alias}`)
      )))
      .then( responses => Promise.all(responses.map(async (response) => response.json())))
      .then( responses => {
	let collected = []
	responses.forEach(response => {
	  collected = collected.concat(response.list)
	})

	// uniqueify
	collected = Array.from(new Set(collected))

	// sort & preprocess
	collected.sort((a, b) => {
	  const keyA = new Date(a.starttime * 1000);
	  const keyB = new Date(b.starttime * 1000);

	  [a, b].forEach(game => {
	    const num = Number(game.playernum)
	    const word = num === 4 ? "four" : "three"

	    for(let i = 0; i < num; i += 1) {
	      const alias = game[`player${i+1}`]
	      if(isHouseAlias(alias)) { // is tenhou player
		const player = getHouseName(alias)

		data.players[player][alias][word] = {
		  overall: {},
		  seasons: []
		}
	      }
	    }
	  })

	  if(keyA > keyB) return 1
	  if(keyA < keyB) return -1
	  return 0
	})

	console.log(collected)
	return data.table.concat(collected)
      })
      .then((table) => {
	this.setState({status: "Starting game processing..."})
        table.forEach(game => {
          processGame(game);
        });
	this.setState({status: "Done"})
	console.log(data);
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
      this.state && this.state.status ? this.state.status : "Initializing...";
    const cOptions =
      this.state && this.state.dataOptions ? this.state.dataOptions : "";
    const c1 =
      this.state && this.state.houseThree ? (
        <Line options={cOptions} data={this.state.houseThree} />
      ) : (
        ""
      );

    return (
      <Layout location={this.props.location}>
        <Helmet title={`Mahjong | ${config.siteTitle}`} />
        <div>{status}</div>
        {c1}
      </Layout>
    );
  }
}

export default MahjongPage;
