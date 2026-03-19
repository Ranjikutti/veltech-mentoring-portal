import React, { useEffect, useState } from 'react';
import api from 'api';
import { Card, Typography, Button, Table, Form, Input, Select, DatePicker, Popconfirm, message, Row, Col, Alert } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CATEGORY_OPTIONS = [
  'Conference', 'Journal Publication', 'Book Publication', 'Patent',
  'Research Proposal', 'Mini Project', 'Workshop', 'Industrial Visit',
  'Inplant Training', 'Culturals', 'Sports'
];

function ActivityLogSection({ studentId }) {
  const [activities, setActivities] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.get(`/activity-logs/${studentId}`, { params });
      setActivities(res.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load activities';
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, semesterFilter, categoryFilter]);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError('');
    try {
      const body = {
        studentId,
        semester: values.semester.trim(),
        date: values.date.format('YYYY-MM-DD'),
        category: values.category,
        title: values.title.trim(),
        notes: values.notes?.trim() || ''
      };
      const res = await api.post('/activity-logs', body);
      message.success('Activity added successfully');
      form.resetFields();
      form.setFieldsValue({ category: 'Conference' });
      setActivities(prev => [...prev, res.data]);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to add activity';
      setError(msg);
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/activity-logs/${id}`);
      setActivities(prev => prev.filter(a => a._id !== id));
      message.success('Activity deleted');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete activity';
      message.error(msg);
    }
  };

  const columns = [
    { title: 'Sem', dataIndex: 'semester', key: 'semester', width: 80 },
    { title: 'Date', dataIndex: 'date', key: 'date', render: text => text ? dayjs(text).format('DD/MM/YYYY') : '-', width: 100 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 150, render: text => <Text code>{text}</Text> },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes' },
    { title: 'By', dataIndex: ['mentorId', 'name'], key: 'mentorId', render: text => text || '-' },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm title="Delete this activity?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
          <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ];

  return (
    <Card 
      bordered={false} 
      title={<Title level={4} style={{ margin: 0 }}>Co / Extra Curricular Activities</Title>}
      style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Track conferences, projects, sports and other achievements by semester.</Text>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Filter by Semester</Text>
          <Input.Search
            placeholder="e.g., Sem 1"
            allowClear
            onSearch={setSemesterFilter}
            style={{ width: 180 }}
            enterButton={<ReloadOutlined />}
            loading={loading}
          />
        </div>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Filter by Category</Text>
          <Select
            allowClear
            placeholder="All Categories"
            style={{ width: 220 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
          >
            {CATEGORY_OPTIONS.map(c => <Option key={c} value={c}>{c}</Option>)}
          </Select>
        </div>
      </div>

      <Card size="small" style={{ background: '#f8fafc', borderRadius: 8, borderColor: '#e2e8f0', marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16, color: '#0f172a' }}>Add Activity</Title>
        
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          initialValues={{ category: 'Conference' }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Semester" name="semester" rules={[{ required: true }]}>
                <Input placeholder="Sem 1 / 1 / I" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Date" name="date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Category" name="category" rules={[{ required: true }]}>
                <Select>
                  {CATEGORY_OPTIONS.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Title / Description" name="title" rules={[{ required: true }]}>
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9' }}>
              Add Activity
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Title level={5} style={{ marginBottom: 16, color: '#0f172a' }}>Logged Activities</Title>
      <Table 
        columns={columns} 
        dataSource={activities} 
        rowKey="_id" 
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
        size="middle"
        locale={{ emptyText: 'No activities recorded yet.' }}
        style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}
      />
    </Card>
  );
}

export default ActivityLogSection;
