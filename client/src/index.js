import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import Data from './Data'
import Weather from './Weather'

ReactDOM.render(<App />, document.getElementById('root'))
ReactDOM.render(<Weather />, document.getElementById('weather'))
ReactDOM.render(<Data />, document.getElementById('data'))
