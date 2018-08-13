import React, { Component } from "react";
import { graphql } from "gatsby";

export const testLastFM = graphql`
  fragment TestLastfm on RootQueryType {
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
`;

class LastFM extends Component {
  componentDidMount() {
    const sortedTracks = this.props.lastEdges.sort((a, b) => {
      return a.node.playbacks.length - b.node.playbacks.length;
    });
  }

  static getImage(arr, size) {
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].size === size && arr[i].text !== "") {
        return arr[i].text;
      }
    }
    return false;
  }

  render() {
    const sortedTracks = this.props.lastEdges.sort(
      (a, b) => b.node.playbacks.length - a.node.playbacks.length
    );
    const topTracks = sortedTracks.slice(0, 5);

    return (
      <div>
        <h3>Music</h3>
        <ol>
          {topTracks.map(tn => {
            const track = tn.node;
            const imageUrl = LastFM.getImage(track.image, "large")
              ? LastFM.getImage(track.image, "large")
              : "https://lastfm-img2.akamaized.net/i/u/174s/c6f59c1e5e7240a4c0d427abd71f3dbb";
            return (
              <li key={track.url}>
                <img width="160px" height="160px" src={imageUrl} />
                <a href={track.url}>
                  <h4>{track.name}</h4>
                </a>
                <a href={track.artist.url}>
                  <h4>{track.artist.name}</h4>
                </a>
                <a href={track.album.url}>
                  <h4>{track.album.name}</h4>
                </a>
                <p>Playbacks: {track.playbacks.length} </p>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
}

export default LastFM;
