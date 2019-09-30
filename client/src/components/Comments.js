import React from 'react'

const Comments = ({ comments }) => {
  return (
    <div>
      {comments.map((comment) => (
        <div class='weather_block' key={comment._id}>
          <p id='comment'>{comment.text}</p>
          <small className='text-muted'>Posted on {comment.datePublished} Source: {comment.source}</small>
          <hr />
        </div>
      ))}
    </div>
  )
}

export default Comments
