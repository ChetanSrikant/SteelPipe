"use client";
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function SettingsPage() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <Header />
                
                {/* Settings Content */}
                <div className="p-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Profile Settings */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Profile Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="name@innodatatics.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Security</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Change Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="New password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Dark Mode</p>
                                    <p className="text-sm text-gray-500">Toggle between light and dark theme</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-8 flex justify-end">
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}