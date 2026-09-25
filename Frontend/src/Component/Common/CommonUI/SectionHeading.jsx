import React from 'react'

const SectionHeading = ({ title, subtitle }) => {

    return (
        <div className="Section_Heading">
            <div className="Blur_Overlap">

                <h2 className="Section_Heading_Title" >
                    {title}
                </h2>

                {subtitle && (
                    <p className="Section_Heading_Subtitle">
                        {subtitle}
                    </p>
                )}

                <div className='Line'></div>
            </div>
        </div>
    );
};

export default SectionHeading;


