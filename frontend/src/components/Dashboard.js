import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role:"", department_id: "" });
  const [newDept, setNewDept] = useState({ department_name: "" });

  const [filterReviewer, setFilterReviewer] = useState("");
  const [filterReviewee, setFilterReviewee] = useState("");
  const [assignmentsPerUser, setAssignmentsPerUser] = useState(4);

  const [activeTab, setActiveTab] = useState("Welcome");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // 🔹 Load initial data
  useEffect(() => {
    fetchReviews();
    fetchUsers();
    fetchDepartments();
    fetchAssignments();
  }, []);

  // ================= API CALLS =================

  const fetchReviews = async () => {
    const res = await axios.get("http://127.0.0.1:8000/reviews/");
    setReviews(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get("http://127.0.0.1:8000/users/");
    setUsers(res.data);
  };

  const fetchDepartments = async () => {
    const res = await axios.get("http://127.0.0.1:8000/departments/");
    setDepartments(res.data);
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/assignments/");
      setAssignments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const assignReviews = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/assign-reviews/?num=${assignmentsPerUser}`);
      alert("Assignments generated successfully!");
      fetchAssignments(); // refresh
    } catch (error) {
      console.error(error);
  }
};

  // ================= CREATE =================

  const createUser = async () => {
    await axios.post("http://127.0.0.1:8000/users/", null, { params: newUser });
    fetchUsers();
    setNewUser({ name: "", email: "", role: "", department_id: "" });
  };

  const createDepartment = async () => {
    await axios.post("http://127.0.0.1:8000/departments/", null, { params: { name: newDept.department_name } });
    fetchDepartments();
  };

  // ================= DELETE =================

  const deleteUser = async (id) => {
    await axios.delete(`http://127.0.0.1:8000/users/${id}`);
    fetchUsers();
  };

  const deleteDepartment = async (id) => {
    await axios.delete(`http://127.0.0.1:8000/departments/${id}`);
    fetchDepartments();
  };

  // ================= FILTER =================

  const filterByMonth = async (month) => {
    if (!month) return fetchReviews();

    const res = await axios.get(
      `http://127.0.0.1:8000/reviews/filter/?month=${month}`
    );
    setReviews(res.data);
  };




  // ================= HELPERS =================
  const getUserName = (id) => {
    const user = users.find(u => u.user_id === id);
    return user ? user.name : `User ${id}`;
  };

  const filteredReviews = reviews.filter(r => {
    let match = true;
    if (filterReviewer && String(r.reviewer_id) !== String(filterReviewer)) match = false;
    if (filterReviewee && String(r.reviewee_id) !== String(filterReviewee)) match = false;
    return match;
  });

  const filteredAssignments = assignments.filter(a => {
    let match = true;
    if (filterReviewer && String(a.reviewer_id) !== String(filterReviewer)) match = false;
    if (filterReviewee && String(a.reviewee_id) !== String(filterReviewee)) match = false;
    return match;
  });

  // ================= UI =================

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔥 SIDEBAR */}
      <div className="w-64 bg-[#127993] text-white p-6">
        {/* <h2 className="text-2xl font-bold mb-6 cursor-pointer" onClick={() => setActiveTab('Welcome')}>MTI</h2> */}
        <img className="w-[90%] mb-6" src="/logo_1.png" alt="" />

        <ul className="space-y-4">
          <li className={`cursor-pointer p-2 rounded ${activeTab === 'Dashboard' ? 'bg-[#0f6075]' : 'hover:bg-[#0f6075]'}`} onClick={() => setActiveTab('Dashboard')}>Dashboard</li>
          <li className={`cursor-pointer p-2 rounded ${(activeTab === 'Organization' || activeTab === 'Users' || activeTab === 'Departments') ? 'bg-[#0f6075]' : 'hover:bg-[#0f6075]'}`} onClick={() => setActiveTab('Organization')}>Users & Departments</li>
          <li className={`cursor-pointer p-2 rounded ${activeTab === 'Assign Reviews' ? 'bg-[#0f6075]' : 'hover:bg-[#0f6075]'}`} onClick={() => setActiveTab('Assign Reviews')}>Assign Reviews</li>
        </ul>
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 p-8">

        {/* 🔹 HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          {/* <div className="w-10 h-10 bg-black rounded-full"></div> Logo Placeholder */}
        </div>

        {activeTab === 'Welcome' && (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow p-8 text-center mt-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{getGreeting()}, Admin!</h2>
            <p className="text-2xl text-gray-600 font-medium">{currentTime.toLocaleTimeString()}</p>
            <p className="mt-6 text-gray-500">Select an option from the left navigation menu to get started.</p>
          </div>
        )}

        {activeTab === 'Dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="text-xl font-bold mb-2">Total Users</h3>
              <p className="text-4xl font-semibold text-[#127993]">{users.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="text-xl font-bold mb-2">Departments</h3>
              <p className="text-4xl font-semibold text-[#127993]">{departments.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="text-xl font-bold mb-2">Total Reviews</h3>
              <p className="text-4xl font-semibold text-[#127993]">{reviews.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="text-xl font-bold mb-2">Assignments</h3>
              <p className="text-4xl font-semibold text-[#127993]">{assignments.length}</p>
            </div>
          </div>
        )}

        {(activeTab === 'Organization' || activeTab === 'Users' || activeTab === 'Departments') && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            
            {/* 🔹 USERS MANAGEMENT */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-[#127993] text-lg font-bold">Manage Users</h2>
                <span className="bg-gray-100 text-gray-600 text-sm py-1 px-3 rounded-full font-semibold">{users.length} Users</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <input placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="border p-2 rounded flex-auto min-w-[100px] outline-none focus:ring-1 focus:ring-[#127993]" />
                <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="border p-2 rounded flex-auto min-w-[120px] outline-none focus:ring-1 focus:ring-[#127993]" />
                <input placeholder="Role" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="border p-2 rounded flex-auto min-w-[80px] outline-none focus:ring-1 focus:ring-[#127993]" />
                <input placeholder="Dept ID" value={newUser.department_id} onChange={(e) => setNewUser({...newUser, department_id: e.target.value})} className="border p-2 rounded flex-auto min-w-[80px] outline-none focus:ring-1 focus:ring-[#127993]" type="number" />
                <button onClick={createUser} className="bg-[#127993] text-white px-4 py-2 rounded hover:bg-[#0f6075] transition font-semibold whitespace-nowrap">Add User</button>
              </div>

              <div className="overflow-x-auto flex-1 max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <th className="p-3 font-semibold">ID</th>
                      <th className="p-3 font-semibold">Name</th>
                      <th className="p-3 font-semibold">Role</th>
                      <th className="p-3 font-semibold">Dept ID</th>
                      <th className="p-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? users.map(u => (
                      <tr key={u.user_id} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0 group">
                        <td className="p-3">
                          <p className="text-xs text-gray-500 whitespace-nowrap">{u.user_id}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-gray-800 whitespace-nowrap">{u.name}</p>
                          <p className="text-xs text-gray-500 whitespace-nowrap">{u.email}</p>
                        </td>
                        <td className="p-3"><span className="bg-blue-50 text-blue-700 py-1 px-2 rounded font-bold text-xs whitespace-nowrap">{u.role}</span></td>
                        <td className="p-3 font-mono text-gray-500">#{u.department_id}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => deleteUser(u.user_id)} className="text-red-500 hover:text-red-700 font-semibold text-sm opacity-100 lg:opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Delete</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="p-6 text-center text-gray-500 italic">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🔹 DEPARTMENTS MANAGEMENT */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-[#127993] text-lg font-bold">Manage Departments</h2>
                <span className="bg-gray-100 text-gray-600 text-sm py-1 px-3 rounded-full font-semibold">{departments.length} Departments</span>
              </div>
              
              <div className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <input placeholder="Department Name" value={newDept.department_name} onChange={(e) => setNewDept({...newDept, department_name: e.target.value})} className="border p-2 rounded flex-1 outline-none focus:ring-1 focus:ring-[#127993]" />
                <button onClick={createDepartment} className="bg-[#127993] text-white px-5 py-2 rounded hover:bg-[#0f6075] transition font-semibold whitespace-nowrap">Add Dept</button>
              </div>

              <div className="overflow-x-auto flex-1 max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <th className="p-3 font-semibold">ID</th>
                      <th className="p-3 font-semibold">Department Name</th>
                      <th className="p-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.length > 0 ? departments.map(d => (
                      <tr key={d.department_id} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0 group">
                        <td className="p-3 font-bold text-gray-500">#{d.department_id}</td>
                        <td className="p-3 font-semibold text-gray-800">{d.department_name}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => deleteDepartment(d.department_id)} className="text-red-500 hover:text-red-700 font-semibold text-sm opacity-100 lg:opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Delete</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" className="p-6 text-center text-gray-500 italic">No departments found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'Assign Reviews' && (
        <div className="flex flex-col gap-6">
          {/* 🔹 FILTERS */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-[#127993] text-lg font-bold mb-4 border-b pb-2">Filter Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date Filter */}
              <div className="flex flex-col relative w-full">
                <label className="text-sm font-semibold text-gray-600 mb-1">Select Month</label>
                <select
                  onChange={(e) => filterByMonth(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#127993] focus:border-[#127993] outline-none transition bg-white"
                >
                  <option value="">All Months</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>

              {/* Reviewer Filter */}
              <div className="flex flex-col relative w-full">
                <label className="text-sm font-semibold text-gray-600 mb-1">Filter by Reviewer</label>
                <select
                  onChange={(e) => setFilterReviewer(e.target.value)}
                  value={filterReviewer}
                  className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#127993] focus:border-[#127993] outline-none transition bg-white"
                >
                  <option value="">All Reviewers</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Reviewee Filter */}
              <div className="flex flex-col relative w-full">
                <label className="text-sm font-semibold text-gray-600 mb-1">Filter by Reviewee</label>
                <select
                  onChange={(e) => setFilterReviewee(e.target.value)}
                  value={filterReviewee}
                  className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#127993] focus:border-[#127993] outline-none transition bg-white"
                >
                  <option value="">All Reviewees</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 🔥 REVIEWS TABLE */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-[#127993] text-lg font-bold">Reviews List</h2>
                <span className="bg-gray-100 text-gray-600 text-sm py-1 px-3 rounded-full font-semibold">{filteredReviews.length} Results</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <th className="p-3 font-semibold">Reviewer</th>
                      <th className="p-3 font-semibold">Reviewee</th>
                      <th className="p-3 font-semibold text-center">Rating</th>
                      <th className="p-3 font-semibold">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.length > 0 ? (
                      filteredReviews.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
                          <td className="p-3 whitespace-nowrap">{getUserName(r.reviewer_id)}</td>
                          <td className="p-3 whitespace-nowrap">{getUserName(r.reviewee_id)}</td>
                          <td className="p-3 text-center"><span className="bg-blue-50 text-blue-700 py-1 px-2 rounded font-bold text-xs">{r.rating} / 5</span></td>
                          <td className="p-3 truncate max-w-xs" title={r.review_text}>{r.review_text}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-gray-500 italic">No reviews match the current filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🔥 ASSIGNMENTS LIST */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 border-b pb-2 flex-wrap gap-2">
                <h2 className="text-[#127993] text-lg font-bold">Current Assignments</h2>
                
                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 py-1 px-3 rounded-lg shadow-sm">
                    <label className="text-gray-600 font-semibold m-0 whitespace-nowrap">Per Person:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="20"
                      value={assignmentsPerUser} 
                      onChange={(e) => setAssignmentsPerUser(e.target.value)}
                      className="w-12 text-center bg-white border border-gray-300 rounded outline-none py-1 focus:ring-1 focus:ring-[#127993]"
                    />
                  </div>
                  
                  <button
                    onClick={assignReviews}
                    className="bg-[#127993] text-white px-4 py-2 rounded-lg hover:bg-[#0f6075] transition shadow-sm font-semibold flex items-center gap-2 text-sm whitespace-nowrap"
                  >
                    <span>Generate New</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3" style={{maxHeight: '400px'}}>
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((a, index) => (
                    <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 border border-gray-100 rounded-lg transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-sm">
                          {getUserName(a.reviewer_id).charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Reviewer</p>
                          <p className="font-semibold text-gray-800">{getUserName(a.reviewer_id)}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Reviewee</p>
                          <p className="font-semibold text-gray-800">{getUserName(a.reviewee_id)}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shadow-sm">
                          {getUserName(a.reviewee_id).charAt(0)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 italic">No assignments match the current filters.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;