import React, { useEffect, useState } from 'react'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faClock, faEnvelope, faLocationDot, faMailBulk, faPaperPlane, faPhone } from '@fortawesome/free-solid-svg-icons'
import help from '../../../assets/images/help3.png';
import { apiUrl } from '../../Common/http';
import { toast } from 'react-toastify';
import FaqSection from '../../backend/courses/FaqSection';

const ContactUi = () => {

    const [faqs, setFaqs] = useState([]);
    const [faqLoading, setFaqLoading] = useState(true);

    // Fetch FAQ List
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch(apiUrl + "list-faqs");
                const result = await res.json();

                if (result.status) {
                    setFaqs(result.faqs);
                }
            } catch (error) {
                console.error("Failed to fetch FAQs:", error);
                toast.error("Failed to fetch FAQs");
            } finally {
                setFaqLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    // Filter FAQ
    const generalFaqs = faqs.filter(
        (faq) =>
            faq.type === "general" &&
            faq.status === true
    );
    
    const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    subject: "",
    message: ""
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        setLoading(true);

        const res = await fetch(
        apiUrl + "contact-us",
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        }
        );

        const result = await res.json();

        if (result.status) {

        toast.success(result.message);

        setFormData({
            name: "",
            email: "",
            phone: "",
            category: "",
            subject: "",
            message: ""
        });

        } else {

        toast.error(
            result.message || "Failed"
        );

        }

    } catch (error) {

        toast.error(
        "Failed to send message"
        );

    } finally {

        setLoading(false);

    }

    };

return (
    <>
        {/* Header  */}
        <HeaderUi/>

        {/* Help Hero Section  */}
        <div className="Hero_Section">
            <div className="container-fluid Hero_Body p-4">
                <div className="row">
                    {/* Hero Content */}
                    <div className="col-lg-6 Hero_Content" >

                        <small className="Hero_Tag">Contact Us </small>

                        <h1> We Are Here To <br /> <span> Help You !</span> </h1>

                        <p> Have questions or need guidance? <br />
                            Reach out to us and we'll get back to you as soon as possible.
                        </p>

                        <div className="Help_Items_Group">

                            <div className="Help_Item">
                                <div className="Item_Group">
                                    <FontAwesomeIcon icon={faPhone} className='Item_Icon'/>
                                    <div className="Item_Data">
                                        <h4 className="Help_Title">Talk to Our Team </h4>
                                        <small className="Help_Subtitle">We are available to assist you.</small>
                                    </div>
                                </div>
                            </div>

                            <div className="Help_Item">
                                <div className="Item_Group">
                                    <FontAwesomeIcon icon={faMailBulk} className='Item_Icon'/>
                                    <div className="Item_Data">
                                        <h4 className="Help_Title">Email Us </h4>
                                        <small className="Help_Subtitle">Send us an email anytime</small>
                                    </div>
                                </div>
                            </div>

                            <div className="Help_Item">
                                <div className="Item_Group">
                                    <FontAwesomeIcon icon={faLocationDot} className='Item_Icon'/>
                                    <div className="Item_Data">
                                        <h4 className="Help_Title">Visit Our Office</h4>
                                        <small className="Help_Subtitle">we'd love to meet you in person.</small>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Contact Us Form */}
                    <div className="col-lg-6  Message_Section">
                        <h4>Send Us A <span>Message</span></h4>
                        <div className="Line1"></div><br />

                        <form onSubmit={handleSubmit} >
                            <div className="row ">

                                {/* Name Field */}
                                <div className="col-12 col-md-6 mb-4">
                                    <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Your Name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                        ...formData,
                                        name: e.target.value,
                                        })
                                    }
                                    required
                                    />
                                </div>

                                {/* Phone No. Field */}
                                <div className="col-12 col-md-6 mb-4">
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder="Enter Your Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // 1. Allow only digits
                                            // 2. Prevent entering more than 10 digits
                                            // 3. Ensure the first digit is between 6 and 9
                                            if (/^\d*$/.test(val) && val.length <= 10) {
                                                if (val.length === 0 || /^[6-9]/.test(val)) {
                                                    setFormData({
                                                        ...formData,
                                                        phone: val,
                                                    });
                                                }
                                            }
                                        }}
                                        // Native HTML validation on form submission
                                        pattern="[6-9][0-9]{9}"
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                {/* Email Field */}
                                <div className='mb-4'>
                                <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Enter Your Email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                            ...formData,
                                            email: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                {/* Select Category */}
                                <div className="col-12 col-md-6 mb-4">
                                        <select className="form-select" 
                                            value={formData.category}
                                            onChange={(e) =>
                                                setFormData({
                                                ...formData,
                                                category: e.target.value,
                                                })
                                            }
                                            required>
                                        <option value="General Enquiry">General Enquiry</option>
                                        <option value="Course Related Enquiry">Course Related Enquiry</option>
                                        <option value="Technical Issue">Technical Issue</option>
                                        <option value="Payment Issue">Payment Issue</option>
                                        <option value="Become A Teacher">Become A Teacher</option>
                                        <option value="Feedback / Suggestions">Feedback / Suggestions </option>
                                        <option value="Other">Other</option>
                                        </select>
                                </div>

                                {/* Subject */}
                                <div className="col-12 col-md-6 mb-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Subject"
                                        value={formData.subject}
                                        onChange={(e) =>
                                            setFormData({
                                            ...formData,
                                            subject: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder ="Have questions or need guidance? Reach out to us and we'll get back to you as soon as possible"
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({
                                        ...formData,
                                        message: e.target.value,
                                        })
                                    }
                                    required 
                                />
                                </div>

                                {/* Send MEssage Button */}
                                <button 
                                    disabled={loading} 
                                    type='submit' 
                                    className="btn blue-btn w-100 mt-3"
                                >
                                    {loading ? (
                        
                                        <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2 text-light"
                                            role="status"
                                        />
                        
                                            <span className='text-primary'>Sending Message... </span>
                        
                                        </>
                        
                                        ) : (
                        
                                            <>
                                            Send Message <FontAwesomeIcon icon={faPaperPlane} />
                                            </>
                        
                                        )}
                                    
                                </button>

                            </div> 
                        </form>
                    </div>
                </div>
            </div>
        </div>

        {/* Help Cards  */}
        <div className="Help_Card_Section container-fluid">
            <div className="row">

                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="Help_Card shadow">
                        <div className="Help_Card_Icon">
                            <FontAwesomeIcon icon={faEnvelope} /> 
                        </div>
                        <div className="Help_Card_Body">
                            <b> Email Us </b>
                            <small>support@jigyasaclasses.com <br /> we reply within 24 hours</small>
                        </div>
                    </div>
                </div>
                
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="Help_Card shadow ">
                        <div className="Help_Card_Icon">
                            <FontAwesomeIcon icon={faPhone} /> 
                        </div>
                        <div className="Help_Card_Body">
                            <b> Call Us </b>
                            <small>+91 9867543210 <br />Mon - Sat, 9:00 AM - 6:00 PM</small>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="Help_Card shadow">
                        <div className="Help_Card_Icon">
                            <FontAwesomeIcon icon={faLocationDot} /> 
                        </div>
                        <div className="Help_Card_Body">
                            <b> Visit Us </b>
                            <small>123 Education Hub, Knowledge City,Pune - 411057, India</small>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="Help_Card shadow ">
                        <div className="Help_Card_Icon">
                            <FontAwesomeIcon icon={faClock} /> 
                        </div>
                        <div className="Help_Card_Body">
                            <b> Working Hours </b>
                            <small>Mon - Sat, 9:00 AM - 6:00 PM <br />Sunday : Closed</small>
                        </div>
                    </div>
                </div>

            </div>    
        </div>

        {/* Faq Section  */}
        <div className="Help_Faq_Section container-fluid">
            <div className="row">

                {/* Faq Img */}
                <div className="col-md-6 Img_Section text-center">
                    <img
                        src={help}
                        className='Faq_Img'
                        alt="Frequently asked questions"
                    />
                </div>

                {/* Faq Data */}
                <div className="col-md-6 Questions_Section">

                    {faqLoading ? (
                        <div className="Faq_Loading">
                            Loading FAQs...
                        </div>
                    ) : generalFaqs.length > 0 && (

                        <FaqSection 
                            faqs={generalFaqs}
                            subtitle="Find answers to the most common questions about Jigyasa Classes"
                        />

                    )}

                </div>

            </div>
        </div>

        {/* footer  */}
        <FooterUi/>
    </>
  )
}

export default ContactUi