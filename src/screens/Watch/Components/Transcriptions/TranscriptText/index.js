import React from 'react'
import { Popup } from 'semantic-ui-react'
import './index.css'
import {
  transControl,
  videoControl,
  timeStrToSec,
  prettierTimeStr,
  WEBVTT_DESCRIPTIONS
} from '../../../Utils'

export default function TranscriptText({
  caption={},
  isCurrent=false,
}) {

  const { text='', id, begin, index, kind } = caption

  const handleSeek = () => {
    let time = timeStrToSec(begin)
    videoControl.currTime(time)
  }

  const handleKeyDown = e => {
    if (e.keyCode === 13) {
      handleSeek()
    } 
  }

  const timeStr = prettierTimeStr(begin)

  return (
    <Popup inverted wide basic
      position="top left"
      openOnTriggerClick={false}
      openOnTriggerFocus
      closeOnTriggerBlur
      content={timeStr}
      trigger={
        <p 
          id={`caption-line-${id}`} 
          className="article-text"
          kind={kind}
          current={isCurrent.toString()}
          onClick={handleSeek}
          //onDoubleClick={() => alert('tes')} // maybe for editing in the future ?
          onKeyDown={handleKeyDown}
          //tabIndex="0"
        >
          {
            kind === WEBVTT_DESCRIPTIONS 
            && 
            <span className="description-line-text-title">(Description)<br/></span>
          }
          {text}
        </p>
      }
    />
  )
}