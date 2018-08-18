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
    const data = {}
    const MAHJONG_CSV_URL =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnhaUOyUmX4o7bQf1nUcWNr37WcQR80S7_fU4_exvwXBXU7QXTHVtwaJv5Q2qWlk6oEDH2jDDEW3Vw/pub?gid=869579873&single=true&output=csv";
    const TENHOU_JSON_URL =
      "https://proxy.danylik.com/nodocchi/api/listuser.php?name=0ddba11";

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
	  if( data.hasOwnProperty( pHouseName ) ) {
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
	    if( data.hasOwnProperty(player) ) {
	      if ( data[player].hasOwnProperty("house") ) {
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
	    if( data.hasOwnProperty(player) ) {
	      if( data[player].hasOwnProperty("house") ){
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
	  
	  if(data[player].house.three.overall.hasOwnProperty("score")) {
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

	  if(data[player].house.four.overall.hasOwnProperty("score")) {
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

      const threeData = Object.keys(data).reduce((previous, current) => {
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

      const fourData = Object.keys(data).reduce((previous, current) => {
	if( data[current].house.hasOwnProperty("four") ) {
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

      console.log(threeData)
      console.log(fourData)

      this.setState({threeData, fourData, dataOptions: newOptions, status: "Created house datasets..."})

      console.log(data);
      console.log(table3Man)
      console.log(table4Man)
      console.log(houseStartDate)
      console.log(houseEndDate)
    });

    this.setState({ status: "Loading Tenhou data..." });

    const rawTenhou = await fetch(TENHOU_JSON_URL).then(response =>
      response.json()
    );

    console.log(rawTenhou);

    this.setState({ status: "Done loading Tenhou" });
  }

  render() {
    if (this.state && this.state.threeData) {
      return (
        <Layout location={this.props.location}>
          <Helmet title={`Mahjong | ${config.siteTitle}`} />
          <div>{this.state.status}</div>
          <div>{this.state.error? this.state.error : "No errors!"}</div>
          <Line options={this.state.dataOptions} data={this.state.threeData} />
          <Line options={this.state.dataOptions} data={this.state.fourData} />
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
