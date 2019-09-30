import React from 'react'

const Comments = ({ comments }) => {
  return (
    <div>
      {comments.map((comment) => (
        <li key={comment._id}>
          <div className='card'>
            <div className='card-body'>
              <h5 className='card-title'>{comment.datePublished}</h5>
              <h6 className='card-subtitle mb-2 text-muted'>{comment.source}</h6>
              <p className='card-text'>{comment.text}</p>
            </div>
          </div>
        </li>
      ))}
    </div>
  )
}

export default Comments
