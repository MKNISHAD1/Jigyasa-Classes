    import React from 'react'
    import Header from '../Common/Header'
    import Sidebar from '../Common/Sidebar'
    import HeaderUi from '../Common/CommonUI/HeaderUi'
    import FooterUi from '../Common/CommonUI/FooterUi'

    const Dashboard = () => {
    return (
            <>
                {/* Dashboard */}
                <div className="card border-0" style={{background:'#ebf1f5',height:'10%'}}>
                    <div className="card-body d-flex justify-content-center align-items-center">
                        <h4>Welcome to Admin Panel</h4>
                    </div>
                </div>
            </>
        )
    }

    export default Dashboard