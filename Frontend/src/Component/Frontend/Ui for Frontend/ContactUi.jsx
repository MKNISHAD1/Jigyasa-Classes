import React, { useState } from 'react'
import Accordion from "react-bootstrap/Accordion";
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faClock, faEnvelope, faLocation, faLocationDot, faLocationPin, faMailBulk, faMailForward, faMessage, faPaperPlane, faPhone } from '@fortawesome/free-solid-svg-icons'
import help from '../../../assets/images/help2.png';
import PageHero from '../../Common/CommonUI/PageHeroUi'
import InfoItemUi from '../../Common/CommonUI/InfoItemUi'
import { apiUrl } from '../../Common/http';
import { toast } from 'react-toastify';


const ContactUi = () => {

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

 {/* Help Section  */}
<div className="Help-Section container-fluid p-5">
    <div className="row p-2">
        <div className="col-lg-6 p-4" >

            <PageHero
                tag="Contact Us"
                title="We're Here to"
                highlight="Help You"
                description="
                Have questions or need guidance?
                Reach out to us and we'll get back to
                you as soon as possible.
                "
                linePosition="afterDescription"
            />
            <br />

            <div className=" help-icons d-flex">
            <InfoItemUi
                icon={faPhone}
                title="Talk to Our Team"
                subtitle="We are available to assist you."
                className="p-3"
            />

            <InfoItemUi 
                icon={faMailBulk}
                title="Email Us"
                subtitle="Send us an email anytime"
                className="p-3"
            />

            <InfoItemUi 
                icon={faLocationDot}
                title="Visit Our Office"
                subtitle="we'd love to meet you in person."
                className="p-3"
            />
            </div>


        </div>
        {/* Contact Us Form */}
        <div className="col-lg-6 shadow p-4 message-section">

                <h4>Send Us a <span>Message</span></h4>
                <div className="line1"></div><br />

                <form onSubmit={handleSubmit}>
                    <div className="row ">

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

                        <div className="col-12 col-md-6 mb-4">
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="Enter Your Phone Number"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

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

                        <button  type='submit' className="btn btn-primary w-100 mt-3">
                            Send Message <FontAwesomeIcon icon={faPaperPlane} />
                        </button>

                    </div> 
                </form>
    
        </div>
    </div>
</div>
<br />

{/* help card  */}
<div className="help-card container-fluid ">
    <div className="row">
        <div className="col-12 col-sm-6 col-lg-3">
            <div className="help-icons d-flex shadow ">
                <div className="icon">
                    <FontAwesomeIcon icon={faEnvelope} /> 
                </div>
                <div className="body">
                    <b> Email Us </b> <br /><small>support@jigyasaclasses.com <br /> we reply within 24 hours</small>
                </div>
            </div>
        </div>
        
        <div className="col-12 col-sm-6 col-lg-3">
            <div className="help-icons d-flex shadow ">
                <div className="icon">
                    <FontAwesomeIcon icon={faPhone} /> 
                </div>
                <div className="body">
                    <b> Call Us </b> <br /><small>+91 9867543210 <br />Mon - Sat, 9:00 AM - 6:00 PM</small>
                </div>
            </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
            <div className="help-icons d-flex shadow">
                <div className="icon">
                    <FontAwesomeIcon icon={faLocationDot} /> 
                </div>
                <div className="body">
                    <b> Visit Us </b> <br /><small>123 Education Hub, Knowledge City,Pune - 411057, India</small>
                </div>
            </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
            <div className="help-icons d-flex shadow ">
                <div className="icon">
                    <FontAwesomeIcon icon={faClock} /> 
                </div>
                <div className="body">
                    <b> Working Hours </b> <br /><small>Mon - Sat, 9:00 AM - 6:00 PM <br />Sunday : Closed</small>
                </div>
            </div>
        </div>


    </div>
 
</div>
<br />
{/* Faq img  */}
<div className="Faq-section p-2 container-fluid">
    <div className="row">
        <div className="col-md-6 faq-img text-center">
            <img src={help} alt="" width="60%" height="100%"/>
        </div>

        <div className="col-md-6 p-4">
            <div className="Faq-heading">
                <h4>Frequently Asked <span>Questions</span></h4>
            </div>
                <div className="lineh"></div>
            <br />
                <Accordion flush>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                    How do I enroll in a course?
                    </Accordion.Header>
                    <Accordion.Body>
                    Select a course and complete the enrollment process.
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                    <Accordion.Header>
                    Do I get lifetime access?
                    </Accordion.Header>
                    <Accordion.Body>
                    Yes, most courses provide lifetime access.
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                    <Accordion.Header>
                    Can I contact a teacher directly?
                    </Accordion.Header>
                    <Accordion.Body>
                    Yes, enrolled students can communicate with teachers.
                    </Accordion.Body>
                </Accordion.Item>
                </Accordion>
        </div>
    </div>
</div>

{/* footer  */}
<FooterUi/>
</>
  )
}

export default ContactUi