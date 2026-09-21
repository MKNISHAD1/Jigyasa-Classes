import React from 'react'
import { useTranslation } from 'react-i18next';
import logo from "../../../assets/images/Logo2.png";

const BrandLogo = () => {
    const { t } = useTranslation();

    return (
        <>
        <div className="Brand_Section">
            <img
                src={logo}
                alt="Jigyasa Classes"
                className="Brand_Logo"
            />

            <div className="Brand_Content">
                <h5 className="Brand_Name">
                    <b>{t("Logo.title")}</b>
                </h5>

                <p className="Brand_Tagline">
                    {t("Logo.tagline")}
                </p>
            </div>
        </div>
    </>
  )
}

export default BrandLogo