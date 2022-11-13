import React, { useEffect, useRef, useState } from "react"

const NextPieceGrid = ({ piece, blockSize, blockStyle }) => {

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
        
        const mainStyle = {
          width: (blockSize).toString() + 'px',
          height: (blockSize).toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: (blockSize / 8).toString() + 'px'
        }

        return (
          <div className={'block piece ' + piece.color} style={mainStyle} key={i}>
            <div className='face' style={blockStyle.front}></div>
            <div className='face' style={blockStyle.back}></div>
            <div className='face' style={blockStyle.left}></div>
            <div className='face' style={blockStyle.right}></div>
            <div className='face' style={blockStyle.top}></div>
            <div className='face' style={blockStyle.bottom}></div>
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
  }, [piece, blockSize, blockStyle])

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