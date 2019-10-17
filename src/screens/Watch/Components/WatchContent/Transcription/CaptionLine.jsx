import React, { useState } from 'react'
import { Input, Button, Popup } from 'semantic-ui-react'
import { Spinner } from 'react-bootstrap'
import { useCTContext } from 'components'
import { api, util } from 'utils'
import { ctVideo } from '../ClassTranscribePlayer/CTPlayerUtils'
import { timeStrToSec, timeBetterLook, copyToClipboard } from '../watchUtils'

export function CaptionLine({ line, handleExpand, sendUserAction, isMobile, syncCaptionLine /*, setReadyToEdit*/ }) {
  const [isEditing, setIsEditing] = useState(Boolean(line.wasEditing))
  const [isLoading, setIsLoading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const { generalAlert } = useCTContext()
  const { id, text, index, begin, downVote, upVote, transcriptionId, playlistName, mediaName, mediaId } = line

  const [upVoteNum, setUpVoteNum] = useState(upVote)
  const [downVoteNum, setDownVoteNum] = useState(downVote)

  const isUpVoted = upVote !== upVoteNum
  const isDownVoted = downVote !== downVoteNum

  const SeekToCaption = e => {
    if (playlistName) {
      const { courseNumber } = util.parseSearchQuery()
      window.location = util.links.watch(courseNumber, mediaId, timeStrToSec(begin))
    } else {
      ctVideo.setCurrTime(e, timeStrToSec(begin))
      handleExpand(false)
    }
  }

  const onUpVote = () => {
    if (!isUpVoted) {
      api.captionUpVote(id)
        .then(() => sendUserAction('captionUpVote', { transcriptionId, captionId: id, begin, text }))
      generalAlert({text: 'Liked the caption.', position: 'bottom'}, 1300)
      setUpVoteNum(upVoteNum => upVoteNum + 1)
      if (isDownVoted) {
        setDownVoteNum(downVote)
        api.captionCancelDownVote(id)
      }
    } else if (upVote + 1 === upVoteNum) {
      api.captionCancelUpVote(id)
      setUpVoteNum(upVoteNum => upVoteNum - 1)
    }
  }

  const onDownVote = () => {
    if (!isDownVoted) {
      api.captionDownVote(id)
        .then(() => sendUserAction('captionDownVote', { transcriptionId, captionId: id, begin, text }))
      generalAlert({text: 'Disliked the caption.', position: 'bottom'}, 1300)
      setDownVoteNum(downVoteNum => downVoteNum + 1)
      if (isUpVoted) {
        setUpVoteNum(upVote)
        api.captionCancelUpVote(id)
      }
    } else if (downVote + 1 === downVoteNum) {
      api.captionCancelDownVote(id)
      setDownVoteNum(downVoteNum => downVoteNum - 1)
    }
  }

  const onEditCaption = () => {
    // setIsLoading(true)
    setIsEditing(true)
    syncCaptionLine(index, true, () => {
      // setIsLoading(false)
      setIsEditing(true)
    })
  }

  const onClose = () => {
    setIsEditing(false)
  }

  const onSave = line => {
    setIsEditing(false)
    generalAlert({text: 'Saveing...', position: 'bottom'}, 1200)
    if (line.text === text) {
      generalAlert({text: 'Saved!', position: 'bottom'}, 1200)
      return;
    }
    api.updateCaptionLine(line).then(() => {
      sendUserAction('edittrans', { prevText: text, newText: line.text })
      generalAlert({text: 'Saved!', position: 'bottom'}, 1200)
    })
  }

  const onShare = () => {
    setIsLoading(true)
    const { courseNumber, id } = util.parseSearchQuery()
    const { origin  } = window.location
    const sharedUrl = origin + util.links.watch(courseNumber, id, timeStrToSec(begin))
    copyToClipboard(sharedUrl)
    sendUserAction('sharelink', { sharedUrl, text })
    setTimeout(() => {
      setIsLoading(false)
      setIsSharing(true)
      setTimeout(() => {
        setIsSharing(false)
      }, 1600);
    }, 600);
  }

  const onFocus = ({ target }) => {
    // setReadyToEdit(true)
    // document.getElementById('captions').scrollTop = target.offsetTop - 50
  }

  const onBlur = () => {} //setReadyToEdit(false)

  if (isLoading) return <LineLoader index={index} />
  if (isEditing) return <LineEditor line={line} onClose={onClose} onSave={onSave} />
  if (isSharing) return <LineCopiedPopup index={index} />

  return (
    <div className="line" id={`line-${index}`}>
      {/* Time, upvote and downvote */}
      {
        !playlistName
        &&
        <div className="likes">
          {timeBetterLook(begin)}
          <Button 
            compact className="icon thumbdown" 
            title="Like" aria-label="Like"
            onClick={onUpVote} onFocus={onFocus} onBlur={onBlur}
          >
            <i className={`material-icons ${isUpVoted ? 'clicked' : ''}`}>thumb_up</i>{upVoteNum}
          </Button>
          <Button 
            compact className="icon thumbup" 
            title="Dislike" aria-label="Dislike"
            onClick={onDownVote} onFocus={onFocus} onBlur={onBlur}
          >
            <i className={`material-icons ${isDownVoted ? 'clicked' : ''}`}>thumb_down</i>{downVoteNum}
          </Button>
        </div>
      }

      {
        playlistName && <div className="likes"></div>
      }

      <Popup
        position="top center" inverted
        wide='very'
        content={
          playlistName ? 
          <>Watch this caption in <strong>{`${playlistName}/${mediaName}`}</strong> beginning at <strong>{timeBetterLook(begin)}</strong></>
          : 
          <>Watch this caption at <strong>{timeBetterLook(begin)}</strong></>
        }
        trigger={
          <div 
            className="text" 
            tabIndex={0}
            onClick={SeekToCaption}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {text}
          </div>
        }
      />

      {
        playlistName && <div className="edit"></div>
      }
        
      {/* Edit & Share */}
      {
        !playlistName
        &&
        <div className="edit">
          <Button 
            compact className="icon editBtn" 
            title="edit" aria-label="edit"
            onClick={onEditCaption} onFocus={onFocus} onBlur={onBlur}
          >
            <i className="material-icons">edit</i>
          </Button>
          <Button 
            compact className="icon shareBtn" 
            title="share" aria-label="share"
            onClick={onShare} onFocus={onFocus} onBlur={onBlur}
          >
            <i className="material-icons">share</i>
          </Button>
        </div>
      }
    </div>
  )
}

export function LineEditor({ line, onClose, onSave }) {
  const { text, index, /* id, begin */ } = line
  const [newText, setNewText] = useState(text)
  const handleSave = () => {
    line.text = newText
    onSave(line)
  }
  const handleKeyDown = e => {
    if (e.keyCode === 13) handleSave()
  }
  return (
    <div className="line line-edit" id={`line-${index}`}>
      <Button compact className="edit-button" onClick={onClose}>
        Cancel
      </Button>
      <Input 
        defaultValue={text} autoFocus
        onChange={({target: {value}}) => setNewText(() => value)} 
        onKeyDown={handleKeyDown}
      />
      <Button compact className="edit-button" onClick={handleSave}>
        Save
      </Button>
    </div>
  )
}

export function LineLoader({ index }) {
  const style = index < 0 ? {marginTop: '3em'} : {}
  return (
    <div className="line d-flex justify-content-center" id={`line-${index}`} style={style}>
      <Spinner animation="border" variant="light" />
    </div>
  )
}

function LineCopiedPopup({ index }) {
  return (
    <div className="line d-flex justify-content-center copied" id={`line-${index}`}>
      <i class="material-icons">done_all</i>&ensp;Sharable Link Copied!
    </div>
  )
}
