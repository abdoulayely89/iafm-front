import React from 'react'
import { Empty } from 'antd'

function VideoPlayer({ src }) {
  if (!src) {
    return <Empty description="Aucune vidéo sélectionnée." />
  }

  return (
    <div className="video-player-wrapper">
      <video
        key={src}
        className="video-player"
        src={src}
        controls
        controlsList="nodownload"
      />
    </div>
  )
}

export default VideoPlayer
