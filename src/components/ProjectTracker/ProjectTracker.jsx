import React from "react"

class ProjectTracker extends React.Component {
  render() {
    const npmsEdges = this.props.npmsEdges
    return (
      <div>
	<ul>
	  {
	    npmsEdges.map(pkg => (
	      <li key={pkg.node.name}>
		<a href={pkg.node.collected.metadata.links.homepage}>{pkg.node.name}</a> ({pkg.node.collected.npm.downloads[2].count}) last updated {pkg.node.collected.metadata.date}
	      </li>
	    ))
	  }
	</ul>
      </div>
    )
  }
} 

export default ProjectTracker
