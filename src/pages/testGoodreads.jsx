import React from "react"
import Helmet from "react-helmet"
import { graphql } from "gatsby"

class testGoodreads extends React.Component {
  render() {
    const goodreadsData = this.props.data.allGoodreadsShelf.edges
    return (
      <div id="test-data">
        <Helmet title="gatsby-source-goodreads test page" />
        {JSON.stringify(goodreadsData)}
      </div>
    ) 
  }
}

export default testGoodreads

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query TestGoodreadsQuery {
    allGoodreadsShelf {
      edges {
        node {
          id
          name
          reviews {
            id
            book {
              id
              title
              authors {
                id
                name
                books {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`
