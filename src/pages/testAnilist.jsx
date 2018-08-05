import React from "react"
import Helmet from "react-helmet"
import { graphql } from "gatsby"

class testAnilist extends React.Component {
  render() {
    const anilistData = this.props.data.allAnilistMedialistcollection.edges
    return (
      <div id="test-data">
        <Helmet title="gatsby-source-anilist test page" />
        {JSON.stringify(anilistData)}
      </div>
    ) 
  }
}

export default testAnilist

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query TestAnilistQuery {
    allAnilistMedialistcollection {
      edges {
	node {
	  id
	  lists {
	    name
	    entries {
	      media {
		id
		title {
		  romaji
		  english
		  native
		  userPreferred
		}
		season
		startDate {
		  year
		  month
		  day
		}
		endDate {
		  year
		  month
		  day
		}
	      }
	    }
	    isCustomList
	    isSplitCompletedList
	    status
	  }
	}
      }
    }
  }
`
