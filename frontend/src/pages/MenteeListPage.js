import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from 'api';
import { Card, Row, Col, Typography, Button, Spin, Empty, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function MenteeListPage() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { mentorId } = useParams();

  const fetchMentees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/students/mentor/${mentorId}`);
      setMentees(response.data);
      setLoading(false);
    } catch (err) {
      message.error('Failed to fetch mentees for this mentor.');
      setLoading(false);
    }
  }, [mentorId]);

  useEffect(() => {
    fetchMentees();
  }, [fetchMentees]);

  const handleDelete = async (studentId) => {
    try {
      await api.delete(`/students/${studentId}`);
      setMentees(mentees.filter(mentee => mentee._id !== studentId));
      message.success('Mentee deleted successfully');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Dashboard
        </Link>
        
        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0, color: '#0f172a' }}>Mentees for this Mentor</Title>
            <Text type="secondary">Mentor ID: {mentorId}</Text>
          </div>

          {mentees.length === 0 ? (
            <Empty description="This mentor has no mentees assigned." style={{ margin: '40px 0' }} />
          ) : (
            <Row gutter={[16, 16]}>
              {mentees.map((mentee) => (
                <Col xs={24} sm={12} md={12} lg={8} key={mentee._id}>
                  <Card 
                    hoverable 
                    bordered
                    style={{ borderRadius: 12, borderColor: '#e2e8f0', height: '100%' }}
                    bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20 }}
                  >
                    <Link to={`/mentee/${mentee._id}`} style={{ textDecoration: 'none', color: 'inherit', marginBottom: 24, flexGrow: 1, display: 'block' }}>
                      <Title level={4} style={{ margin: 0, color: '#0f172a', lineHeight: 1.3 }}>{mentee.name}</Title>
                      <Text strong style={{ color: '#0ea5e9', fontSize: 14, display: 'block', marginTop: 4 }}>Reg: {mentee.registerNumber}</Text>
                    </Link>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <Popconfirm
                        title={`Delete ${mentee.name}?`}
                        description="Are you sure you want to delete this mentee?"
                        onConfirm={() => handleDelete(mentee._id)}
                        okText="Yes, delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button danger type="primary" icon={<DeleteOutlined />} block style={{ borderRadius: 8, fontWeight: 500 }}>
                           Delete Mentee
                        </Button>
                      </Popconfirm>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>
    </div>
  );
}

export default MenteeListPage;