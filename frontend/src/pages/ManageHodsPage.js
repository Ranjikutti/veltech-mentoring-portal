import React, { useEffect, useState } from 'react';
import api from 'api';
import { Link } from 'react-router-dom';
import { Card, Form, Input, Button, Row, Col, Typography, message, Popconfirm, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function ManageHodsPage() {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form] = Form.useForm();

  const sortHods = (list) => {
    const arr = Array.isArray(list) ? [...list] : [];
    arr.sort((a, b) => {
      const depA = (a.department || '').localeCompare(b.department || '');
      if (depA !== 0) return depA;
      return (a.name || '').localeCompare(b.name || '');
    });
    return arr;
  };

  const loadHods = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/hods');
      setHods(sortHods(res.data || []));
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to load HODs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHods();
  }, []);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const body = {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        mtsNumber: values.mtsNumber.trim(),
        department: values.department.trim(),
        designation: values.designation.trim()
      };
      const res = await api.post('/users/hods', body);
      message.success('HOD created successfully');
      form.resetFields();
      setHods((prev) => sortHods([...prev, res.data]));
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to create HOD');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/users/hods/${id}`);
      setHods((prev) => prev.filter((h) => h._id !== id));
      message.success('HOD deleted successfully');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to delete HOD');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && hods.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Dashboard
        </Link>

        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <Title level={3} style={{ marginBottom: 32, color: '#0f172a' }}>Manage HODs</Title>

          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              <Card title={<span style={{ fontWeight: 700, fontSize: 16 }}>Create New HOD</span>} bordered style={{ borderRadius: 12, background: '#f8fafc' }} headStyle={{ borderBottom: '1px solid #e2e8f0' }}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span style={{ fontWeight: 600 }}>Name</span>} name="name" rules={[{ required: true, message: 'Required' }]}>
                        <Input style={{ borderRadius: 8 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span style={{ fontWeight: 600 }}>Email</span>} name="email" rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Invalid' }]}>
                        <Input type="email" style={{ borderRadius: 8 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span style={{ fontWeight: 600 }}>Password</span>} name="password" rules={[{ required: true, message: 'Required' }]}>
                        <Input.Password style={{ borderRadius: 8 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span style={{ fontWeight: 600 }}>MTS Number</span>} name="mtsNumber" rules={[{ required: true, message: 'Required' }]}>
                        <Input style={{ borderRadius: 8 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span style={{ fontWeight: 600 }}>Department</span>} name="department" rules={[{ required: true, message: 'Required' }]}>
                        <Input placeholder="CSE, ECE, IT..." style={{ borderRadius: 8 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span style={{ fontWeight: 600 }}>Designation</span>} name="designation" rules={[{ required: true, message: 'Required' }]}>
                        <Input placeholder="HOD, Professor" style={{ borderRadius: 8 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', fontWeight: 600, borderRadius: 8 }}>
                    {saving ? 'Creating...' : 'Create HOD'}
                  </Button>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Existing HODs ({hods.length})</span>
                    <Button type="default" size="small" icon={<SyncOutlined />} onClick={loadHods} loading={loading} style={{ borderRadius: 6 }}>
                      Refresh
                    </Button>
                  </div>
                } 
                bordered 
                style={{ borderRadius: 12, background: '#f8fafc' }}
                headStyle={{ borderBottom: '1px solid #e2e8f0' }}
              >
                {hods.length === 0 && !loading ? (
                  <Empty description="No HODs found yet." />
                ) : (
                  <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                    {hods.map((hod) => (
                      <Card.Grid 
                        key={hod._id} 
                        style={{ width: '100%', borderRadius: 8, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                        hoverable={false}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
                            {hod.name} <Text type="secondary" style={{ color: '#0ea5e9', fontSize: 12, fontWeight: 700 }}>({hod.department})</Text>
                          </div>
                          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>{hod.email}</Text>
                          <Text type="secondary" style={{ fontSize: 12, marginTop: 2 }}>{hod.mtsNumber} • {hod.designation}</Text>
                        </div>
                        <Popconfirm
                          title="Delete HOD"
                          description="Are you sure you want to delete this HOD?"
                          onConfirm={() => handleDelete(hod._id)}
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger type="primary" size="small" loading={deletingId === hod._id} style={{ borderRadius: 6, fontWeight: 600 }}>
                            Delete
                          </Button>
                        </Popconfirm>
                      </Card.Grid>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}

export default ManageHodsPage;
