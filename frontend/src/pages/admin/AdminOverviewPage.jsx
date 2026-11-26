import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  FileText,
  MapPin,
  Plus,
} from 'lucide-react';
import OrgSidebar from '../../components/layout/OrgSidebar';
import StatusPill from '../../components/common/StatusPill';
import { useBloodData } from '../../context/BloodDataContext';

export const AdminOverviewPage = () => {
  const {
    applications,
    selectedAppId,
    setSelectedAppId,
    updateApplicationStatus,
    users,
    updateUserStatus,
    emergencies,
  } = useBloodData();

  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const selectedApp =
    applications.find((a) => a.id === selectedAppId) || applications[0] || {};

  const handleApprove = () => {
    updateApplicationStatus(selectedApp.id, 'APPROVED');
    setActionSuccess(`Approved ${selectedApp.name}!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleRequestChanges = () => {
    if (!adminNote) {
      alert('Please enter a note explaining what changes are requested.');
      return;
    }
    updateApplicationStatus(selectedApp.id, 'CHANGES REQUESTED', adminNote);
    setActionSuccess(`Changes requested for ${selectedApp.name}.`);
    setAdminNote('');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleReject = () => {
    if (!adminNote) {
      alert('Please enter a reason for rejection.');
      return;
    }
    updateApplicationStatus(selectedApp.id, 'REJECTED', adminNote);
    setActionSuccess(`Application for ${selectedApp.name} rejected.`);
    setAdminNote('');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role.toLowerCase() !== userRoleFilter.toLowerCase()) {
      return false;
    }
    if (
      userSearchQuery &&
      !u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) &&
      !u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  return (
    <OrgSidebar>
      <div className="space-y-8">
        {/* Header & Invite Button (UI/UX Page 9) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Admin overview
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {pendingCount} organizations are waiting for your review.
            </p>
          </div>
          <button
            onClick={() => alert('Invite administrator dialog')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite an admin</span>
          </button>
        </div>

        {actionSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border-2 border-red-200 shadow-xs">
            <div className="text-xs font-semibold text-[#B81D24] uppercase tracking-wider">
              Pending approvals
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#B81D24] mt-2">
              {pendingCount}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Verified organizations
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2">24</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Registered donors
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2">1,420</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Live emergencies
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2">
              {emergencies.filter((e) => e.status === 'LIVE').length}
            </div>
          </div>
        </div>

        {/* Split Row: Approval Queue & Review Application (UI/UX Page 9) */}
        <div
          id="approvals"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left: Approval Queue */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900">Approval queue</h2>
              <span className="text-xs text-stone-500 font-medium">Oldest first</span>
            </div>

            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedAppId === app.id
                      ? 'border-[#B81D24] bg-red-50/40 ring-1 ring-[#B81D24]'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 text-xs sm:text-sm">{app.name}</span>
                    <StatusPill status={app.status} size="xs" />
                  </div>
                  <div className="text-xs text-stone-500">
                    {app.type} · submitted {app.submittedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Review Application Details */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900">Review application</h2>
              <StatusPill status={selectedApp.status} size="xs" />
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs border border-stone-100 rounded-xl p-4 bg-[#FAF9F8]">
              <div>
                <dt className="text-stone-500 font-medium"></dt>
                <dd className="font-semibold text-stone-900 mt-0.5">{selectedApp.name}</dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Type</dt>
                <dd className="font-semibold text-stone-900 mt-0.5">{selectedApp.type}</dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Registration no.</dt>
                <dd className="font-mono text-stone-900 mt-0.5">{selectedApp.registrationNumber}</dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Contact</dt>
                <dd className="font-semibold text-stone-900 mt-0.5">
                  {selectedApp.contactPerson}, {selectedApp.jobTitle}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Email</dt>
                <dd className="text-stone-900 mt-0.5">{selectedApp.email}</dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Phone</dt>
                <dd className="text-stone-900 mt-0.5 flex items-center gap-1.5">
                  <span>{selectedApp.phone}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    VERIFIED
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-stone-500 font-medium">Address</dt>
                <dd className="text-stone-900 mt-0.5">{selectedApp.address}</dd>
              </div>
            </dl>

            {/* Document and Location Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-stone-200 rounded-xl p-3.5 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-700">
                  <FileText className="w-4 h-4 text-[#B81D24]" />
                  <span className="font-semibold truncate max-w-[140px]">
                    {selectedApp.licenseDoc}
                  </span>
                </div>
                <button
                  onClick={() => alert(`Viewing verified document: ${selectedApp.licenseDoc}`)}
                  className="font-bold text-[#B81D24] hover:underline"
                >
                  View
                </button>
              </div>

              <div className="border border-stone-200 rounded-xl p-3.5 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-700">
                  <MapPin className="w-4 h-4 text-[#B81D24]" />
                  <span className="font-semibold">GPS: {selectedApp.locationCoordinates}</span>
                </div>
                <button
                  onClick={() => alert(`Location verified on satellite maps.`)}
                  className="font-bold text-[#B81D24] hover:underline"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Admin Note Input */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-stone-700">
                Note to applicant (required for rejection or changes)
              </label>
              <textarea
                rows={2}
                placeholder="Reason or requested changes"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleApprove}
                className="px-5 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Approve
              </button>
              <button
                onClick={handleRequestChanges}
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-300 transition-colors"
              >
                Request changes
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-red-50 text-[#B81D24] font-semibold text-xs border border-red-300 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>

        {/* Section: Users (UI/UX Page 9) */}
        <div
          id="users"
          className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-stone-900">Users</h2>
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, email or phone"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#B81D24]"
              />
            </div>
          </div>

          {/* Role Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'DONORS', 'HOSPITALS', 'BLOOD BANKS', 'ADMINS'].map((rf) => (
              <button
                key={rf}
                onClick={() => setUserRoleFilter(rf === 'DONORS' ? 'donor' : rf === 'HOSPITALS' ? 'hospital' : rf === 'BLOOD BANKS' ? 'blood bank' : rf === 'ADMINS' ? 'admin' : 'ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  (userRoleFilter === 'ALL' && rf === 'ALL') ||
                  (userRoleFilter === 'donor' && rf === 'DONORS') ||
                  (userRoleFilter === 'hospital' && rf === 'HOSPITALS') ||
                  (userRoleFilter === 'blood bank' && rf === 'BLOOD BANKS') ||
                  (userRoleFilter === 'admin' && rf === 'ADMINS')
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {rf.charAt(0) + rf.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Users Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-stone-900">{u.name}</td>
                      <td className="py-3.5 px-4 font-medium text-stone-600">{u.role}</td>
                      <td className="py-3.5 px-4">
                        <StatusPill status={u.status} size="xs" />
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">{u.joined}</td>
                      <td className="py-3.5 px-4 text-right">
                        {u.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => updateUserStatus(u.id, 'ACTIVE')}
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            Reinstate
                          </button>
                        ) : u.status === 'PENDING' ? (
                          <button
                            onClick={() => setSelectedAppId('app-002')}
                            className="font-bold text-[#B81D24] hover:underline"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(u.id, 'SUSPENDED')}
                            className="font-semibold text-red-600 hover:underline"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section: Recent Emergencies and Alert Log (UI/UX Page 9) */}
        <div
          id="alerts"
          className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">Recent emergencies and alert log</h2>
            <button
              onClick={() => alert('Full global alert dispatch log exported.')}
              className="text-xs font-semibold text-[#B81D24] hover:underline"
            >
              Open full log
            </button>
          </div>

          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4">Hospital</th>
                    <th className="py-2.5 px-4">Blood type</th>
                    <th className="py-2.5 px-4">Alerts sent</th>
                    <th className="py-2.5 px-4">Delivered</th>
                    <th className="py-2.5 px-4">Accepted</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {emergencies.map((e) => (
                    <tr key={e.id} className="hover:bg-stone-50/60">
                      <td className="py-3 px-4 font-semibold text-stone-900">{e.hospitalName}</td>
                      <td className="py-3 px-4 font-bold text-[#B81D24]">{e.bloodType}</td>
                      <td className="py-3 px-4">{e.donorsAlerted}</td>
                      <td className="py-3 px-4">{e.donorsAlerted}</td>
                      <td className="py-3 px-4">{e.unitsConfirmed}</td>
                      <td className="py-3 px-4 text-right">
                        <StatusPill status={e.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </OrgSidebar>
  );
};

export default AdminOverviewPage;
