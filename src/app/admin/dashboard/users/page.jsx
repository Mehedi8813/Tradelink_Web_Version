"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, X, Ban, CheckCircle } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.phone_number?.includes(search) ||
    u.business_name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSuspendToggle() {
    if (!selectedUser) return;
    
    const newSuspensionStatus = !selectedUser.is_suspended;
    setIsUpdatingStatus(true);
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_suspended: newSuspensionStatus })
        .eq("id", selectedUser.id);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, is_suspended: newSuspensionStatus } : u
      ));
      setSelectedUser({ ...selectedUser, is_suspended: newSuspensionStatus });
      
      toast.success(`User ${newSuspensionStatus ? 'suspended' : 'activated'} successfully.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <div className="p-8">
      <Toaster position="top-center" richColors />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage all registered users on the TradeLink platform.</p>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-[#136353] focus:outline-none focus:ring-1 focus:ring-[#136353]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Role & Category</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{user.full_name || "N/A"}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{user.business_name || "No Business Name"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          user.role === 'shop_owner' ? 'bg-blue-100 text-blue-700' : 
                          user.role === 'supplier' ? 'bg-purple-100 text-purple-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role?.replace('_', ' ') || "Unknown"}
                        </span>
                        {user.category && (
                          <span className="text-xs text-slate-500">{user.category}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{user.phone_number || "No Phone"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_suspended ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: 'numeric', month: 'short', day: 'numeric'
                      }) : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">User Profile Details</h2>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                
                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</h3>
                  <p className="text-slate-900 font-medium">{selectedUser.full_name || "N/A"}</p>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Business Name</h3>
                  <p className="text-slate-900">{selectedUser.business_name || "N/A"}</p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Role</h3>
                  <p className="text-slate-900 capitalize">{selectedUser.role?.replace('_', ' ') || "N/A"}</p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</h3>
                  <p className="text-slate-900">{selectedUser.category || "N/A"}</p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</h3>
                  <p className="text-slate-900">{selectedUser.phone_number || "N/A"}</p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</h3>
                  <p className="text-slate-900">{selectedUser.email || "N/A"}</p>
                </div>

                <div className="col-span-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Physical Address</h3>
                  <p className="text-slate-900">{selectedUser.address || "No address provided."}</p>
                  {selectedUser.latitude && selectedUser.longitude && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-3 font-mono">
                        Coordinates: {selectedUser.latitude}, {selectedUser.longitude}
                      </p>
                      <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0 }} 
                          loading="lazy" 
                          allowFullScreen 
                          referrerPolicy="no-referrer-when-downgrade" 
                          src={`https://maps.google.com/maps?q=${selectedUser.latitude},${selectedUser.longitude}&z=15&output=embed`}
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Trade License</h3>
                  <p className="text-slate-900 font-mono text-sm">{selectedUser.trade_license || "N/A"}</p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tax ID (TIN)</h3>
                  <p className="text-slate-900 font-mono text-sm">{selectedUser.tax_id || "N/A"}</p>
                </div>
                
                <div className="col-span-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h3>
                  <p className="text-slate-900 text-sm">{selectedUser.description || "No description provided."}</p>
                </div>

              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 font-medium">Status:</span>
                {selectedUser.is_suspended ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                    <Ban className="w-3.5 h-3.5" /> Suspended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>
              
              <button
                onClick={handleSuspendToggle}
                disabled={isUpdatingStatus}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                  selectedUser.is_suspended
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                {!isUpdatingStatus && (selectedUser.is_suspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />)}
                {selectedUser.is_suspended ? "Unsuspend User" : "Suspend User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
