import React, { useState } from 'react'
import DashboardHeaderUi from './DashboardHeaderUi'
import Sidebar from '../../Common/Sidebar'
import { Outlet } from 'react-router-dom'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import { Offcanvas } from 'react-bootstrap'

const DashboardLayout = () => {

    const [showSidebar, setShowSidebar] = useState(false);

    const openSidebar = () => setShowSidebar(true);
    const closeSidebar = () => setShowSidebar(false);

return (
<>
 
    <div className="dashboard-layout">

        {/* Desktop */}
        <div className="d-none d-lg-block">
            <HeaderUi />
        </div>

        {/* Mobile */}
        <div className="d-lg-none">
            <DashboardHeaderUi
                onMenuClick={openSidebar}
            />
        </div>

        {/* Mobile Offcanvas */}
        <div className="d-lg-none">
                <Offcanvas
                    show={showSidebar}
                    onHide={closeSidebar}
                    placement="start"
                >

                    <Offcanvas.Body className='p-0'>

                        <Sidebar 
                            onNavigate={closeSidebar}
                            onClose={closeSidebar}
                         />

                    </Offcanvas.Body>

                </Offcanvas>
        </div>

            <div className="dashboard-body">

                <aside className="sidebar-content d-none d-lg-block">
                    <Sidebar />  
                </aside>

                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>

        </div>

</>
  )
}

export default DashboardLayout