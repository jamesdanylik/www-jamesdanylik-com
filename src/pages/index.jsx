import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";

import Steam from "../components/Steam/Steam";
import ProjectTracker from "../components/ProjectTracker/ProjectTracker";
import Goodreads from "../components/Goodreads/Goodreads";
import LastFM from "../components/LastFM/LastFM";
import Anilist from "../components/Anilist/Anilist";
import BuildMeta from "../components/BuildMeta/BuildMeta";

class Index extends React.Component {
  render() {
    const postEdges = this.props.data.allMarkdownRemark.edges;
    const steamEdges = this.props.data.allSteamGame.edges;
    const npmsEdges = this.props.data.allNpmsPackage.edges;
    const buildCommit = this.props.data.allGitCommit.edges[0].node.commitHash;
    const travisBuild = this.props.data.allGitCommit.edges[0].node.travisNum;
    const travisId = this.props.data.allGitCommit.edges[0].node.travisId;
    const reviewEdges = this.props.data.allGoodreadsShelf.edges;
    const lastEdges = this.props.data.allLastfmTrack.edges;
    const buildTime = new Date(Date.parse(this.props.data.site.buildTime));

    return (
      <Layout location={this.props.location}>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <SEO />
          <h1>Warning!</h1>
          <h2>Under HEAVY Construction</h2>
          <div>
            Currently in the process of porting the site to GatsbyJS v2; getting
            source plugins moved over and tested takes prioirty over aesthetics
            on the site, so most of my focus is there right now. You can follow
            development of the site in the{" "}
            <a href="https://github.com/jamesdanylik/www-jamesdanylik-com">
              github repository here
            </a>, following the build logs at{" "}
            <a href="https://travis-ci.org/jamesdanylik/www-jamesdanylik-com">
              TravisCI here
            </a>, or check out one of my GatsbyJS source plugins that powers
            this site:
            <ProjectTracker npmsEdges={npmsEdges} />
          </div>
          <div>
            Now viewing commit{" "}
            <a
              href={`https://github.com/jamesdanylik/www-jamesdanylik-com/commit/${buildCommit}`}
            >
              {buildCommit.slice(0, 7)}
            </a>, from{" "}
            <a
              href={`https://travis-ci.org/jamesdanylik/www-jamesdanylik-com/builds/${travisId}`}
            >
              #{travisBuild}
            </a>{" "}
            {buildTime.toLocaleString()}.
          </div>
          <PostListing postEdges={postEdges} />
          <LastFM lastEdges={lastEdges} />
          <Steam gamesEdges={steamEdges} />
          <Goodreads reviewEdges={reviewEdges} />
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
          commitHash
          travisId
          travisNum
        }
      }
    }
    allLastfmTrack {
      edges {
        node {
          name
          url
          image {
            text
            size
          }
          artist {
            name
            url
          }
          album {
            name
            url
          }
          playbacks {
            id
          }
        }
      }
    }
    allGoodreadsShelf {
      edges {
        node {
          id
          name
          reviews {
            id
            rating
            recommended_by
            recommended_for
            started_at
            read_at
            date_added
            date_updated
            read_count
            book {
              id
              title
              image_url
              link
              publication_year
              authors {
                id
                link
                name
              }
            }
          }
        }
      }
    }
    allNpmsPackage {
      edges {
        node {
          id
          name
          collected {
            npm {
              dependentsCount
              starsCount
              downloads {
                from
                to
                count
              }
              starsCount
            }
            github {
              starsCount
              forksCount
              subscribersCount
              starsCount
            }
            metadata {
              name
              version
              description
              date
              links {
                npm
                homepage
                repository
                bugs
              }
            }
          }
        }
      }
    }
  }
`;
