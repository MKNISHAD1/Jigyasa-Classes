import { faFacebookF, faTelegramPlane, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { toast } from 'react-toastify';

const Share_Course_Card_Ui = ( {shareUrl}  ) => {
  return (
            <div className="Share_Course_Card text-center card border-1 shadow mt-4">

                <h5 className=''> <span>Share</span> This Course</h5>

                <p>Share with Friends and Classmates</p>

                <div className="Social_Icons m-auto">

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    className='Social_Icon_Link'
                    >
                    <FontAwesomeIcon icon={faFacebookF} />
                  </a>

                  
                  <a
                    href={`https://wa.me/?text=${shareUrl}`}
                    target="_blank"
                    className='Social_Icon_Link'
                  >
                    <FontAwesomeIcon icon={faWhatsapp} />
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${shareUrl}`}
                    target="_blank"
                    className='Social_Icon_Link'
                    >
                    <FontAwesomeIcon icon={faTelegramPlane} />
                  </a>

                  <a
                    href="#"
                    className='Social_Icon_Link'
                    onClick={(e)=>{
                      e.preventDefault();
                      navigator.clipboard.writeText(
                        shareUrl
                      );
                      toast.success(
                        "Link copied!"
                      );
                    }}
                    >
                    <FontAwesomeIcon icon={faLink} />
                  </a>

                </div>

            </div>
    )
}

export default Share_Course_Card_Ui