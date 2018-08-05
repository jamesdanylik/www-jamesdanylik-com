import React from "react"
import Helmet from "react-helmet"
import { graphql } from "gatsby"

class testSteam extends React.Component {
  render() {
    const steamData = this.props.data.allSteamGame.edges
    return (
      <div id="test-data">
        <Helmet title="gatsby-source-steam test page" />
        {JSON.stringify(steamData)}
      </div>
    ) 
  }
}

export default testSteam

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query TestSteamQuery {
    allSteamGame {
      edges {
	node {
	  id
	  name
	  playtime_2weeks
	  playtime_forever
	  img_icon_url
	  img_logo_url
	}
      }
    }
  }
`
