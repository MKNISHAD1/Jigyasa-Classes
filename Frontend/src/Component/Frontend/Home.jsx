import React, { useState } from 'react'
import Header from '../Common/Header'

import Test from '../Common/test'
import Footercomp from '../Common/footer'
import Crousel from '../Common/Crousel'
import Heading from '../Common/Heading'
import logo from '../../assets/images/Logo.png'

const Home = () => {

  return (
    <>
      <Header />

      {/* <Test/> */}
      <Crousel />

      <Heading preHeading='Why choose us?' heading='Discover varity of Oppertunites' text='Get chance to discover various oppertunities with us ,Learn,Grow and get succeed' />

      <div className="section-3 container-fluid pt-4 pb-4 ">
        <div className="row">
          <div className="col-md-4 col-sm-4 pt-2">
            <div className="card shadow border-0 ">
              <img src={logo} alt="logo1" />
              <div className="card-title text-center">
                <h2>Reason 1</h2>
              </div>
              <div className="card-body">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Necessitatibus quis delectus, labore sunt distinctio dolor optio vel asperiores, rem nulla reiciendis blanditiis impedit nesciunt eveniet.
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-4 pt-2">
            <div className="card shadow border-0 ">
              <img src={logo} alt="logo1" />
              <div className="card-title text-center">
                <h2>Reason 1</h2>
              </div>
              <div className="card-body">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Necessitatibus quis delectus, labore sunt distinctio dolor optio vel asperiores, rem nulla reiciendis blanditiis impedit nesciunt eveniet.
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-4 pt-2">
            <div className="card shadow border-0 ">
              <img src={logo} alt="logo1" />
              <div className="card-title text-center">
                <h2>Reason 1</h2>
              </div>
              <div className="card-body">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Necessitatibus quis delectus, labore sunt distinctio dolor optio vel asperiores, rem nulla reiciendis blanditiis impedit nesciunt eveniet.
              </div>
            </div>
          </div>
        </div>
      </div>

            <Heading preHeading='Why choose us?' heading='Discover varity of Oppertunites' text='Get chance to discover various oppertunities with us ,Learn,Grow and get succeed' />

      <div className="section-3 container pt-4 pb-4">
        <div className="row">
          <div className="col-md-4 pt-2">
            <div className="card shadow border-0 ">
              <img src={logo} alt="logo1" />
              <div className="card-title text-center">
                <h2>Reason 1</h2>
              </div>
              <div className="card-body">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Necessitatibus quis delectus, labore sunt distinctio dolor optio vel asperiores, rem nulla reiciendis blanditiis impedit nesciunt eveniet.
              </div>
            </div>
          </div>
          <div className="col-md-4 pt-2">
            <div className="card shadow border-0 ">
              <img src={logo} alt="logo1" />
              <div className="card-title text-center">
                <h2>Reason 1</h2>
              </div>
              <div className="card-body">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Necessitatibus quis delectus, labore sunt distinctio dolor optio vel asperiores, rem nulla reiciendis blanditiis impedit nesciunt eveniet.
              </div>
            </div>
          </div>
          <div className="col-md-4 pt-2">
            <div className="card shadow border-0 ">
              <img src={logo} alt="logo1" />
              <div className="card-title text-center">
                <h2>Reason 1</h2>
              </div>
              <div className="card-body">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Necessitatibus quis delectus, labore sunt distinctio dolor optio vel asperiores, rem nulla reiciendis blanditiis impedit nesciunt eveniet.
              </div>
            </div>
          </div>
        </div>
      </div>


      <Footercomp />
    </>
  )
}

export default Home