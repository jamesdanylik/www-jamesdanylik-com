import React, { Component } from "react";
import { graphql } from "gatsby";

export const testAnilist = graphql`
  fragment TestAnilist on Query {
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
`;

class Anilist extends Component {
  render() {
    return (
      <div>
        <h3>Seasonal Anilist</h3>
      </div>
    );
  }
}

export default Anilist;
