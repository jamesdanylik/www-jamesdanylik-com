import React from "react"

class ProjectTracker extends React.Component {
  render() {
    const npmsEdges = this.props.npmsEdges
    return (
      <div>
	<ul>
	  {
	    npmsEdges.map(pkg => {
	      const pkgDate = new Date(Date.parse(pkg.node.collected.metadata.date))
	      const pkgStars = pkg.node.collected.github.starsCount ? ` (${pkg.node.collected.github.starsCount}★)` : ``
	      const pkgDl= pkg.node.collected.npm.downloads[2].count ? ` (${pkg.node.collected.npm.downloads[2].count} dls/month)` : ``
	      return (
		<li key={pkg.node.name}>
		  <a href={pkg.node.collected.metadata.links.homepage}>
		    {pkg.node.name}
		  </a>{pkgStars}{pkgDl} last updated on {pkgDate.toLocaleString()}.
		</li>
	      )
	    })
	  }
	</ul>
      </div>
    )
  }
} 

export default ProjectTracker
