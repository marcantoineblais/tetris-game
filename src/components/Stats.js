import React from "react"

const Stats = ({ score, level }) => {
  return (
    <div className="stats">
      <h2>LEVEL {level}</h2>
      <h3>{score} POINT{score ? 'S' : null}</h3>
    </div>
  )
}

export default Stats