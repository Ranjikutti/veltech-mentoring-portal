// src/pages/LoginPage.js
import React, { useState } from 'react';
import api from 'api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Typography, Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/users/login', values);
      login(response.data);
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '24px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(14, 165, 233, 0.15), 0 10px 20px -5px rgba(14, 165, 233, 0.1)'
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ color: '#0f172a', margin: 0, fontWeight: 700 }}>
            Mentor & HOD Login
          </Title>
          <Text type="secondary" style={{ color: '#64748b' }}>
            Welcome back! Please enter your details.
          </Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={handleLogin}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your Email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
              placeholder="you@example.com" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />} 
              placeholder="••••••••" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block 
              style={{ 
                height: '46px', 
                borderRadius: '8px', 
                background: '#0ea5e9', 
                borderColor: '#0ea5e9',
                fontWeight: 600,
                fontSize: '16px'
              }}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;