import React, { useEffect, useRef, useState } from "react"

const NextPieceGrid = ({ piece, blockSize }) => {

  const [nextPiece, setNextPiece] = useState(null)
  const containerRef = useRef()
  const nextPieceRef = useRef()

  useEffect(() => {
    if (!blockSize) {
      return
    }

    const size = (5 * blockSize).toString()
    containerRef.current.style.height = size + 'px'
    containerRef.current.style.width = size + 'px'
  }, [blockSize])

  useEffect(() => {
    if (!piece) {
      return
    }

    const offsetX = piece.rotationOffset.x * blockSize
    const offsetY = piece.rotationOffset.y * blockSize
    nextPieceRef.current.style.transformOrigin = `${offsetX}px ${offsetY}px`
    const rotation = setInterval(() => {
      const degrees = (parseInt(nextPieceRef.current.style.transform.slice(8, 11)) + 1) % 360 || 0
      nextPieceRef.current.style.transform = 'rotateY(' + degrees.toString() + 'deg) rotateX(5deg)'
    }, 50)
    
    return () => {
      clearInterval(rotation)
    }
  }, [piece, blockSize])

  useEffect(() => {
    if (!piece) {
      return
    }

    const renderPiece = () => {
      const blocks = piece.coordinates.map((coord, i) => {
        const coordX = coord.x * blockSize
        const coordY = coord.y * blockSize
        
        const blockStyle = {
          width: (blockSize).toString() + 'px',
          height: (blockSize).toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px'
        }

        const faceStyle = {
          width: (blockSize).toString() + 'px',
          height: (blockSize).toString() + 'px'
        }

        return (
          <div className='block' style={blockStyle} key={i}>
            <div className={'front next-piece ' + piece.color} style={faceStyle}></div>
            <div className={'back next-piece ' + piece.color} style={faceStyle}></div>
            <div className={'left next-piece ' + piece.color} style={faceStyle}></div>
            <div className={'right next-piece ' + piece.color} style={faceStyle}></div>
            <div className={'top next-piece ' + piece.color} style={faceStyle}></div>
            <div className={'bottom next-piece ' + piece.color} style={faceStyle}></div>
          </div>
        )
      })
            
      setNextPiece(blocks)
    }

    const left = (piece.geoCenter.x * blockSize).toString() + 'px'
    const top = (piece.geoCenter.y * blockSize).toString() + 'px'
    nextPieceRef.current.style.left = left
    nextPieceRef.current.style.top = top
    
    renderPiece()
  }, [piece, blockSize])

  return (
    <div className="next-grid-content">
      <h2>COMING NEXT</h2>
      <div ref={containerRef} className="grid">
        <div ref={nextPieceRef} className="blocks" style={{ position: 'absolute' }}>{nextPiece}</div>
      </div>
    </div>
  )
}

export default NextPieceGrid