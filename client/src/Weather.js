import React from 'react'
import axios from 'axios' // Used for making AJAX requests

const API = 'http://localhost:9000/get_weather/south_sister/'

class Weather extends React.Component {
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
      },
      error => {
        this.setState({
          isLoaded: true,
          error
        })
      })
  }

  componentDidMount () {
    // Load data into component here
    // this allows you load it into
    // the component's state
    this.callAPI()
  }

  render () {
    const { error, isLoaded, items } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      /* Show loading indicator while fetching data */
      return <div>Loading...</div>
    } else {
      return (
        <ul>
          {items.map(item => (
            <li key={item.number}>
              {item.name}: {item.shortForecast}
            </li>
          ))}
        </ul>
      )
    }
  }
}

export default Weather
