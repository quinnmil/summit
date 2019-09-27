import React from 'react'
import axios from 'axios' // Used for making AJAX requests

const API = 'https://jsonplaceholder.typicode.com/users'

class Data extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    }
  }

  callAPI () {
    // Make a get request
    axios.get(API)
      .then(response => {
        // Handle success
        this.setState({
          isLoaded: true,
          items: response.data
        })
      }
      )
      .catch(function (error) {
        // Handle error
        console.log(error)
      })
      .finally(function () {
        // Always executed
      })
  }

  componentDidMount () {
    // Load data into component here
    // this allows you load it into
    // the component's state
    this.callAPI()
  }

  render () {
    const { items } = this.state
    return (
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name}: {item.email}
          </li>
        ))}
      </ul>
    )
  }
}

export default Data
