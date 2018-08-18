import React, { Component } from "react";
import Helmet from "react-helmet";
import { Line } from "react-chartjs-2"

require("es6-promise").polyfill();
require("isomorphic-fetch");

const parse = require("csv-parse");

import Layout from "../layout";
import config from "../../data/SiteConfig";

class MahjongPage extends Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
    this.fetchSheetScores();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  async fetchSheetScores() {
    const MAHJONG_CSV_URL =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnhaUOyUmX4o7bQf1nUcWNr37WcQR80S7_fU4_exvwXBXU7QXTHVtwaJv5Q2qWlk6oEDH2jDDEW3Vw/pub?gid=869579873&single=true&output=csv";
    const TENHOU_JSON_URL =
      "https://proxy.danylik.com/nodocchi/api/listuser.php?name=0ddba11";

    // Process response from House Google Sheet
    parse(await (await fetch(MAHJONG_CSV_URL)).text(), (err, data) => {
      if (err) {
        console.log("Error parsing csv");
        return;
      }

      this.setState({ loaded: "CSV parsed okay. Starting calculations..." });

      // HOUSE GAMES
      // split table into 3 man games and four man games
      // delete empty rows from whichever was shorter
      // table structure:
      //  3manDate 3manPlay1 3ManPlay2 3ManPlay3 3ManScore1 3ManScore2 3ManScore3
      //  4ManDate 4ManPlay1 4ManPlay2 4ManPlay3 4ManPlay4 4ManScore1 4ManScore2 4ManScore3 4ManScore4
      // establish seasons?
      // create player table
      // for each row (game)
      //  1. calculate global score
      //  2. calculate season score
      //  3. calculate dan point score
      //  4. calculate R score

      const houseBalance = {}
      const housePlayers = {}
      const houseSeasons = []

      // These will be set to the date of the first and last games
      let houseStartDate = new Date(Date.parse("07-16-2089"))
      let houseEndDate = new Date(Date.parse("07-16-1989"))

      const house4Man = []
      const house3Man = []

      // First pass:
      //   Collect player names + tenhou names
      //   Split into logical tables
      data.forEach(row => {
	const [pHouseName, pTenhouName ] = row.slice(-2)
	const [seasonStart, seasonEnd ] = row.slice(-4, -2)
	const game4Man = row.slice(7, 16)
	const game3Man = row.slice(0, 7)


	if( pHouseName !== "" && pHouseName !== "House Player" ) {
	  if( housePlayers.hasOwnProperty( pHouseName ) ) {
	    if( ! housePlayers[pHouseName].hasOwnProperty("tenhou") ) {
	      housePlayers[pHouseName].tenhou = [ pTenhouName ]
	    } else {
	      housePlayers[pHouseName].tenhou.push(pTenhouName)
	    }
	  } else {
	    housePlayers[pHouseName] = {
	      tenhou: [ pTenhouName ]
	    }
	  }
	}

	if( seasonStart !== "" && seasonStart !== "Start Date" ) {
	  houseSeasons.push({
	    start: new Date(Date.parse(seasonStart)),
	    end: new Date(Date.parse(seasonEnd))
	  })
	}

	if( game4Man[0] !== "" && game4Man[0] !== "Time" ) {
	  const gameDate = new Date(Date.parse(game4Man[0]))
	  if( gameDate > houseEndDate ) {
	    houseEndDate = gameDate
	  }

	  if( gameDate < houseStartDate ) {
	    houseStartDate = gameDate
	  }

	  game4Man.slice(1, 5).forEach(player => {
	    if( !housePlayers.hasOwnProperty(player) ) {
	      housePlayers[player] = {}
	    }
	  })

	  house4Man.push(game4Man)
	}

	if ( game3Man[0] !== "" && game3Man[0] !== "Time" ) {
	  const gameDate = game3Man[0] !== new Date(Date.parse(game3Man[0]))
	  if( gameDate > houseEndDate ) {
	    houseEndDate = gameDate
	  }

	  if( gameDate < houseStartDate ) {
	    houseStartDate = gameDate
	  }

	  game3Man.slice(1, 4).forEach(player => {
	    if( !housePlayers.hasOwnProperty(player) ) {
	      housePlayers[player] = {}
	    }
	  })

	  house3Man.push(game3Man)
	}
      })

      house3Man.forEach(game => {
	const date = new Date(Date.parse(game[0]))

	for( let i = 0; i < 3; i += 1 ) {
	  const player = game[1+i]
	  const score = Number(game[4+i])
	  
	  if(housePlayers[player].hasOwnProperty("sanma")) {
	    const { score: subtotal } = housePlayers[player].sanma.overall

	    housePlayers[player].sanma.overall.data.push({
	      t: date,
	      y: subtotal + score
	    })
	    housePlayers[player].sanma.overall.score = subtotal + score
	    housePlayers[player].sanma.overall.count += 1
	  } else {
	    housePlayers[player].sanma = {
	      overall: { 
		data: [{
		  t: new Date(Date.parse("01-15-2017")),
		  y: 0
		}, {
		  t: date,
		  y: score
		}],
		score,
		count: 1
	      }
	    }
	  }
	}
      })

      const newOptions = {
	hover: {
	  mode: "x",
	},
	tooltips: {
	  mode: "x",
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
                millisecond: 'MMM YY',
                          second: 'MMM YY',
                          minute: 'MMM YY',
                          hour: 'MMM YY',
                          day: 'MMM YY',
                          week: 'MMM YY',
                          month: 'MMM YY',
                          quarter: 'MMM YY',
                          year: 'MMM YY',
               }
            }
          }
	  ]
	}
      }

      const newData = Object.keys(housePlayers).reduce((previous, current) => {
	previous.labels = housePlayers.James.sanma.overall.data.map(point => point.t ? point.t : 0)
        previous.datasets.push({
          label: current,
	  data: housePlayers[current].sanma.overall.data,
	  fill: false,
                  lineTension: 0.1,
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderWidth: 1,
	  pointRadius: 1,
	  hoverRadius: 1

	})

            	return previous
      }, {datasets: [], labels: []})

      console.log(newData)

      this.setState({datasets: newData, dataOptions: newOptions, loaded: "Created house datasets..."})

      console.log(housePlayers);
      console.log(houseSeasons)
      console.log(house3Man)
      console.log(house4Man)
      console.log(houseStartDate)
      console.log(houseEndDate)
    });

    this.setState({ loaded: "Loading Tenhou data..." });

    const rawTenhou = await fetch(TENHOU_JSON_URL).then(response =>
      response.json()
    );

    console.log(rawTenhou);

    this.setState({ loaded: "Done loading Tenhou" });
  }

  render() {
    if (this.state && this.state.datasets) {
      return (
        <Layout location={this.props.location}>
          <Helmet title={`Mahjong | ${config.siteTitle}`} />
          <div>{this.state.loaded}</div>
          <Line options={this.state.dataOptions} data={this.state.datasets} />
        </Layout>
      );
    }
    return (
      <Layout location={this.props.location}>
        <div>Loading</div>
      </Layout>
    );
  }
}

export default MahjongPage;
