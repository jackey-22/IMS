import { useState } from 'react';
import { Edit, Lock, LogOut, Trash2, Save, X } from 'lucide-react';

// Section Component
function Section({ title, children, icon: Icon }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center gap-3 mb-6">
        {Icon && <Icon className="w-5 h-5 text-ink" />}
        <h2 className="font-heading font-semibold text-lg text-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Edit Profile Modal
function EditProfileModal({ isOpen, onClose, onSave, profile }) {
  const [formData, setFormData] = useState(profile);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-line rounded-lg max-w-md w-full p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-ink">Edit Profile</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-line rounded-lg text-ink hover:bg-surface-soft transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Password Change Modal
function PasswordModal({ isOpen, onClose, onSave }) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('Passwords do not match!');
      return;
    }
    onSave();
    setPasswords({ current: '', new: '', confirm: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-line rounded-lg max-w-md w-full p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-ink">Change Password</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Confirm Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-lg bg-surface-soft text-ink text-sm"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-line rounded-lg text-ink hover:bg-surface-soft transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Rahul Sharma',
    email: 'rahul.sharma@ims.com',
    role: 'Inventory Manager',
    department: 'Warehouse Operations',
    phone: '+91-98765-43210',
    joinDate: '2024-01-15',
    lastLogin: '2026-03-14 10:30 AM'
  });

  const activityLog = [
    { id: 1, action: 'Updated inventory count', time: '2026-03-14 10:15 AM', type: 'edit' },
    { id: 2, action: 'Created new receipt REC-9042', time: '2026-03-14 09:45 AM', type: 'create' },
    { id: 3, action: 'Approved delivery DEL-3021', time: '2026-03-14 08:30 AM', type: 'approve' },
    { id: 4, action: 'Generated stock ledger report', time: '2026-03-13 03:45 PM', type: 'export' },
    { id: 5, action: 'Updated product details', time: '2026-03-13 02:20 PM', type: 'edit' },
  ];

  const handleProfileSave = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handlePasswordSave = () => {
    alert('Password changed successfully!');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-ink">Profile</h1>
        <p className="text-ink-soft text-sm mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-surface border border-line rounded-lg p-8 mb-6 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-heading font-bold text-2xl">
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-ink">{profile.name}</h2>
            <p className="text-ink-soft mt-1">{profile.role} • {profile.department}</p>
            <p className="text-xs text-ink-soft mt-2">Member since {profile.joinDate}</p>
          </div>
        </div>
        <button
          onClick={() => setEditModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Personal Information Section */}
      <Section title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Full Name</p>
            <p className="text-ink font-medium">{profile.name}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Email</p>
            <p className="text-ink font-medium">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Department</p>
            <p className="text-ink font-medium">{profile.department}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Phone</p>
            <p className="text-ink font-medium">{profile.phone}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Role</p>
            <p className="text-ink font-medium">{profile.role}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Last Login</p>
            <p className="text-ink font-medium">{profile.lastLogin}</p>
          </div>
        </div>
      </Section>

      {/* Security Section */}
      <Section title="Security" icon={Lock}>
        <div className="space-y-3">
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="w-full px-4 py-3 border border-line rounded-lg text-ink hover:bg-surface-soft transition-colors text-left flex items-center justify-between group"
          >
            <span>Change Password</span>
            <Edit className="w-4 h-4 text-ink-soft group-hover:text-ink" />
          </button>
          <p className="text-xs text-ink-soft">
            Secure your account by changing your password regularly. Use a strong password with a mix of uppercase, lowercase, numbers, and symbols.
          </p>
        </div>
      </Section>

      {/* Activity Log Section */}
      <Section title="Activity Log">
        <div className="space-y-3">
          {activityLog.map((log) => (
            <div key={log.id} className="flex items-start gap-4 pb-3 border-b border-line last:border-0">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                log.type === 'create' ? 'bg-green-500' :
                log.type === 'edit' ? 'bg-blue-500' :
                log.type === 'approve' ? 'bg-purple-500' :
                'bg-orange-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{log.action}</p>
                <p className="text-xs text-ink-soft mt-1">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Danger Zone Section */}
      <Section title="Danger Zone">
        <div className="space-y-4">
          <button className="w-full px-4 py-3 border border-red-200 bg-red-50 text-red-800 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-between group">
            <span>Sign Out</span>
            <LogOut className="w-4 h-4" />
          </button>
          <button className="w-full px-4 py-3 border border-red-300 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-between group">
            <span>Delete Account</span>
            <Trash2 className="w-4 h-4" />
          </button>
          <p className="text-xs text-red-600">
            ⚠️ Deleting your account is permanent and cannot be undone. All your data will be permanently removed.
          </p>
        </div>
      </Section>

      {/* Modals */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleProfileSave}
        profile={profile}
      />

      <PasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSave={handlePasswordSave}
      />
    </div>
  );
}
