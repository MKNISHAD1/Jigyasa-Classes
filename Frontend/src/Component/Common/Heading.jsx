import React from 'react'

const Heading = ({preHeading,heading,text}) => {
  return (
    <>
    <div className="section-heading text-center">
        <span>{preHeading}</span>
        <h3>{heading}</h3>
        <p dangerouslySetInnerHTML={{__html:text}}></p>
    </div>
    </>
  )
}

export default Heading
