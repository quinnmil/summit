import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Data from './components/Data'
import Weather from './components/Weather'

ReactDOM.render(<Weather />, document.getElementById('weather'))
ReactDOM.render(<Data />, document.getElementById('data'))
