"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  businessName?: string;
  businessNIT?: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Profile form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessName, setBusinessName] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser || storedUser === "undefined") {
      toast.error("Please log in first");
      router.push("/login");
      return;
    }

    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load profile");
      }

      const user = result.data;
      setProfile(user);
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setBusinessName(user.businessName || "");
    } catch (error: any) {
      toast.error(error.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSavingProfile(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          businessName: businessName.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      setProfile(result.data);

      // Keep localStorage user in sync
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            name: result.data.name,
            phone: result.data.phone,
            address: result.data.address,
            businessName: result.data.businessName,
          }),
        );
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSavingPassword(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/auth/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );

    if (!confirmed) return;

    const doubleCheck = window.confirm(
      "This will permanently delete your account. Continue?",
    );

    if (!doubleCheck) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/auth/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Account deleted successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDashboardLink = () => {
    if (profile?.role === "staff" || profile?.role === "admin") {
      return "/staff/dashboard";
    }
    return "/client/dashboard";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Account Settings</h1>
            <p className="text-sm text-gray-500">
              {profile.email} ({profile.role})
            </p>
          </div>
          <Link
            href={getDashboardLink()}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {profile.businessNIT && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Business NIT
                </label>
                <input
                  type="text"
                  value={profile.businessNIT}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={isSavingProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleUpdatePassword}
              disabled={isSavingPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSavingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        {/* Delete Account */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
          <h2 className="text-lg font-semibold mb-2 text-red-600">
            Delete Account
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This will permanently delete your account. This action cannot be
            undone.
          </p>

          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </main>
    </div>
  );
}
