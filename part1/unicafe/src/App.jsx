import { useState } from 'react'
import './App.css'

const Button = (props) => {
  return (
    <button onClick={props.onClick}>{props.text}</button>
  )
}

const StatisticsLine = (props) => {
  return (
    <thead>
      <tr>
        <td>{props.text}</td>
        <td>{props.value}</td>
      </tr>
    </thead>

  )
}

const Statistics = (props) => {
  const {good, neutral, bad} = props
  const all = good + neutral + bad
  const average = all > 0 ? (good - bad) / all : 0;
  const positive = all > 0 ? good / all * 100 : 0;

  if (all == 0) {
    return (
      <p>No feedback given</p>
    )
  }

  return (
    <>
      <table>
        <StatisticsLine text="good" value={good} /> 
        <StatisticsLine text="neutral" value={neutral} />
        <StatisticsLine text="bad" value={bad} />
        <StatisticsLine text="all" value={all} />
        <StatisticsLine text="average" value={average} />
        <StatisticsLine text="positive" value={positive} />
      </table>
    </>
  ) 
}

function App() {
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <>
      <h1>give feedback</h1>
      <Button onClick={() => setGood(good + 1)} text="good"/>
      <Button onClick={() => setNeutral(neutral + 1)} text="neutral" />
      <Button onClick={() => setBad(bad + 1)} text="bad" />
      <h1>statistics</h1>
      <Statistics good={good} neutral={neutral} bad={bad}/>
    </>
  )
}

export default App