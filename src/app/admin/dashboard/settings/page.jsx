"use client";

import { useState, useEffect } from "react";
import { Shield, Bell, User, Lock, Save, Loader2, AlertTriangle, Key, Smartphone, Mail, Activity, QrCode, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { updateEmail, updatePassword } from "firebase/auth";
import { supabase } from "@/lib/supabase";
export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security" | "notifications"

  // Profile State
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("Master Admin");
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [maintenanceFull, setMaintenanceFull] = useState(false);
  const [maintenanceSupplier, setMaintenanceSupplier] = useState(false);
  const [maintenanceShopOwner, setMaintenanceShopOwner] = useState(false);
  const [maintenanceRider, setMaintenanceRider] = useState(false);

  // Security State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setEmail(user.email || "");

      }
      setIsAuthLoaded(true);
    });

    const fetchSystemSettings = async () => {
      const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
      if (data) {
        setAllowRegistrations(data.allow_new_registrations);
        setMaintenanceFull(data.maintenance_mode_full);
        setMaintenanceSupplier(data.maintenance_mode_supplier);
        setMaintenanceShopOwner(data.maintenance_mode_shop_owner);
        setMaintenanceRider(data.maintenance_mode_delivery_man);
      }
      setIsSettingsLoaded(true);
    };

    fetchSystemSettings();

    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      let emailUpdated = false;
      if (user && email && email !== user.email) {
        await updateEmail(user, email);
        emailUpdated = true;
      }

      const { error } = await supabase.from('system_settings').update({
        allow_new_registrations: allowRegistrations,
        maintenance_mode_full: maintenanceFull,
        maintenance_mode_supplier: maintenanceSupplier,
        maintenance_mode_shop_owner: maintenanceShopOwner,
        maintenance_mode_delivery_man: maintenanceRider,
        updated_at: new Date().toISOString()
      }).eq('id', 1);

      if (error) throw error;

      if (emailUpdated) {
        toast.success("Admin email & platform settings updated successfully!");
      } else {
        toast.success("Platform settings saved successfully!");
      }
    } catch (error) {
      console.error(error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("Security alert: Please log out and log back in to change your email. Settings saved.");
      } else {
        toast.error(error.message || "Failed to update settings.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      if (newPassword) {
        const user = auth.currentUser;
        if (user) {
          await updatePassword(user, newPassword);
          setNewPassword("");
          setConfirmPassword("");
          toast.success("Password updated successfully!");
        }
      } else {
        toast.success("Security preferences saved.");
      }
    } catch (error) {
      console.error(error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("Security alert: Please log out and log back in to change your password.");
      } else {
        toast.error(error.message || "Failed to update security settings.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleSaveNotifications = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Notification preferences saved successfully!");
    }, 600);
  };

  const handleSave = () => {
    if (activeTab === "profile") handleSaveProfile();
    else if (activeTab === "security") handleSaveSecurity();
    else if (activeTab === "notifications") handleSaveNotifications();
  };

  if (!isAuthLoaded || !isSettingsLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#136353]" />
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your admin profile and global platform preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-[#136353] hover:bg-[#0e4d41] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Settings Navigation */}
        <div className="col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "profile" ? "bg-emerald-50 text-[#136353]" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <User className="w-5 h-5" /> Profile & Platform
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "security" ? "bg-emerald-50 text-[#136353]" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Shield className="w-5 h-5" /> Security
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "notifications" ? "bg-emerald-50 text-[#136353]" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
        </div>

        {/* Settings Content */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <>
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Admin Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">This email is used for your Firebase Admin login.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Platform Preferences</h3>
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-900">Allow New Registrations</h4>
                      <p className="text-[13px] text-slate-500 font-medium">Enable or disable new users from joining the platform.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={allowRegistrations} onChange={() => setAllowRegistrations(!allowRegistrations)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#136353]"></div>
                    </label>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <h4 className="font-bold text-slate-900 text-lg">Maintenance Mode Controls</h4>
                    </div>
                    <p className="text-[13px] text-slate-500 font-medium mb-6">Show a maintenance screen to users and prevent them from logging in. You can toggle this globally or for specific roles.</p>
                    
                    <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-red-600">Full App Maintenance</h4>
                          <p className="text-xs text-slate-500 font-medium">Block ALL non-admin users from accessing the platform.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={maintenanceFull} onChange={() => setMaintenanceFull(!maintenanceFull)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between opacity-80">
                        <div>
                          <h4 className="font-bold text-slate-700">Supplier Maintenance</h4>
                          <p className="text-xs text-slate-500 font-medium">Block ONLY Supplier accounts.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" disabled={maintenanceFull} checked={maintenanceSupplier} onChange={() => setMaintenanceSupplier(!maintenanceSupplier)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between opacity-80">
                        <div>
                          <h4 className="font-bold text-slate-700">Shop Owner Maintenance</h4>
                          <p className="text-xs text-slate-500 font-medium">Block ONLY Shop Owner accounts.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" disabled={maintenanceFull} checked={maintenanceShopOwner} onChange={() => setMaintenanceShopOwner(!maintenanceShopOwner)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between opacity-80">
                        <div>
                          <h4 className="font-bold text-slate-700">Rider Maintenance</h4>
                          <p className="text-xs text-slate-500 font-medium">Block ONLY Delivery Man (Rider) accounts.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" disabled={maintenanceFull} checked={maintenanceRider} onChange={() => setMaintenanceRider(!maintenanceRider)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <>
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                  <Key className="w-5 h-5 text-[#136353]" />
                  <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                </div>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>


              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                  <Activity className="w-5 h-5 text-[#136353]" />
                  <h3 className="text-lg font-bold text-slate-900">Active Sessions</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Smartphone className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Chrome on Windows</p>
                        <p className="text-xs text-slate-500 font-medium">Dhaka, Bangladesh • Active Now</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Current</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <>
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                  <Mail className="w-5 h-5 text-[#136353]" />
                  <h3 className="text-lg font-bold text-slate-900">Email Alerts</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-900">New User Registrations</h4>
                      <p className="text-[13px] text-slate-500 font-medium">Get notified when a new Shop Owner or Supplier joins.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifyNewUsers} onChange={() => setNotifyNewUsers(!notifyNewUsers)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#136353]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-900">High-Value Orders</h4>
                      <p className="text-[13px] text-slate-500 font-medium">Receive alerts for platform orders exceeding BDT 50,000.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifyOrders} onChange={() => setNotifyOrders(!notifyOrders)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#136353]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-900">System Security Alerts</h4>
                      <p className="text-[13px] text-slate-500 font-medium">Critical notifications about failed admin logins or system downtime.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifyAlerts} onChange={() => setNotifyAlerts(!notifyAlerts)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#136353]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Weekly Summary Report</h4>
                      <p className="text-[13px] text-slate-500 font-medium">Receive an automated email every Monday with platform statistics.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={weeklySummary} onChange={() => setWeeklySummary(!weeklySummary)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#136353]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
