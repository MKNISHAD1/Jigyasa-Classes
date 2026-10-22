import React from "react";

const DashboardHero = ({
    title,
    description,
    secondaryDescription,
    image,
}) => {
    return (
        <section className="Dashboard_Hero">

            <div className="Dashboard_Hero_Content">
                <h1>{title}</h1>

                {description && (
                    <p className="Dashboard_Hero_Description">
                        {description}
                    </p>
                )}

                {secondaryDescription && (
                    <p className="Dashboard_Hero_Secondary">
                        {secondaryDescription}
                    </p>
                )}
            </div>

            {image && (
                <div className="Dashboard_Hero_Image_Wrapper">
                    <img
                        src={image}
                        alt=""
                        className="Dashboard_Hero_Image"
                    />
                </div>
            )}

        </section>
    );
};

export default DashboardHero;