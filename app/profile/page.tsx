'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Calendar, MapPin, Shield, CreditCard, Bell, Globe, Camera, Edit2, Save, X, LogOut, Award, Plane } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [isSaving, setIsSaving] = useState(false)
  
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    nationality: 'US',
    passportNumber: 'A12345678',
    passportExpiry: '2028-12-31',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    preferredCurrency: 'USD',
    preferredLanguage: 'en',
    newsletter: true,
    smsNotifications: false,
    emailNotifications: true,
    twoFactorAuth: false
  })

  const [tempProfile, setTempProfile] = useState(profile)

  const stats = {
    tripsCompleted: 12,
    countriesVisited: 8,
    totalSaved: 2340,
    memberSince: '2022',
    loyaltyPoints: 4560,
    tierStatus: 'Gold'
  }

  const savedCards = [
    { id: 1, last4: '4242', brand: 'Visa', expiry: '12/25', isDefault: true },
    { id: 2, last4: '8888', brand: 'Mastercard', expiry: '06/24', isDefault: false }
  ]

  const handleEdit = () => {
    setIsEditing(true)
    setTempProfile(profile)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTempProfile(profile)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setProfile(tempProfile)
      setIsEditing(false)
      setIsSaving(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setTempProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLogout = () => {
    // Clear auth and redirect
    localStorage.removeItem('token')
    router.push('/login')
  }

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-gray-600 mb-3">{profile.email}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-yellow-600">{stats.tierStatus} Member</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">Member since {stats.memberSince}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <Plane className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.tripsCompleted}</p>
            <p className="text-sm text-gray-600">Trips</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.countriesVisited}</p>
            <p className="text-sm text-gray-600">Countries</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">${stats.totalSaved}</p>
            <p className="text-sm text-gray-600">Saved</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.loyaltyPoints}</p>
            <p className="text-sm text-gray-600">Points</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center col-span-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">440 points to Platinum</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex">
              {['personal', 'security', 'payment', 'preferences'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-3 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'personal' && <User className="w-4 h-4 inline mr-2" />}
                  {tab === 'security' && <Shield className="w-4 h-4 inline mr-2" />}
                  {tab === 'payment' && <CreditCard className="w-4 h-4 inline mr-2" />}
                  {tab === 'preferences' && <Bell className="w-4 h-4 inline mr-2" />}
                  {tab} {tab === 'personal' ? 'Information' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={isEditing ? tempProfile.firstName : profile.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={isEditing ? tempProfile.lastName : profile.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={isEditing ? tempProfile.email : profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={isEditing ? tempProfile.phone : profile.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={isEditing ? tempProfile.dateOfBirth : profile.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <select
                      name="gender"
                      value={isEditing ? tempProfile.gender : profile.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <h3 className="font-semibold text-lg pt-4 border-t">Travel Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Passport Number</label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={isEditing ? tempProfile.passportNumber : profile.passportNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Passport Expiry</label>
                    <input
                      type="date"
                      name="passportExpiry"
                      value={isEditing ? tempProfile.passportExpiry : profile.passportExpiry}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nationality</label>
                    <select
                      name="nationality"
                      value={isEditing ? tempProfile.nationality : profile.nationality}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    >
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>

                <h3 className="font-semibold text-lg pt-4 border-t">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={isEditing ? tempProfile.address : profile.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={isEditing ? tempProfile.city : profile.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State/Province</label>
                    <input
                      type="text"
                      name="state"
                      value={isEditing ? tempProfile.state : profile.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP/Postal Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={isEditing ? tempProfile.zipCode : profile.zipCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={isEditing ? tempProfile.country : profile.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Security Status</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Your account is protected with standard security. Consider enabling two-factor authentication for enhanced protection.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Password</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Change Password
                  </button>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="twoFactorAuth"
                        checked={profile.twoFactorAuth}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Login History</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Chrome on Windows</p>
                        <p className="text-sm text-gray-600">New York, US</p>
                      </div>
                      <p className="text-sm text-gray-600">2 hours ago</p>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Safari on iPhone</p>
                        <p className="text-sm text-gray-600">New York, US</p>
                      </div>
                      <p className="text-sm text-gray-600">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Saved Cards</h3>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Add New Card
                    </button>
                  </div>
                  <div className="space-y-3">
                    {savedCards.map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{card.brand} ending in {card.last4}</p>
                            <p className="text-sm text-gray-600">Expires {card.expiry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {card.isDefault && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Default</span>
                          )}
                          <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                          <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Billing Address</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                    <p className="text-gray-600">{profile.address}</p>
                    <p className="text-gray-600">{profile.city}, {profile.state} {profile.zipCode}</p>
                    <p className="text-gray-600">{profile.country}</p>
                    <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm">Edit Address</button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Communication Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive booking confirmations and travel updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={profile.emailNotifications}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Get text alerts for flight changes and reminders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="smsNotifications"
                          checked={profile.smsNotifications}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">Newsletter</p>
                        <p className="text-sm text-gray-600">Weekly travel deals and destination inspiration</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="newsletter"
                          checked={profile.newsletter}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Display Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Currency</label>
                      <select
                        name="preferredCurrency"
                        value={profile.preferredCurrency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Language</label>
                      <select
                        name="preferredLanguage"
                        value={profile.preferredLanguage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}