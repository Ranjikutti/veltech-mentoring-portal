import React, { useState, useEffect } from 'react';
import api from 'api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

function EditMentorPage() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const response = await api.get(`/users/mentor/${mentorId}`);
        form.setFieldsValue(response.data);
        setLoading(false);
      } catch (err) {
        message.error('Failed to fetch mentor details.');
        setLoading(false);
      }
    };
    fetchMentor();
  }, [mentorId, form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const response = await api.put(`/users/mentor/${mentorId}`, values);
      message.success(`Success! Mentor ${response.data.name} updated.`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update mentor.');
      setSaving(false);
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
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Dashboard
        </Link>
        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <Title level={3} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 24, color: '#0f172a' }}>Edit Mentor Details</Title>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Name</span>} 
              name="name" 
              rules={[{ required: true, message: 'Please input the mentor name!' }]}
            >
              <Input placeholder="Enter mentor name" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Email</span>} 
              name="email" 
              rules={[
                { required: true, message: 'Please input the mentor email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input placeholder="Enter mentor email" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#334155' }}>MTS Number</span>} 
              name="mtsNumber" 
              rules={[{ required: true, message: 'Please input the MTS number!' }]}
            >
              <Input placeholder="e.g. MTS1234" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Designation</span>} 
              name="designation" 
              rules={[{ required: true, message: 'Please input the designation!' }]}
            >
              <Input placeholder="e.g. Assistant Professor" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, fontWeight: 600 }} block>
                {saving ? 'Updating...' : 'Update Mentor'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default EditMentorPage;