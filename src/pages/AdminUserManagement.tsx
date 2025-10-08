import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { Users, Search, Filter, Edit3 } from 'lucide-react';
import { config } from '../config';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  nationality?: string;
  preferredLanguage?: string;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

const AdminUserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const roles = ['User', 'TourGuide', 'Staff', 'Admin'];
  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'All') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(user => 
        statusFilter === 'Active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAlert({ type: 'danger', message: 'No authentication token found. Please login again.' });
        return;
      }

      const response = await fetch(`${config.API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const userData = await response.json();
          setUsers(userData);
        } else {
          const textResponse = await response.text();
          console.error('Non-JSON response:', textResponse);
          setAlert({ type: 'danger', message: 'Server returned invalid response format' });
        }
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        
        if (response.status === 401) {
          setAlert({ type: 'danger', message: 'Unauthorized access. Please check your permissions.' });
        } else if (response.status === 404) {
          setAlert({ type: 'danger', message: 'API endpoint not found. Please check the server configuration.' });
        } else {
          setAlert({ type: 'danger', message: `Failed to fetch users (${response.status})` });
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setAlert({ type: 'danger', message: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewStatus(user.isActive);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Update role if changed
      if (newRole !== selectedUser.role) {
        const roleResponse = await fetch(`${config.API_BASE_URL}/admin/users/${selectedUser.id}/role`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: newRole })
        });

        if (!roleResponse.ok) {
          const errorData = await roleResponse.text();
          throw new Error(errorData || 'Failed to update user role');
        }
      }

      // Update status if changed
      if (newStatus !== selectedUser.isActive) {
        const statusResponse = await fetch(`${config.API_BASE_URL}/admin/users/${selectedUser.id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isActive: newStatus })
        });

        if (!statusResponse.ok) {
          const errorData = await statusResponse.text();
          throw new Error(errorData || 'Failed to update user status');
        }
      }

      setAlert({ type: 'success', message: 'User updated successfully' });
      setShowEditModal(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      setAlert({ type: 'danger', message: errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Staff': return 'warning';
      case 'TourGuide': return 'info';
      case 'User': return 'primary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCurrentUser = (userId: number) => {
    return currentUser?.id === userId;
  };

  return (
    <Container fluid className="py-4">
      {alert && (
        <Alert 
          variant={alert.type} 
          onClose={() => setAlert(null)} 
          dismissible
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Users size={32} className="me-3 text-primary" />
            <div>
              <h2 className="mb-0">User Management</h2>
              <p className="text-muted mb-0">Manage user accounts, roles, and permissions</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button variant="outline-primary" onClick={fetchUsers} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Refresh'}
          </Button>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-primary">{users.length}</h4>
              <p className="text-muted mb-0 small">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-success">{users.filter(u => u.isActive).length}</h4>
              <p className="text-muted mb-0 small">Active Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-info">{users.filter(u => u.role === 'TourGuide').length}</h4>
              <p className="text-muted mb-0 small">Tour Guides</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-danger">{users.filter(u => u.role === 'Admin').length}</h4>
              <p className="text-muted mb-0 small">Administrators</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Users List ({filteredUsers.length})</h5>
            <div className="d-flex align-items-center">
              <Filter size={16} className="me-2" />
              <span className="small text-muted">
                Showing {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <Users size={48} className="text-muted mb-3" />
              <p className="text-muted">No users found matching your criteria</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <strong>{user.name}</strong>
                        {isCurrentUser(user.id) && (
                          <Badge bg="warning" className="ms-2">You</Badge>
                        )}
                        <br />
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        {user.phoneNumber && (
                          <>
                            <small>📞 {user.phoneNumber}</small><br />
                          </>
                        )}
                        {user.nationality && (
                          <small>🌍 {user.nationality}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={user.isActive ? 'success' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <small>{formatDate(user.createdAt)}</small>
                    </td>
                    <td>
                      <small>
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={actionLoading}
                        >
                          <Edit3 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Edit3 size={20} className="me-2" />
            Edit User: {selectedUser?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value)}
                      disabled={isCurrentUser(selectedUser.id) && selectedUser.role === 'Admin'}
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </Form.Select>
                    {isCurrentUser(selectedUser.id) && selectedUser.role === 'Admin' && (
                      <Form.Text className="text-muted">
                        You cannot change your own admin role
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      value={newStatus.toString()} 
                      onChange={(e) => setNewStatus(e.target.value === 'true')}
                      disabled={isCurrentUser(selectedUser.id)}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Form.Select>
                    {isCurrentUser(selectedUser.id) && (
                      <Form.Text className="text-muted">
                        You cannot deactivate your own account
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <div className="border rounded p-3 bg-light">
                <h6>User Information</h6>
                <div className="row">
                  <div className="col-6">
                    <small><strong>Email:</strong> {selectedUser.email}</small>
                  </div>
                  <div className="col-6">
                    <small><strong>Phone:</strong> {selectedUser.phoneNumber || 'N/A'}</small>
                  </div>
                  <div className="col-6">
                    <small><strong>Nationality:</strong> {selectedUser.nationality || 'N/A'}</small>
                  </div>
                  <div className="col-6">
                    <small><strong>Language:</strong> {selectedUser.preferredLanguage || 'N/A'}</small>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateUser}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminUserManagement;