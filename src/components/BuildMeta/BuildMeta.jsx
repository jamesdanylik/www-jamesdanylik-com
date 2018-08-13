import React, { Component } from "react";
import { graphql } from "gatsby";

export const testGitcommit = graphql`
  fragment TestGitcommit on RootQueryType {
    allGitCommit {
      edges {
        node {
          commitHash
          travisId
          travisNum
        }
      }
    }
  }
`;

class BuildMeta extends Component {
  render() {
    return <div />;
  }
}

export default BuildMeta;
