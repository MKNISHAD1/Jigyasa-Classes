import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const PageHero = ({
  tag,
  title,
  highlight,
  title2,
  highlight2,
  description,
  linePosition,
  buttonText,
  buttonIcon,
}) => {
  return (
    <section className="CommonHero">

        <div className="hero-content">

          <h4>{tag}</h4>

          <h1>
            {title} <span>{highlight}</span><br />
            {title2} <span>{highlight2}</span>
          </h1>

            {linePosition === "afterHeading" && (
            <div className="line"></div>
            )}

            <p
            dangerouslySetInnerHTML={{
                __html: description
            }}
            ></p>

            {linePosition === "afterDescription" && (
            <div className="line"></div>
            )}

          {buttonText && (
            <button className="Button_Style p-3">
              {buttonText} <FontAwesomeIcon icon={buttonIcon}/>
            </button>
          )}

        </div>

    </section>
  )
}

export default PageHero