import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import ExampleCarouselImage1 from '../../assets/images/cruz1.png';
import ExampleCarouselImage2 from '../../assets/images/cruz2.png';
import ExampleCarouselImage3 from '../../assets/images/cruz3.png';
import '../../assets/css/style.scss'

function Crousel() {
  return (
    <>
    <div className="container py-2">
        <Carousel>
      <Carousel.Item>
        <img src = {ExampleCarouselImage1} text="First slide"  className='cruz w-100'/>
        <Carousel.Caption>
          <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img src = {ExampleCarouselImage2} text="Second slide" className='cruz w-100' />
        <Carousel.Caption>
          <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img src = {ExampleCarouselImage3} text="Third slide" className='cruz w-100' />
        <Carousel.Caption>
          <h3>Third slide label</h3>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
    </div>

    </>

  );
}

export default Crousel;