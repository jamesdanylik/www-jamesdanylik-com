import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";

import Link from "gatsby-link";

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
    const { travisNum, travisId } = this.props.data.allGitCommit.edges[0].node;
    const reviewEdges = this.props.data.allGoodreadsShelf.edges;
    const lastEdges = this.props.data.allLastfmTrack.edges;
    const buildTime = new Date(Date.parse(this.props.data.site.buildTime));
    const commitTime = new Date(this.props.data.allGitCommit.edges[0].node.commitDate * 1000);
    const commitSubject = this.props.data.allGitCommit.edges[0].node.commitSubject;

    return (
      <Layout location={this.props.location}>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <SEO />
          <h1>Warning!</h1>
          <h2>Under <em>HEAVY</em> Construction: Open in Development!</h2>

          <div>
	    <p>
	      <b>01/26/19</b> -- So that was big gap, huh?  The downtime was primarily a result of my main workstation quite literally erupting into flames, but I can't entirely blame that -- I also got a new job and a new 3d printer!  Expect more updates soon, but I'm still in the process of getting everything sorted, so no promises... yet! 
	    </p>
            <p>
              <b>10/26/18</b> -- Wow, I've been busy lately!  Still working on getting an automated process set up for the Tenhou service; got some more advice on how I can improve its schema and reporting capabilities, so it's probably worth the wait.  Also, 2 bugs have come to my attention: first, gatsby-source-steam fails if you've played no games recently. It adds no nodes to the schema and queries dependent on them fail, which isn't great obviously, but perhaps worse, gatsby-source-lastfm is getting less tracks then requested <i>sometimes</i> and failing unit tests.  
            </p>
            <p>In the first case, I'm still deciding what to do, since the plugin itself doesn't really seem to fail -- only the queries that expect it to have added nodes to the schema -- so perhaps the smartest thing to do is fix that at the application level?</p>

            <p>
                In the second... well, I'm not too sure where those lost tracks are going yet, or what triggers the behavior.  Next steps seem to be dump out what tracks were present when the process fails, and try to identify which ones are missing from GraphQL.  Additionally, all these little hard-coded asides on the homepage, while my article systems sits completely full of test data is getting a little ridiculous.  I'll Try My Best&trade; to get it worked out as soon as possible. 
            </p>

            <p>
              <b>09/27/18</b> -- My replacement for <a href="http://nodocchi.moe">nodocchi.moe</a> is done! (<a href="https://tenhou.danylik.com/index.php?user=0ddba11">tenhou.danylik.com</a>)  Well, not quite done -- but far enough along to bring Tenhou functionality back online for <Link to="/mahjong/"> our house mahjong graphs!</Link>  Stay tuned for complete API docs / standalone site soon!
            </p>
            <p>
              <b>09/16/18</b> -- It turns out{" "}
              <a href="http://nodocchi.moe">nodocchi.moe</a> isn{"'"}t
              actually down; in fact, it looks like they just banned us in
              particular -- guess they didn{"'"}t like us
	      getting our <a href="http://tenhou.net">tenhou.net</a> data from them, even though they have an
              export button... whoops! Consequently, tenhou graphing is down until
              I find a new source for that data. Kinda strikes me as odd, but on the other hand I didn{"'"} really ask to
              use it, so I guess they don{"'"}t really have to notify me when they block me, either!
            </p>
            <p>
              I{"'"}m working on creating my own database, but that means
	      translating the <a href="http://tenhou.net/sc/raw/">tenhou.net API documents</a>,
              implementing a parser for game logs,
              before collecting every game ever played on the service. Only then can I put up a quick API
              endpoint somewhere, and get my graphs back. Since I{"'"}m now doing all that work anyway, I
              figure I might as well go the extra mile and try to make something
              usuable for people in the English community who want to do stuff
              like this. It strikes me as terribly innefficent to just have
              everyone redoing the same work over and over again, pounding the
              tenhou servers with unneccasary work.
            </p>
            <p>
	      I{"'"}m also increasingly liking these asides on the frontpage.  They're distinct from acticles in a nice way and serve to mark progress, but writing all this inline in the index page is silly.  Perhaps I can try putting these messagges as commit messages.  If I spend more time squashing down development commits, that could work.  
            </p>
          </div>

          <br />
          <div>
            <b>08/22/18</b> -- Check the progress of{" "}
            <Link to="/mahjong/">
              the house mahjong calculator, React version!
            </Link>{" "}
            Originally a python script, now it runs in anybody{"'"}s browser on
            demand! Or check out{" "}
            <a
              href={`https://github.com/jamesdanylik/www-jamesdanylik-com/blob/${buildCommit}/src/pages/mahjong.jsx`}
            >
              the source code here on Github
            </a>!
          </div>

          <br />

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
            Now viewing build{" "}
            <a
              href={`https://travis-ci.org/jamesdanylik/www-jamesdanylik-com/builds/${travisId}`}
            >
              #{travisNum}
            </a> made{" "}
            {buildTime.toLocaleString()} of{" "}
            <a
              href={`https://github.com/jamesdanylik/www-jamesdanylik-com/commit/${buildCommit}`}
            >
              {buildCommit.slice(0, 7)} | "{commitSubject}"
            </a> on {commitTime.toLocaleString()}.
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
	  commitDate
    commitSubject
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
