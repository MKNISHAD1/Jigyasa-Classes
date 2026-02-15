import React from 'react'

function videotest() {
  return (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
    <video
      width="640"
      height="360"
      controls
      style={{ borderRadius: "10px", boxShadow: "0 0 15px rgba(0,0,0,0.3)" }}
    >
      <source src="https://mk-stream-zone.b-cdn.net/Animes/%5BAH%5D%20Witch%20And%20Beast%20S1%20E01%20%5B720p%20%E2%8C%AF%20Dual%5D%20%40Animes_Horizon.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>

  )
}

export default videotest