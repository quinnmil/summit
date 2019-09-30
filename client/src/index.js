import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import Data from './components/Data'
import Weather from './components/Weather'

ReactDOM.render(<App />, document.getElementById('root'))
ReactDOM.render(<Weather />, document.getElementById('weather'))
ReactDOM.render(<Data />, document.getElementById('data'))
