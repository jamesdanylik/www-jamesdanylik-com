import React from "react"
import Helmet from "react-helmet"
import { graphql } from "gatsby"

class testLastFM extends React.Component {
  render() {
    const lastFMData = this.props.data.allLastfmPlayback.edges
    return (
      <div id="test-data">
	<Helmet title="gatsby-source-lastfm test page" />
	{JSON.stringify(lastFMData)}
      </div>
    ) 
  }
}

export default testLastFM

export const pageQuery = graphql`
  query TestLastFMQuery {
    allLastfmPlayback {
    edges {
      node {
        id
        date
        track {
          id
          name
          loved
          mbid
          streamable
          url
          image {
            text
            size
          }
          artist {
            id
            name
            url
            mbid
            image {
              text
              size
            }
          }
          album {
            id
            name
            url
            mbid
          }
          playbacks {
            id
            date
          }
        }
      }
    }
  }
  }
`
