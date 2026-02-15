import React from 'react'
import Header from '../Common/Header'
import Sidebar from '../Common/Sidebar'

const Dashboard = () => {
  return (
 <>
    <Header/>
    <main>
        <div className="container my-5">
        <div className="row">
            <div className="col-md-3">
                {/* Sidebar Here  */}
                <Sidebar/>
            </div>
            <div className="col-md-9 dashboard">
                {/* Dashboard */}
                <div className="card shadow border-0">
                    <div className="card-body d-flex justify-content-center align-items-center">
                        <h4>Welcome to Admin Panel</h4>
                    </div>

                </div>
            </div>
        </div>
        </div>
        
    </main>
    </>
  )
}

export default Dashboard