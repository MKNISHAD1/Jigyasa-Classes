import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'

const InfoItemUi = ({
  icon,
  title,
  subtitle,
  className = "",
}) => {
  return (
    <div className="info-icon-card ">
      
      <div className={`icon ${className}`}>
        <FontAwesomeIcon icon={icon} />
      </div>

      <div className="body">
        <h4>{title}</h4>

        {subtitle && (
          <small
                      dangerouslySetInnerHTML={{
                __html: subtitle
            }}></small>
        )}
      </div>

    </div>
  );
};

export default InfoItemUi