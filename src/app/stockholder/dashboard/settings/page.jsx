"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  User,
  Shield,
  Save,
  Loader2,
  Key,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { toast, Toaster } from "sonner";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function SupplierSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [originalProfile, setOriginalProfile] = useState(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [passwordHash, setPasswordHash] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("tradelink_web_user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    setUserId(user.id);
    setPasswordHash(user.password_hash || "");

    setFullName(user.full_name || "");
    setEmail(user.email || "");
    setPhone(user.phone_number || "");
    setBusinessName(user.business_name || "");
    setAddress(user.address || "");
    setDescription(user.description || "");

    setOriginalProfile({
      full_name: user.full_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      business_name: user.business_name || "",
      address: user.address || "",
      description: user.description || "",
    });
  }, [router]);

  const hasProfileChanges = originalProfile && (
    fullName !== originalProfile.full_name ||
    email !== originalProfile.email ||
    phone !== originalProfile.phone_number ||
    businessName !== originalProfile.business_name ||
    address !== originalProfile.address ||
    description !== originalProfile.description
  );

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName.trim(),
          email: email.trim(),
          phone_number: phone.trim(),
          business_name: businessName.trim(),
          address: address.trim(),
          description: description.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      // Update localStorage
      const userStr = localStorage.getItem("tradelink_web_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.full_name = fullName.trim();
        user.email = email.trim();
        user.phone_number = phone.trim();
        user.business_name = businessName.trim();
        user.address = address.trim();
        user.description = description.trim();
        localStorage.setItem("tradelink_web_user", JSON.stringify(user));
      }

      setOriginalProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        business_name: businessName.trim(),
        address: address.trim(),
        description: description.trim(),
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    if (!newPassword) {
      toast.error("New password is required.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Verify current password
      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== passwordHash) {
        throw new Error("Current password is incorrect.");
      }

      // Update to new password
      const newHash = await hashPassword(newPassword);
      const { error } = await supabase
        .from("users")
        .update({
          password_hash: newHash,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      // Update localStorage
      const userStr = localStorage.getItem("tradelink_web_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.password_hash = newHash;
        localStorage.setItem("tradelink_web_user", JSON.stringify(user));
        setPasswordHash(newHash);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="p-8 bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/30 min-h-screen font-sans">
        <Toaster position="top-right" richColors />

        <div
          className="mb-8 flex items-center justify-between opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">Manage your profile and account security.</p>
          </div>
          {activeTab === "profile" && (
            <button
              onClick={handleSaveProfile}
              disabled={loading || !hasProfileChanges}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#136353] to-[#1a7d6a] px-5 py-3 text-sm font-semibold text-white hover:from-[#0f5043] hover:to-[#136353] transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
          {activeTab === "security" && (
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#136353] to-[#1a7d6a] px-5 py-3 text-sm font-semibold text-white hover:from-[#0f5043] hover:to-[#136353] transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              {loading ? "Updating..." : "Update Password"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div
            className="col-span-1 space-y-2 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
            style={{ animationDelay: "100ms" }}
          >
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "profile"
                  ? "bg-emerald-50 text-[#136353] shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <User className="w-5 h-5" /> Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "security"
                  ? "bg-emerald-50 text-[#136353] shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Shield className="w-5 h-5" /> Security
            </button>
          </div>

          {/* Settings Content */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <>
                {/* Business Information */}
                <div
                  className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: "200ms" }}
                >
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <Building2 className="w-5 h-5 text-[#136353]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Business Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your business name"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div
                  className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: "300ms" }}
                >
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <Phone className="w-5 h-5 text-[#136353]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Contact Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900 transition-all duration-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Your business address"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900 transition-all duration-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of your business..."
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <>
                {/* Change Password */}
                <div
                  className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: "200ms" }}
                >
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <Key className="w-5 h-5 text-[#136353]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                  </div>
                  <div className="space-y-5 max-w-lg">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">Must be at least 6 characters.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-900 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {newPassword && confirmPassword && newPassword === confirmPassword && (
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Passwords match
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div
                  className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: "300ms" }}
                >
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <FileText className="w-5 h-5 text-[#136353]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Account Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Account Type</span>
                      <span className="text-sm font-bold text-slate-900">Supplier</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                      <span className="text-sm font-medium text-slate-500">Phone Number</span>
                      <span className="text-sm font-bold text-slate-900">{phone || "Not set"}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-slate-500">Account Status</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
