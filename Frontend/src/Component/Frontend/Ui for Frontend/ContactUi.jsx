import React from 'react'
import Accordion from "react-bootstrap/Accordion";
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faClock, faEnvelope, faLocation, faLocationPin, faMailBulk, faMailForward, faMessage, faPaperPlane, faPhone } from '@fortawesome/free-solid-svg-icons'
import help from '../../../assets/images/help1.jpg';
import PageHero from '../../Common/CommonUI/PageHeroUi'
import InfoItemUi from '../../Common/CommonUI/InfoItemUi'


const ContactUi = () => {
  return (
<>

{/* Header  */}
<HeaderUi/>

 {/* Help Section  */}
<div className="Help-Section container-fluid p-5">
    <div className="row">
        <div className="col-md-6">
            {/* <div className="help-Heading">
                <h4>Contact Us</h4>
                <h2>We're Here to <span>Help You</span></h2>
                <small>Have questions or need guidance? Reach Out to us and we'll get back to you as soon as  possible.</small>
            </div> */}
            <PageHero
                tag="Contact Us"
                title="We're Here to"
                highlight="Help You"
                description="
                Have questions or need guidance?
                Reach out to us and <br> we'll get back to
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
                icon={faLocationPin}
                title="Visit Our Office"
                subtitle="we'd love to meet you in person."
                className="p-3"
            />
            </div>


        </div>

        <div className="col-md-6 shadow p-4 message-section">
                <h4>Send Us a <span>Message</span></h4>
                <div className="line1"></div><br />
            <div className="row ">
                <div className="col-md-6">
                    <label className='form-lable'>Enter Name</label>
                    <input type="text" name="" placeholder='Enter Your Name' />
                </div>
                <div className="col-md-6">
                    <label className='form-lable'>Enter Phone No.</label>
                    <input type="number" name="" placeholder='Enter Your Phone Number' />
                </div>

                <div className="col-md-6">
                    <label className='form-lable'>Select Category </label><br />
                        <select className="form-control fruits" id="contact-cat">
                        <option value="apple">Enquiry</option>
                        <option value="banana">Report Problem</option>
                        <option value="cherry">Send Updates</option>
                        </select>
    
                </div>

                <div className="col-md-6">
                    <label className='form-lable'>Enter Subject</label>
                    <input type="text" name="" placeholder='Enter Your Subject' />
                </div>

                <label className='form-lable'>Enter Description</label>
                <textarea name="" id="" placeholder='Enter Description'></textarea>

                <button>Send message <FontAwesomeIcon icon={faPaperPlane}/></button>

            </div>     
        </div>
    </div>
</div>
<br />

{/* help card  */}
<div className="help-card container">
    <div className="row g-3">
        <div className="col-md-3">
            <div className="help-icons d-flex shadow ">
                <div className="icon">
                    <FontAwesomeIcon icon={faEnvelope} /> 
                </div>
                <div className="body">
                    <b> Email Us </b> <br /><small>support@jigyasaclasses.com <br /> we reply within 24 hours</small>
                </div>
            </div>
        </div>
        
        <div className="col-md-3 ">
            <div className="help-icons d-flex shadow ">
                <div className="icon">
                    <FontAwesomeIcon icon={faPhone} /> 
                </div>
                <div className="body">
                    <b> Call Us </b> <br /><small>+91 9867543210 <br />Mon - Sat, 9:00 AM - 6:00 PM</small>
                </div>
            </div>
        </div>

        <div className="col-md-3">
            <div className="help-icons d-flex shadow">
                <div className="icon">
                    <FontAwesomeIcon icon={faLocationPin} /> 
                </div>
                <div className="body">
                    <b> Visit Us </b> <br /><small>123 Education Hub, Knowledge City,Pune - 411057, India</small>
                </div>
            </div>
        </div>

        <div className="col-md-3">
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
<div className="Faq-section p-2">
    <div className="row">
        <div className="col-md-6 faq-img">
            <img src={help} alt="" width="400px" height="100%" className='shadow'/>
        </div>

        <div className="col-md-6">
            <div className="Faq-heading">
                <h4>Frequently Asked <span>Questions</span></h4>
            </div>
                <div className="lineh"></div>
            <div className="Faq-body">
                <div className="accordion accordion-flush" id="accordionFlushExample">
  <div className="accordion-item">
    <h2 className="accordion-header">
      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
        Accordion Item #1
      </button>
    </h2>
    <div id="flush-collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
      <div className="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the first item’s accordion body.</div>
    </div>
  </div>
  <div className="accordion-item">
    <h2 className="accordion-header">
      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
        Accordion Item #2
      </button>
    </h2>
    <div id="flush-collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
      <div className="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the second item’s accordion body. Let’s imagine this being filled with some actual content.</div>
    </div>
  </div>
  <div className="accordion-item">
    <h2 className="accordion-header">
      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">
        Accordion Item #3
      </button>
    </h2>
    <div id="flush-collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
      <div className="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the third item’s accordion body. Nothing more exciting happening here in terms of content, but just filling up the space to make it look, at least at first glance, a bit more representative of how this would look in a real-world application.</div>
    </div>
  </div>
</div>
            </div>
        </div>
    </div>
</div>

{/* footer  */}
<FooterUi/>
</>
  )
}

export default ContactUi