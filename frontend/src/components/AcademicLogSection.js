import React, { useEffect, useState } from 'react';
import api from 'api';
import { Card, Typography, Button, Table, Form, Input, Select, DatePicker, Space, Popconfirm, message, Row, Col, Alert } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function AcademicLogSection({ studentId }) {
  const [logs, setLogs] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      const res = await api.get(`/academic-logs/${studentId}`, { params });
      setLogs(res.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load academic logs';
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, semesterFilter]);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError('');
    try {
      const body = {
        studentId,
        semester: values.semester.trim(),
        date: values.date.format('YYYY-MM-DD'),
        type: values.type,
        problemIdentification: values.problemIdentification.trim(),
        problemDetails: values.problemDetails?.trim() || '',
        remedialAction: values.remedialAction?.trim() || '',
        improvementProgress: values.improvementProgress?.trim() || ''
      };
      const res = await api.post('/academic-logs', body);
      message.success('Academic log added successfully');
      form.resetFields();
      setLogs(prev => [...prev, res.data]);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to add academic log';
      setError(msg);
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/academic-logs/${id}`);
      setLogs(prev => prev.filter(log => log._id !== id));
      message.success('Academic log deleted');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete log';
      message.error(msg);
    }
  };

  const columns = [
    { title: 'Sem', dataIndex: 'semester', key: 'semester', width: 80 },
    { title: 'Date', dataIndex: 'date', key: 'date', render: text => text ? dayjs(text).format('DD/MM/YYYY') : '-', width: 100 },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 80, render: text => <Text strong color={text === 'AP' ? 'blue' : 'purple'}>{text}</Text> },
    { title: 'Problem', dataIndex: 'problemIdentification', key: 'problemIdentification' },
    { title: 'Remedial Action', dataIndex: 'remedialAction', key: 'remedialAction' },
    { title: 'Progress', dataIndex: 'improvementProgress', key: 'improvementProgress' },
    { title: 'By', dataIndex: ['mentorId', 'name'], key: 'mentorId', render: text => text || '-' },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm title="Delete this academic log?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
          <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ];

  return (
    <Card 
      bordered={false} 
      title={<Title level={4} style={{ margin: 0 }}>Academic / Personal Problems Log</Title>}
      style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Record AP/PP issues, actions taken and progress for each semester.</Text>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Filter by Semester</Text>
          <Input.Search
            placeholder="e.g., Sem 1, 1, I"
            allowClear
            onSearch={setSemesterFilter}
            style={{ width: 200 }}
            enterButton={<ReloadOutlined />}
            loading={loading}
          />
        </div>
      </div>

      <Card size="small" style={{ background: '#f8fafc', borderRadius: 8, borderColor: '#e2e8f0', marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16, color: '#0f172a' }}>Add Entry</Title>
        
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          initialValues={{ type: 'AP' }}
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
              <Form.Item label="Type" name="type" rules={[{ required: true }]}>
                <Select>
                  <Option value="AP">Academic Problem (AP)</Option>
                  <Option value="PP">Personal Problem (PP)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
             <Col xs={24} sm={12}>
              <Form.Item label="Problem Identification" name="problemIdentification" rules={[{ required: true }]}>
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Problem Details" name="problemDetails">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Remedial Action" name="remedialAction">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Improvement / Progress" name="improvementProgress">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9' }}>
              Add Log
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Title level={5} style={{ marginBottom: 16, color: '#0f172a' }}>Logged Entries</Title>
      <Table 
        columns={columns} 
        dataSource={logs} 
        rowKey="_id" 
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
        size="middle"
        locale={{ emptyText: 'No entries yet for this student.' }}
        style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}
      />
    </Card>
  );
}

export default AcademicLogSection;
