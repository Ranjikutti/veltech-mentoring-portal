import React, { useState, useEffect } from 'react';
import { Card, Typography, Select, Button, message, Alert } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import api from 'api';

const { Title, Text } = Typography;
const { Option } = Select;

function HodMentorSwitch({ studentId, currentMentorId, onMentorSwitched }) {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(currentMentorId);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await api.get('/users/mentors');
        setMentors(response.data);
      } catch (err) {
        setError('Failed to load mentors list.');
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleSwitch = async () => {
    if (selectedMentor === currentMentorId) {
      message.warning('This student is already assigned to this mentor.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const body = { newMentorId: selectedMentor };
      await api.put(`/students/${studentId}/assign-mentor`, body);
      
      message.success('Mentor successfully reassigned!');
      if (onMentorSwitched) {
        onMentorSwitched();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign mentor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card 
      bordered={false} 
      style={{ 
        background: '#fff1f0', 
        borderColor: '#ffa39e', 
        borderWidth: 1, 
        borderStyle: 'solid',
        borderRadius: 12,
        marginBottom: 24
      }}
      bodyStyle={{ padding: 20 }}
    >
      <Title level={4} style={{ color: '#cf1322', marginTop: 0, marginBottom: 16 }}>
        <SwapOutlined style={{ marginRight: 8 }} />
        HOD Admin: Re-assign Mentor
      </Title>
      
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Assign to New Mentor:</Text>
          <Select
            size="large"
            value={selectedMentor}
            onChange={setSelectedMentor}
            style={{ width: '100%' }}
            loading={loading}
            showSearch
            optionFilterProp="children"
          >
            {mentors.map(mentor => (
              <Option key={mentor._id} value={mentor._id}>
                {mentor.name} ({mentor.mtsNumber})
              </Option>
            ))}
          </Select>
        </div>
        
        <Button 
          type="primary" 
          danger 
          size="large" 
          onClick={handleSwitch} 
          loading={submitting}
          style={{ width: 'fit-content' }}
        >
          Re-Assign Mentor
        </Button>
      </div>
    </Card>
  );
}

export default HodMentorSwitch;