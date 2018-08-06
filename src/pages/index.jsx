import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";

import Steam from "../components/Steam/Steam"

class Index extends React.Component {
  render() {
    const postEdges = this.props.data.allMarkdownRemark.edges;
    return (
      <Layout location={this.props.location}>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <SEO />
	  <h1>Warning!</h1>
	  <h2>Under HEAVY Construction</h2>
	  <div>Currently in the process of porting the site to GatsbyJS v2; source plugins and testing for my users take prioirty over aesthics on the site, so most of my focus is there right now.  You can follow development of the site in the <a href="https://github.com/jamesdanylik/www-jamesdanylik-com">github repository here</a>, following the build logs at <a href="https://travis-ci.org/jamesdanylik/www-jamesdanylik-com">TravisCI here</a>, or check out one of my GatsbyJS source plugins that powers this site:
	    <ul>
	      <li><a href="https://github.com/jamesdanylik/gatsby-source-lastfm">gatsby-source-lastfm</a></li>
	      <li><a href="https://github.com/jamesdanylik/gatsby-source-goodreads">@jamesdanylik/gatsby-source-goodreads</a></li>
	      <li><a href="https://github.com/jamesdanylik/gatsby-source-anilist">gatsby-source-anilist</a></li>
	      <li><a href="https://github.com/jamesdanylik/gatsby-source-steam">gatsby-source-steam</a></li>
	      <li><a href="https://github.com/jamesdanylik/gatsby-source-npms">gatsby-source-npms</a></li>
	      <li><a href="https://github.com/jamesdanylik/gatsby-source-git-commit">gatsby-source-git-commit</a></li>
	    </ul>
	  </div>
	  <div>Last build commit #{this.props.data.allGitCommit.edges[0].node.commitHash} at {this.props.data.site.buildTime}</div>
          <PostListing postEdges={postEdges} />
	  <Steam gamesEdges={this.props.data.allSteamGame.edges} />
        </div>
      </Layout>
    );
  }
}

export default Index;

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [fields___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
            date
          }
          excerpt
          timeToRead
          frontmatter {
            title
            tags
            cover
            date
          }
        }
      }
    }
    allSteamGame {
      edges {
	node {
	  id
	  name
	  playtime_2weeks
	  playtime_forever
	  img_icon_url
	  img_logo_url
	  appid
	}
      }
    }
    site {
      buildTime
    }
    allGitCommit {
      edges {
	node {
	  id
	  commitHash
	}
      }
    }
  }
`;
