import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from 'api';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Space, Typography, Card } from 'antd';

import AddMentorForm from './AddMentorForm';
import AddStudentForm from './AddStudentForm';

const { Title, Text } = Typography;

function HodDashboard() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const getMentors = async () => {
    setLoading(true);
    setError('');
    setMentors([]);

    try {
      const response = await api.get('/users/mentors');
      setMentors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch mentors.');
      setLoading(false);
    }
  };
  
  const handleDeleteMentor = async (mentorId, mentorName) => {
    const confirmDelete = window.prompt(`Type the mentor's name to delete: "${mentorName}"`);
    if (confirmDelete !== mentorName) {
      alert('Name did not match. Deletion cancelled.');
      return;
    }
    try {
      await api.delete(`/users/mentor/${mentorId}`);
      setMentors(mentors.filter(mentor => mentor._id !== mentorId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete mentor.');
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 4, color: '#0f172a' }}>HOD Dashboard</Title>
      <Text type="secondary" style={{ display: 'block', paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
        Your Department: {user.department}
      </Text>
      
      <Row gutter={[12, 12]} style={{ paddingBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Button 
            block
            type="primary" 
            onClick={getMentors} 
            style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, height: 40, fontWeight: 500 }}
          >
            View All Mentors
          </Button>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Button 
            block
            type="primary" 
            onClick={() => {
              setShowAddMentor(!showAddMentor);
              if (!showAddMentor) setShowAddStudent(false);
            }} 
            style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, height: 40, fontWeight: 500 }}
          >
            {showAddMentor ? 'Close Form' : 'Add New Mentor'}
          </Button>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Button 
            block
            type="primary" 
            onClick={() => {
              setShowAddStudent(!showAddStudent);
              if (!showAddStudent) setShowAddMentor(false);
            }} 
            style={{ background: '#8b5cf6', borderColor: '#8b5cf6', borderRadius: 8, height: 40, fontWeight: 500 }}
          >
            {showAddStudent ? 'Close Form' : 'Add New Student'}
          </Button>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Link to="/hods" style={{ width: '100%', display: 'block' }}>
            <Button 
              block
              type="primary" 
              style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, height: 40, fontWeight: 500 }}
            >
              Manage HOD Profiles
            </Button>
          </Link>
        </Col>
      </Row>
      
      {showAddMentor && (
        <Card style={{ marginBottom: 24, background: '#f8fafc', borderRadius: 12, borderColor: '#e2e8f0' }}>
          <AddMentorForm
            onMentorAdded={(newMentor) => {
              setMentors([...mentors, newMentor]);
              setShowAddMentor(false);
            }}
          />
        </Card>
      )}
      
      {showAddStudent && (
        <Card style={{ marginBottom: 24, background: '#f8fafc', borderRadius: 12, borderColor: '#e2e8f0' }}>
          <AddStudentForm
            onStudentAdded={() => {
              setShowAddStudent(false);
            }}
          />
        </Card>
      )}
      
      {loading && <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>Loading mentors...</Text>}
      {error && <Text type="danger" style={{ display: 'block', background: '#fef2f2', padding: 12, borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>{error}</Text>}
      
      <Row gutter={[16, 16]}>
        {mentors.map(mentor => (
          <Col xs={24} sm={12} md={12} lg={8} xl={6} key={mentor._id}>
            <Card 
              hoverable
              bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}
              style={{ borderRadius: 12, height: '100%', borderColor: '#e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            >
              <Link to={`/mentor/${mentor._id}`} style={{ textDecoration: 'none', color: 'inherit', marginBottom: 16, flexGrow: 1, display: 'block' }}>
                <Title level={5} style={{ margin: 0, color: '#0f172a' }} ellipsis={{ tooltip: mentor.name }}>
                  {mentor.name}
                </Title>
                <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                  {mentor.designation} <br/>({mentor.mtsNumber})
                </Text>
              </Link>
              
              <Space style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <Link to={`/mentor/${mentor._id}/edit`}>
                  <Button type="default" style={{ borderColor: '#f59e0b', color: '#f59e0b', fontWeight: 500, borderRadius: 6 }}>
                    Edit
                  </Button>
                </Link>

                <Button 
                  danger 
                  type="primary" 
                  onClick={() => handleDeleteMentor(mentor._id, mentor.name)}
                  style={{ borderRadius: 6, fontWeight: 500 }}
                >
                  Delete
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default HodDashboard;
