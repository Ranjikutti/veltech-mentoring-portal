import React, { useState } from 'react';
import api from 'api';
import { Form, Input, Button, message, Typography, Row, Col } from 'antd';

const { Title } = Typography;

function AddMentorForm({ onMentorAdded }) {
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const response = await api.post('/users/create-mentor', values);
      message.success(`Success! Mentor ${response.data.name} created.`);
      onMentorAdded(response.data);
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create mentor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <Title level={4} style={{ marginBottom: 24, color: '#0f172a' }}>Add New Mentor</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Name</span>} 
              name="name" 
              rules={[{ required: true, message: 'Please input the mentor name!' }]}
            >
              <Input placeholder="Enter mentor name" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
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
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#334155' }}>MTS Number (e.g., mts003)</span>} 
              name="mtsNumber" 
              rules={[{ required: true, message: 'Please input the MTS number!' }]}
            >
              <Input placeholder="e.g. MTS1234" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Designation</span>} 
              name="designation" 
              rules={[{ required: true, message: 'Please input the designation!' }]}
            >
              <Input placeholder="e.g. Assistant Professor" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Initial Password</span>} 
              name="password" 
              rules={[{ required: true, message: 'Please input the initial password!' }]}
            >
              <Input.Password placeholder="Create a password" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, fontWeight: 600 }}>
            {saving ? 'Adding...' : 'Add Mentor'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default AddMentorForm;