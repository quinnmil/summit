import React from 'react'

const Comments = ({ comments }) => {
  return (
    <div>
      <center><h1>Comments</h1></center>
      {comments.map((comment) => (
        <li key={comment._id}>
          <div class='card'>
            <div class='card-body'>
              <h5 class='card-title'>{comment.datePublished}</h5>
              <h6 class='card-subtitle mb-2 text-muted'>{comment.source}</h6>
              <p class='card-text'>{comment.text}</p>
            </div>
          </div>
        </li>
      ))}
    </div>
  )
}

export default Comments
