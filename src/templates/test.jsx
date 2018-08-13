import React, { Component } from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";

export default class TestTemplate extends Component {
  render() {
    const { pluginName, pluginQuery } = this.props.pageContext;
    return (
      <div id="test-data">
        <Helmet title={`${pluginName} test page`} />
        {JSON.stringify(this.props.data[pluginQuery].edges)}
      </div>
    );
  }
}

export const pageQuery = graphql`
  query TestQuery {
    ...TestLastfm
    ...TestGoodreads
    ...TestSteam
    ...TestAnilist
    ...TestNpms
    ...TestGitcommit
  }
`;
