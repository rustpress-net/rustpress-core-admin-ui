/**
 * Security Dashboard Component
 * Manage users, permissions, virtual hosts, and policies
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Server,
  Key,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Settings,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import { DataTable, Column } from '../shared/DataTable';
import { Modal } from '../shared/Modal';
import { Tabs, TabPanel, VerticalTabs } from '../shared/Tabs';
import type { User, VirtualHost, Permission, Role, Policy } from '../../types';

export function SecurityDashboard() {
  const {
    users,
    virtualHosts,
    permissions,
    roles,
    policies,
    addUser,
    deleteUser,
    addVirtualHost,
  } = useQueueManagerStore();

  const [activeSection, setActiveSection] = useState('users');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateVhostOpen, setIsCreateVhostOpen] = useState(false);

  const sections = [
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'vhosts', label: 'Virtual Hosts', icon: <Server className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissions', icon: <Lock className="w-4 h-4" /> },
    { id: 'policies', label: 'Policies', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Sidebar Navigation */}
      <div className="w-56 flex-shrink-0">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2">
          <VerticalTabs
            tabs={sections}
            activeTab={activeSection}
            onChange={setActiveSection}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeSection === 'users' && (
          <UsersPanel
            users={users}
            onCreateUser={() => setIsCreateUserOpen(true)}
            onDeleteUser={deleteUser}
          />
        )}
        {activeSection === 'vhosts' && (
          <VirtualHostsPanel
            virtualHosts={virtualHosts}
            onCreateVhost={() => setIsCreateVhostOpen(true)}
          />
        )}
        {activeSection === 'permissions' && (
          <PermissionsPanel permissions={permissions} users={users} virtualHosts={virtualHosts} />
        )}
        {activeSection === 'policies' && (
          <PoliciesPanel policies={policies} />
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onSubmit={addUser}
      />

      {/* Create VHost Modal */}
      <CreateVhostModal
        isOpen={isCreateVhostOpen}
        onClose={() => setIsCreateVhostOpen(false)}
        onSubmit={addVirtualHost}
      />
    </div>
  );
}

// Users Panel
function UsersPanel({
  users,
  onCreateUser,
  onDeleteUser,
}: {
  users: User[];
  onCreateUser: () => void;
  onDeleteUser: (id: string) => void;
}) {
  const columns: Column<User>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Users className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">{user.username}</p>
            <p className="text-xs text-neutral-500">{user.roles.join(', ')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <span
              key={role}
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                role === 'administrator'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
              )}
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'authMechanism',
      header: 'Auth Method',
      width: '120px',
      render: (user) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {user.authMechanism}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: '150px',
      render: (user) => (
        <span className="text-sm text-neutral-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const rowActions = (user: User) => (
    <div className="flex items-center gap-1">
      <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDeleteUser(user.id)}
        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Users</h3>
          <p className="text-sm text-neutral-500">{users.length} users</p>
        </div>
        <button
          onClick={onCreateUser}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        keyField="id"
        rowActions={rowActions}
        emptyMessage="No users found"
      />
    </div>
  );
}

// Virtual Hosts Panel
function VirtualHostsPanel({
  virtualHosts,
  onCreateVhost,
}: {
  virtualHosts: VirtualHost[];
  onCreateVhost: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Virtual Hosts</h3>
          <p className="text-sm text-neutral-500">{virtualHosts.length} virtual hosts</p>
        </div>
        <button
          onClick={onCreateVhost}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Virtual Host
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {virtualHosts.map((vhost) => (
          <motion.div
            key={vhost.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Server className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{vhost.name}</p>
                  <p className="text-xs text-neutral-500">{vhost.description || 'No description'}</p>
                </div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{vhost.queues}</p>
                <p className="text-xs text-neutral-500">Queues</p>
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{vhost.exchanges}</p>
                <p className="text-xs text-neutral-500">Exchanges</p>
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{vhost.connections}</p>
                <p className="text-xs text-neutral-500">Connections</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Permissions Panel
function PermissionsPanel({
  permissions,
  users,
  virtualHosts,
}: {
  permissions: Permission[];
  users: User[];
  virtualHosts: VirtualHost[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Permissions</h3>
          <p className="text-sm text-neutral-500">User permissions by virtual host</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add Permission
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Virtual Host</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Configure</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Write</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Read</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {permissions.map((perm) => (
              <tr key={perm.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {perm.user}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {perm.vhost}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {perm.configure === '.*' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                  ) : (
                    <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                      {perm.configure}
                    </code>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {perm.write === '.*' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                  ) : (
                    <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                      {perm.write}
                    </code>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {perm.read === '.*' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                  ) : (
                    <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                      {perm.read}
                    </code>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Policies Panel
function PoliciesPanel({ policies }: { policies: Policy[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Policies</h3>
          <p className="text-sm text-neutral-500">Queue and exchange policies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      <div className="space-y-3">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-neutral-900 dark:text-white">{policy.name}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                    Priority: {policy.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span>Virtual Host: {policy.vhost}</span>
                  <span>Pattern: <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 rounded">{policy.pattern}</code></span>
                  <span>Apply to: {policy.applyTo}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs font-medium text-neutral-500 mb-2">Definition</p>
              <pre className="text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                {JSON.stringify(policy.definition, null, 2)}
              </pre>
            </div>
          </div>
        ))}

        {policies.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <Settings className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-neutral-600 dark:text-neutral-400">No policies defined</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Create User Modal
function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: User) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['monitoring']);

  const handleSubmit = () => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      passwordHash: btoa(password),
      roles: selectedRoles,
      authMechanism: 'PLAIN',
      createdAt: new Date().toISOString(),
    };
    onSubmit(newUser);
    handleClose();
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setSelectedRoles(['monitoring']);
    onClose();
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const availableRoles = ['administrator', 'monitoring', 'policymaker', 'management', 'impersonator'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create User"
      icon={<Users className="w-5 h-5 text-primary-600" />}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!username || !password}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Create User
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-4 pr-10 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Roles
          </label>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => toggleRole(role)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors',
                  selectedRoles.includes(role)
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Create Virtual Host Modal
function CreateVhostModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vhost: VirtualHost) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const newVhost: VirtualHost = {
      id: `vhost-${Date.now()}`,
      name,
      description,
      queues: 0,
      exchanges: 0,
      connections: 0,
      messages: 0,
    };
    onSubmit(newVhost);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Virtual Host"
      icon={<Server className="w-5 h-5 text-primary-600" />}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Create Virtual Host
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., production"
            className="w-full h-10 px-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional description..."
            className="w-full p-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

export default SecurityDashboard;
