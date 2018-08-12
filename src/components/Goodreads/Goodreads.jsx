import React, { Component } from "react"
import { graphql } from "gatsby"

export const testGoodreads = graphql`
  fragment TestGoodreads on RootQueryType {
    allGoodreadsShelf {
      edges {
        node {
          id
          name
          reviews {
            id
            book {
              id
              title
              authors {
                id
                name
                books {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

class Goodreads extends Component {
  constructor() {
    super()
  }

  getShelf(name) {
    const shelves = this.props.reviewEdges
    for( var i = 0; i < shelves.length; i++) {
      if( shelves[i].node.name === name ) {
	return shelves[i].node
      }
    }
    return null
  }

  componentDidMount() {
    
  }

  render () {
    const currentBook = this.getShelf("currently-reading").reviews[0].book
    const lastBook = this.getShelf("read").reviews[0].book
   
    return (
      <div>
	<h3>Books</h3>
	<h3>Currently Reading</h3>
	<img style={{height: '160px'}} src={currentBook.image_url} />
	<a href={currentBook.link}><h4>{currentBook.title}</h4></a>
	<h4>By <a href={currentBook.authors[0].link}>{currentBook.authors[0].name}</a></h4>
	<h3>Last Read</h3>
        <img style={{height: '160px'}} src={lastBook.image_url} />
        <a href={lastBook.link}><h4>{lastBook.title}</h4></a>
        <h4>By <a href={lastBook.authors[0].link}>{lastBook.authors[0].name}</a></h4>

      </div>
    )
  }
}

export default Goodreads
