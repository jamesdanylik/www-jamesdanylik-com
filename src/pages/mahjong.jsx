import React, { Component } from "react";
import Helmet from "react-helmet";

require("es6-promise").polyfill()
require("isomorphic-fetch");

const parse = require("csv-parse")

import Layout from "../layout";
import config from "../../data/SiteConfig";

class MahjongPage extends Component {
  constructor(props) {
    super(props)
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
  }

  componentDidMount() {
    this.updateWindowDimensions()
    window.addEventListener("resize", this.updateWindowDimensions)
    this.fetchSheetScores()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions)
  }

  updateWindowDimensions() {
    this.setState({width: window.innerWidth, height: window.innerHeight})
  }

  async fetchSheetScores() {
    const MAHJONG_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnhaUOyUmX4o7bQf1nUcWNr37WcQR80S7_fU4_exvwXBXU7QXTHVtwaJv5Q2qWlk6oEDH2jDDEW3Vw/pub?gid=869579873&single=true&output=csv"

    // const TENHOU_JSON_URL = "https://nodocchi.moe/api/listuser.php?name=0ddba11"
    // Had to set up a proxy to add Cross Origin Header... sillyness
    // Neet to upgrade to HTTPS
    // Also needs to work for STEAM IMAGES
    const TENHOU_JSON_URL = "https://proxy.danylik.com/nodocchi/api/listuser.php?name=0ddba11"

    const rawCells = await fetch(MAHJONG_CSV_URL)
    const rawText = await rawCells.text()
  
    parse(rawText, (err, data) => {
      if (err) {
	console.log("Error parsing csv")
	return
      }

      this.setState({loaded: "CSV parsed okay. Starting calculations..."})

      // HOUSE GAMES
      // split table into 3 man games and four man games
      // delete empty rows from whichever was shorter
      // table structure:
      //  3manDate 3manPlay1 3ManPlay2 3ManPlay3 3ManScore1 3ManScore2 3ManScore3 
      //  4ManDate 4ManPlay1 4ManPlay2 4ManPlay3 4ManPlay4 4ManScore1 4ManScore2 4ManScore3 4ManScore4
      //establish seasons?
      //create player table
      //for each row (game)
      //  1. calculate global score
      //  2. calculate season score
      //  3. calculate dan point score
      //  4. calculate R score

      console.log(data)
    })

    this.setState({loaded: "Loading Tenhou data..."})

    const rawTenhou = await fetch(TENHOU_JSON_URL)
      .then(response => {
	return response.json()
      })

    console.log(rawTenhou)

    this.setState({loaded: "Done loading Tenhou"})
  }

  render() {
    if(this.state) {
    return (
      <Layout location={this.props.location}>
          <Helmet title={`Mahjong | ${config.siteTitle}`} />
	  <div>{this.state.loaded}</div>
	  <svg style={{display: "block"}} width={this.state.width} height={this.state.height} viewBox={`0 0 ${this.state.width} ${this.state.height}`} xmlns="http://www.w3.org/2000/svg">
	    <line
	      x1="0"
	      y1={this.state.height}
	      x2={this.state.width}
	      y2="0"
	      key="line-0"
	      stroke="black" />
	  </svg>
      </Layout>
    );
    }
    else {
      return (
	<Layout location={this.props.location}>
	  <div>Loading</div>
	</Layout>
      )
    }
  }
}

export default MahjongPage;
