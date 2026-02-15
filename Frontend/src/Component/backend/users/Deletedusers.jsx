import { useEffect, useState } from "react";
import { apiUrl, token } from "../../Common/http";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";


const Deletedusers = () => {
  const [users, setUsers] = useState([]);

  // Fetching User in Trashed or deleted (soft delete)
    const fetchDeletedUsers = async () => {
        const res = await fetch(apiUrl +'deleted-users',{
            'method':'GET',
            'headers' : {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
            }
        });
        const result = await res.json();
        setUsers(result.user);// user after result iss variable name defined in backend API
    }


        const handleForceDelete = async (id) =>{
    
            if (confirm("Are you sure you want to delete this User permanently ? You cant restore after deleting permanently!!")){
                const res = await fetch(apiUrl+'user-force-delete/'+id,{
                'method':'DELETE',
                'headers' : {
                    'Content-type' : 'application/json',
                    'Accept' : 'application/json',
                    'Authorization' : `Bearer ${token()}`
                }
            });
            const result = await res.json();
            
            if(result.status==true){
                const newUser = users.filter(user => user.id != id)
                setUsers(newUser);
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
            }
        }

          const handleRestore = async (id) =>{
    
            if (confirm("Are you sure you want to restore this User ?")){
                const res = await fetch(apiUrl+'user-restore/'+id,{
                'method':'POST',
                'headers' : {
                    'Content-type' : 'application/json',
                    'Accept' : 'application/json',
                    'Authorization' : `Bearer ${token()}`
                }
            });

            const result = await res.json();
            
            if(result.status==true){
                const restoreUser = users.filter(user => user.id != id)
                setUsers(restoreUser);
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
            }
    
        }


  useEffect(() => {
    fetchDeletedUsers();
  }, []);

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
                {/* Deleted Users*/}

                <div className="card shadow border-0">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between">
                            <h4 className='h5'>Deleted Users</h4>
                            <Link to="/admin/users/createuser" className='btn btn-success'>Create User</Link>
                        </div>
                        <hr />

                        <table className='table table-striped'>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Username</th>
                                    {/* <th>User Role</th> */}
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    users && users.map(user => {
                                       return (
                                            
                                                <tr key={`user-${user.id}`}>
                                                    <td>{user.id}</td>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.roles && user.roles.length>0 ? user.roles[0].name : "N/A"}</td>
                                                    <td>
                                                        <button className="btn btn-warning" onClick={() => handleRestore(user.id)}>Restore</button>
                                                       <button className="btn btn-danger" onClick={() => handleForceDelete(user.id)}>Delete Permanently</button>
                                                    </td>
                                    
                                                </tr>
                                        )
                                    }
                                    )
                                }
                                
                            </tbody>

                        </table>


                    </div>

                </div>


            </div>
        </div>
        </div>
        
    </main>
    </>
  );
};

export default Deletedusers;