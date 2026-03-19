import React, { useState, useEffect } from 'react';
import api from 'api';
import { Form, Input, Button, Select, Typography, message } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

function InterventionForm({ studentId, onInterventionAdded, onCancel, interventionToEdit = null }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (interventionToEdit) {
      form.setFieldsValue(interventionToEdit);
    } else {
      form.setFieldsValue({
        monthYear: 'Nov 2025',
        category: 'Slow learner',
        actionTaken: '',
        impact: ''
      });
    }
  }, [interventionToEdit, form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const body = { ...values, studentId };
      if (interventionToEdit) {
        await api.put(`/interventions/${interventionToEdit._id}`, body);
        message.success('Success! Intervention log updated.');
      } else {
        await api.post('/interventions', body);
        message.success('Success! Intervention log saved.');
      }
      onInterventionAdded();
      if (!interventionToEdit) {
        form.resetFields();
      }
    } catch (err) {
      message.error('Failed to save intervention.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <Title level={4} style={{ marginBottom: 24, color: '#0f172a' }}>
        {interventionToEdit ? 'Edit Intervention' : 'Add Intervention (Sheet 2)'}
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Month/Year" name="monthYear" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Category" name="category" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Slow learner">Slow learner</Select.Option>
                <Select.Option value="Fast learner">Fast learner</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="Action Taken" name="actionTaken" rules={[{ required: true }]}>
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Impact" name="impact" rules={[{ required: true }]}>
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, fontWeight: 600 }}>
              {interventionToEdit ? 'Update Log' : 'Save Intervention'}
            </Button>
            <Button type="default" onClick={onCancel} style={{ borderRadius: 8, fontWeight: 500 }}>
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

export default InterventionForm;