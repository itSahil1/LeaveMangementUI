import { useState, useEffect, useMemo } from 'react';
import { Plus, Users, Calendar, Check, X, Eye, Briefcase, Mail, Home, ArrowRight } from 'lucide-react';

const API_URL = "https://leave-management-api-hecm.onrender.com/";


const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all scale-95 opacity-0 animate-fade-in-scale">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        green: 'bg-green-100 text-green-600',
    };
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

const Input = ({ id, label, type = 'text', value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
        />
    </div>
);


export default function App() {
    const [employees, setEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [activeView, setActiveView] = useState('dashboard');
    const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', department: '', joiningDate: '' });
    const [newLeave, setNewLeave] = useState({ employeeId: '', startDate: '', endDate: '', reason: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const [employeesRes, leavesRes] = await Promise.all([
                    fetch(`${API_URL}/employees`),
                    fetch(`${API_URL}/leaves`) 
                ]);

                const employeesData = await employeesRes.json();
                const leavesData = await leavesRes.json();
                
                
                setEmployees(employeesData.map(e => ({...e, joiningDate: new Date(e.joiningDate)})));
                setLeaves(leavesData.map(l => ({...l, startDate: new Date(l.startDate), endDate: new Date(l.endDate) })));

            } catch (err) {
                setError('Failed to connect to the API server. Make sure it is running.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    
    
    const refreshData = async () => {
        
        setLoading(true);
        try {
            const [employeesRes, leavesRes] = await Promise.all([
                fetch(`${API_URL}/employees`),
                fetch(`${API_URL}/leaves`)
            ]);
            const employeesData = await employeesRes.json();
            const leavesData = await leavesRes.json();
            setEmployees(employeesData.map(e => ({...e, joiningDate: new Date(e.joiningDate)})));
            setLeaves(leavesData.map(l => ({...l, startDate: new Date(l.startDate), endDate: new Date(l.endDate) })));
        } catch (err) {
            setError('Failed to refresh data from the API.');
        } finally {
            setLoading(false);
        }
    };


    
    
    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_URL}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmployee),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to add employee');
            }
            
            setNewEmployee({ name: '', email: '', department: '', joiningDate: '' });
            setEmployeeModalOpen(false);
            await refreshData(); 
        } catch (err) {
            setError(err.message);
        }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_URL}/leaves`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newLeave,
                    employeeId: parseInt(newLeave.employeeId) 
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to apply for leave');
            }
            
            setNewLeave({ employeeId: '', startDate: '', endDate: '', reason: '' });
            setLeaveModalOpen(false);
            await refreshData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLeaveAction = async (leaveId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/leaves/${leaveId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update leave status');
            }
            await refreshData();
        } catch (err) {
            alert(err.message); 
        }
    };

    const openDetailsModal = async (employee) => {
       
        try {
            const response = await fetch(`${API_URL}/employees/${employee.id}/balance`);
            const data = await response.json();
            setSelectedEmployee(data);
            setDetailsModalOpen(true);
        } catch (err) {
            alert('Could not fetch latest employee details.');
        }
    };
    
    const getEmployeeNameById = (id) => employees.find(e => e.id === id)?.name || 'Unknown';

  
    const pendingLeavesCount = useMemo(() => leaves.filter(l => l.status === 'PENDING').length, [leaves]);
    const upcomingLeaves = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return leaves
            .filter(l => l.status === 'APPROVED' && new Date(l.startDate) >= today)
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 5);
    }, [leaves]);

    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl text-gray-600">Loading Data from API...</p></div>
    }
    
    if (error && !employees.length) {
         return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 p-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
                <p>{error}</p>
                <p className="mt-2 text-sm">Please ensure the Node.js server is running on localhost:3000.</p>
            </div>
        </div>
    }

    const renderDashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard icon={<Users size={24} />} title="Total Employees" value={employees.length} color="blue" />
            <StatCard icon={<Calendar size={24} />} title="Pending Requests" value={pendingLeavesCount} color="yellow" />
            <StatCard icon={<Check size={24} />} title="Upcoming Leaves" value={upcomingLeaves.length} color="green" />
            
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Leaves</h3>
                {upcomingLeaves.length > 0 ? (
                    <ul className="space-y-3">
                        {upcomingLeaves.map(leave => (
                            <li key={leave.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Calendar size={16} /></div>
                                    <div>
                                        <p className="font-semibold text-gray-700">{getEmployeeNameById(leave.employeeId)}</p>
                                        <p className="text-sm text-gray-500">{leave.reason}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-600">{leave.startDate.toLocaleDateString()} <ArrowRight size={12} className="inline"/> {leave.endDate.toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-center text-gray-500 py-4">No upcoming approved leaves.</p>}
            </div>
        </div>
    );

    const renderEmployees = () => (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Employee List</h3>
                <button onClick={() => setEmployeeModalOpen(true)} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"><Plus size={18} /><span>Add Employee</span></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="p-3 text-sm font-semibold text-gray-600">Name</th><th className="p-3 text-sm font-semibold text-gray-600">Department</th><th className="p-3 text-sm font-semibold text-gray-600">Joining Date</th><th className="p-3 text-sm font-semibold text-gray-600">Leave Balance</th><th className="p-3 text-sm font-semibold text-gray-600">Actions</th></tr></thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3 text-gray-700">{emp.name}</td><td className="p-3 text-gray-500">{emp.department}</td><td className="p-3 text-gray-500">{emp.joiningDate.toLocaleDateString()}</td><td className="p-3 font-medium text-indigo-600">{emp.leaveBalance} days</td>
                                <td className="p-3"><button onClick={() => openDetailsModal(emp)} className="text-gray-400 hover:text-indigo-600"><Eye size={18} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const renderLeaves = () => {
        const StatusBadge = ({ status }) => {
            const styles = { PENDING: 'bg-yellow-100 text-yellow-800', APPROVED: 'bg-green-100 text-green-800', REJECTED: 'bg-red-100 text-red-800' };
            return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
        };
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Leave Requests</h3>
                    <button onClick={() => setLeaveModalOpen(true)} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"><Plus size={18} /><span>Apply for Leave</span></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="p-3 text-sm font-semibold text-gray-600">Employee</th><th className="p-3 text-sm font-semibold text-gray-600">Dates</th><th className="p-3 text-sm font-semibold text-gray-600">Reason</th><th className="p-3 text-sm font-semibold text-gray-600">Status</th><th className="p-3 text-sm font-semibold text-gray-600">Actions</th></tr></thead>
                        <tbody>
                            {leaves.map(leave => (
                                <tr key={leave.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 text-gray-700">{getEmployeeNameById(leave.employeeId)}</td><td className="p-3 text-gray-500">{leave.startDate.toLocaleDateString()} - {leave.endDate.toLocaleDateString()}</td><td className="p-3 text-gray-500 truncate" style={{maxWidth: '150px'}}>{leave.reason}</td><td className="p-3"><StatusBadge status={leave.status} /></td>
                                    <td className="p-3">
                                        {leave.status === 'PENDING' && (
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleLeaveAction(leave.id, 'APPROVED')} className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200"><Check size={16} /></button>
                                                <button onClick={() => handleLeaveAction(leave.id, 'REJECTED')} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><X size={16} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeView) {
            case 'employees': return renderEmployees();
            case 'leaves': return renderLeaves();
            case 'dashboard': default: return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <div className="flex">
                <nav className="w-64 bg-white h-screen p-5 shadow-md flex-shrink-0 hidden md:flex flex-col">
                    <div className="flex items-center space-x-2 mb-10"><div className="p-2 bg-indigo-600 rounded-lg"><Calendar className="text-white" size={24} /></div><h1 className="text-xl font-bold text-gray-800">LeaveSys</h1></div>
                    <ul className="space-y-2">
                        <li><button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-100'}`}><Home size={20}/><span>Dashboard</span></button></li>
                        <li><button onClick={() => setActiveView('employees')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeView === 'employees' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-100'}`}><Users size={20}/><span>Employees</span></button></li>
                        <li><button onClick={() => setActiveView('leaves')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeView === 'leaves' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-100'}`}><Briefcase size={20}/><span>Leave Requests</span></button></li>
                    </ul>
                </nav>
                <main className="flex-1 p-6 md:p-8">
                    <header className="mb-8"><h2 className="text-3xl font-bold text-gray-800 capitalize">{activeView}</h2><p className="text-gray-500 mt-1">Manage your team's leaves and schedules efficiently.</p></header>
                    {renderContent()}
                </main>
            </div>
            {/* Modals are the same as before */}
            <Modal isOpen={isEmployeeModalOpen} onClose={() => { setEmployeeModalOpen(false); setError(''); }} title="Add New Employee">
                <form onSubmit={handleAddEmployee} className="space-y-4">
                    <Input id="name" label="Full Name" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} placeholder="e.g., John Doe" />
                    <Input id="email" label="Email" type="email" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} placeholder="e.g., john.doe@example.com" />
                    <Input id="department" label="Department" value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} placeholder="e.g., Engineering" />
                    <Input id="joiningDate" label="Joining Date" type="date" value={newEmployee.joiningDate} onChange={e => setNewEmployee({...newEmployee, joiningDate: e.target.value})} />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-4"><button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Add Employee</button></div>
                </form>
            </Modal>
            <Modal isOpen={isLeaveModalOpen} onClose={() => { setLeaveModalOpen(false); setError(''); }} title="Apply for Leave">
                <form onSubmit={handleApplyLeave} className="space-y-4">
                    <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                        <select id="employeeId" value={newLeave.employeeId} onChange={e => setNewLeave({...newLeave, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">Select an employee</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input id="startDate" label="Start Date" type="date" value={newLeave.startDate} onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} /><Input id="endDate" label="End Date" type="date" value={newLeave.endDate} onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} /></div>
                    <div><label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label><textarea id="reason" value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Family vacation"></textarea></div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-4"><button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Submit Request</button></div>
                </form>
            </Modal>
            <Modal isOpen={isDetailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Employee Details">
                {selectedEmployee && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4"><div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">{selectedEmployee.name.charAt(0)}</div><div><h4 className="text-xl font-bold text-gray-800">{selectedEmployee.name}</h4><p className="text-gray-500">{selectedEmployee.department}</p></div></div>
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                           <p className="flex items-center"><Mail size={16} className="mr-2 text-gray-400"/> {selectedEmployee.email}</p>
                           <p className="flex items-center"><Calendar size={16} className="mr-2 text-gray-400"/> Joined on {new Date(selectedEmployee.joiningDate).toLocaleDateString()}</p>
                           <p className="flex items-center"><Check size={16} className="mr-2 text-green-500"/> <span className="font-bold">{selectedEmployee.leaveBalance}</span>&nbsp;days of leave remaining</p>
                        </div>
                    </div>
                )}
            </Modal>
            <style>{`@keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }`}</style>
        </div>
    );
}
