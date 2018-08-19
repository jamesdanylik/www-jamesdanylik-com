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
    console.log("constructor")
  }

  componentWillMount() {
    console.log("componentWillMount")
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
    this.fetchSheetScores();
    console.log("componentDidMount")
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  // fetch google sheet
  // parse, if success feed to next stage
  //
  // preprocess google sheet into tables and get players
  // if successful, feed to next stage
  //
  // process house games from previous
  //
  // check for tenhou usernames and fetch
  //   wait for all to complete, then feed to next stage
  //
  // process tenhou games from previous
  //
  // done

  async fetchSheetScores() {
    const data = {}
    const MAHJONG_CSV_URL =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnhaUOyUmX4o7bQf1nUcWNr37WcQR80S7_fU4_exvwXBXU7QXTHVtwaJv5Q2qWlk6oEDH2jDDEW3Vw/pub?gid=869579873&single=true&output=csv";


    // Process response from House Google Sheet
    parse(await (await fetch(MAHJONG_CSV_URL)).text(), (err, csv) => {
      if (err) {
        this.setState({error: "Failed to parse house CSV!"})
        return;
      }

      this.setState({ status: "CSV parsed okay. Starting calculations..." });


      // These will be set to the date of the first and last games
      let houseStartDate = new Date(Date.parse("07-16-2089"))
      let houseEndDate = new Date(Date.parse("07-16-1989"))

      const table4Man = []
      const table3Man = []

      // First pass:
      //   Collect player names + tenhou names
      //   Split into logical tables
      csv.forEach(row => {
	const [pHouseName, pTenhouName ] = row.slice(-2)
	const [seasonStart, seasonEnd ] = row.slice(-4, -2)
	const game4Man = row.slice(7, 16)
	const game3Man = row.slice(0, 7)


	if( pHouseName !== "" && pHouseName !== "House Player" ) {
	  if( data[pHouseName] ) {
	    data[pHouseName][pTenhouName] = {}
	  } else {
	    data[pHouseName] = {
	      house: {},
	      [ pTenhouName ]: {}
	    }
	  }
	}

	if( seasonStart !== "" && seasonStart !== "Start Date" ) {
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
	    if( data[player] ) {
	      if ( data[player].house ) {
		data[player].house.four = {
		  overall: {},
		  seasons: []
		}
	      } else {
		data[player].house = { 
		  four: {
		    overall: {},
		    seasons: []
		  }
		}
	      }
	    } else {
	      data[player] = {
		house: {
		  four: {
		    overall: {},
		    seasons: []
		  }
		}
	      }
	    }
	  })

	  table4Man.push(game4Man)
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
	    if( data[player] ) {
	      if( data[player].house ){
		data[player].house.three = {
		  overall: {},
		  seasons: []
		}
	      } else {
		data[player].house = {
		  three: {
		    overall: {},
		    seasons: []
		  }
		}
	      }
	    } else {
	      data[player] = {
		house: {
		  three: {
		    overall: {},
		    seasons: []
		  }
		}
	      }
	    }
	  })

	  table3Man.push(game3Man)
	}
      })

      table3Man.forEach(game => {
	const date = new Date(Date.parse(game[0]))

	for( let i = 0; i < 3; i += 1 ) {
	  const player = game[1+i]
	  const score = Number(game[4+i])
	  
	  if( data[player].house.three.overall.score ) {
	    const { score: subtotal } = data[player].house.three.overall

	    data[player].house.three.overall.data.push({
	      t: date,
	      y: subtotal + score
	    })
	    data[player].house.three.overall.score = subtotal + score
	    data[player].house.three.overall.count += 1
	  } else {
	    data[player].house.three.overall = { 
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
      })

      table4Man.forEach(game => {
	const date = new Date(Date.parse(game[0]))

	for( let i = 0; i < 4; i += 1 ) {
	  const player = game[1+i]
	  const score = Number(game[5+i])

	  if( data[player].house.four.overall.score ) {
	    const {score: subtotal } = data[player].house.four.overall

	    data[player].house.four.overall.data.push({
	      t: date,
	      y: subtotal + score
	    })
	    data[player].house.four.overall.score = subtotal + score
	    data[player].house.four.overall.count += 1
	  } else {
	    data[player].house.four.overall = {
	      data : [{
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

      const houseThree = Object.keys(data).reduce((previous, current) => {
	previous.labels = data.James.house.three.overall.data.map(point => point.t ? point.t : 0)
        previous.datasets.push({
          label: current,
	  data: data[current].house.three.overall.data,
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

      console.log(data)

      const houseFour = Object.keys(data).reduce((previous, current) => {
	if( data[current].house.four ) {
	previous.labels = data.James.house.four.overall.data.map(point => point.t ? point.t : 0)
	previous.datasets.push({
	  label: current,
	  data: data[current].house.four.overall.data,
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
	}
	return previous
      }, {datasets:[], labels: []})



      this.setState({ status: "Loading Tenhou data..." });

      Object.keys(data).forEach(player => {
	if(Object.keys(data[player]).length > 1) {
	  Object.keys(data[player]).forEach(async (alias) => {
	    if( alias !== "house" ) {
	      this.setState({status: `Fetching Tenhou for ${player} as ${alias}...`})
	      const TENHOU_JSON_URL =
		`https://proxy.danylik.com/nodocchi/api/listuser.php?name=${alias}`
	      const tenhou = await fetch(TENHOU_JSON_URL).then(response => response.json())
	    
	      if(tenhou.name === alias) {
		tenhou.list.forEach(game => {
		  let score = 0
		  if(game.playernum === "4") {
		    for(let i = 1; i <= 4; i += 1) {
		      if(game[`player${i}`] === alias) {
			score = Number(game[`player${i}ptr`])
		      }
		    }
		    if(data[player][alias].four) {
		      const { score: subtotal } = data[player][alias].four.overall
		      data[player][alias].four.overall.data.push({
			t: new Date(game.starttime*1000),
			y: score
		      })
		      data[player][alias].four.overall.count += 1
		      data[player][alias].four.overall.score = subtotal + score
		    } else {
		      data[player][alias].four = {
			overall: {
			  data: [{
			    t: new Date(game.starttime*1000),
			    y: 0
			  }, {
			    t: new Date(game.starttime*1000),
			    y: score
			  }],
			  score,
			  count: 1
			},
			seasons: []
		      }
		    }
		  } else if (game.playernum === "3") {
		    for(let i = 1; i <= 3; i += 1) {
		      if(game[`player${i}`] === alias) {
			score = Number(game[`player${i}ptr`])
		      }
		    }
		    if(data[player][alias].three) {
		      const { score: subtotal } = data[player][alias].three.overall
		      data[player][alias].three.overall.data.push({
			t: new Date(game.starttime*1000),
			y: score
		      })
		      data[player][alias].three.overall.count += 1
		      data[player][alias].three.overall.score = subtotal + score
		    } else {
		      data[player][alias].three = {
			overall: {
			  data: [{
			    t: new Date(game.starttime * 1000),
			    y: 0
			  }, {
			    t: new Date(game.starttime * 1000),
			    y: score
			  }],
			  score,
			  count: 1
			},
			seasons: []
		      }
		    }
		  } else {
		    console.log("Unknown game record")
		  }
		})
	      } else {
		console.log(`Error in parsing tenhou for ${alias}`)
	      }
	    }
	  })
	}
      })

      let tenhouFour = {
	datasets: [],
	labels: data.James.house.four.overall.data.map(point => point.t : 0)
      }

      for (var player in data) {
	for (var alias in data[player]) {
	  if( alias !== "house") {
	    console.log(data[player][alias])
	    if(data[player][alias].four) {
	      console.log("This ran")
	    tenhouFour.datasets.push({
                label: `${player} as ${alias}`,
                data: data[player][alias].four.overall.data,
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
	    }
	  }
	}
      }

      console.log(tenhouFour)

      this.setState({houseThree, houseFour, tenhouFour, dataOptions: newOptions, status: "Created house datasets..."})

      this.setState({ status: "Done loading Tenhou" });
      console.log(data)
    })
  }

  render() {
    const status = (this.state && this.state.status) ? this.state.status : "Initializing..."
    const cOptions = (this.state && this.state.dataOptions) ? this.state.dataOptions : ""
    const c1 = (this.state && this.state.houseThree) ? (<Line options={cOptions} data={this.state.houseThree} />) : ""

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
