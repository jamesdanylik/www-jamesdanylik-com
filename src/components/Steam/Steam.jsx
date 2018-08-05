import React, { Component } from "react"
import Link from "gatsby-link"

class Steam extends Component {
  render() {
    return (
      <div>
	<h3>Recent Games</h3>
	<div>
	  {
	    this.props.gamesEdges.map(game => (
	      <div key={game.node.id}>
		<img src={'https://proxy.danylik.com/steam/steamcommunity/public/images/apps/'+game.node.appid+'/'+game.node.img_logo_url+'.jpg'} />
		<a href={"https://store.steampowered.com/app/" + game.node.appid}><h4>{game.node.name}</h4></a>
		<h5>{game.node.playtime_2weeks}/{game.node.playtime_forever}</h5>
	      </div>
	    ))
	  }
	</div>
      </div>
    )
  }
}

export default Steam
