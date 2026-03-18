import React, { useState, useEffect } from 'react';
import api from 'api';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Button } from 'antd';
const { Title, Text } = Typography;

function MentorDashboard() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const response = await api.get('/students/my-mentees');
        setMentees(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch mentees.');
        setLoading(false);
      }
    };
    fetchMentees();
  }, []);

  if (loading) return <div className="text-slate-500 animate-pulse mt-4">Loading your mentees...</div>;
  if (error) return <div className="text-red-500 bg-red-50 p-3 rounded-lg mt-4">{error}</div>;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/performance">
          <Button type="primary" size="large" style={{ background: '#0ea5e9', borderColor: '#0ea5e9' }}>
            View Performance Report
          </Button>
        </Link>
      </div>

      <Title level={4} style={{ color: '#0f172a', marginBottom: 16 }}>Your Mentees</Title>
      
      {mentees.length === 0 ? (
        <Card>
          <Text type="secondary">You have no mentees assigned yet.</Text>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {mentees.map(mentee => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={mentee._id}>
              <Link to={`/mentee/${mentee._id}`} style={{ textDecoration: 'none' }}>
                <Card 
                  hoverable 
                  size="small" 
                  style={{ borderRadius: 12, height: '100%', borderColor: '#e2e8f0' }}
                  bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <Title level={5} style={{ margin: 0, color: '#0f172a' }}>{mentee.name}</Title>
                  <Text type="secondary" style={{ marginTop: 4 }}>Reg: {mentee.registerNumber}</Text>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default MentorDashboard;