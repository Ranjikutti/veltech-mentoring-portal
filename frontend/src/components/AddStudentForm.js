import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from 'api';
import { Form, Input, Button, message, Typography, Divider, Row, Col } from 'antd';

const { Title } = Typography;

function AddStudentForm({ onStudentAdded }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const body = {
        name: values.name?.trim(),
        registerNumber: values.registerNumber?.trim(),
        vmNumber: values.vmNumber?.trim(),
        batch: values.batch?.trim(),
        department: user.department,
        section: values.section?.trim(),
        semester: values.semester?.trim(),
        mentorMtsNumber: values.mentorMtsNumber?.trim(),
        personal: {
          dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : null,
          placeOfBirth: values.placeOfBirth?.trim(),
          motherTongue: values.motherTongue?.trim()
        },
        parents: {
          fatherName: values.fatherName?.trim(),
          fatherQualification: values.fatherQualification?.trim(),
          fatherOccupation: values.fatherOccupation?.trim(),
          motherName: values.motherName?.trim(),
          motherQualification: values.motherQualification?.trim(),
          motherOccupation: values.motherOccupation?.trim()
        },
        addresses: {
          permanent: {
            doorNo: values.permanentDoorNo?.trim(),
            street: values.permanentStreet?.trim(),
            townOrVillage: values.permanentTownOrVillage?.trim(),
            taluk: values.permanentTaluk?.trim(),
            state: values.permanentState?.trim()
          },
          local: {
            doorNo: values.localDoorNo?.trim(),
            street: values.localStreet?.trim(),
            townOrVillage: values.localTownOrVillage?.trim(),
            taluk: values.localTaluk?.trim(),
            state: values.localState?.trim()
          }
        },
        contact: {
          contactNumber: values.contactNumber?.trim(),
          landline: values.landline?.trim(),
          email: values.email?.trim()
        },
        academics: {
          tenth: {
            board: values.tenthBoard?.trim(),
            yearOfPassing: values.tenthYearOfPassing?.trim(),
            english: { secured: Number(values.tenthEnglishSecured) || undefined, max: Number(values.tenthEnglishMax) || undefined },
            mathematics: { secured: Number(values.tenthMathSecured) || undefined, max: Number(values.tenthMathMax) || undefined },
            physics: { secured: Number(values.tenthPhysicsSecured) || undefined, max: Number(values.tenthPhysicsMax) || undefined },
            chemistry: { secured: Number(values.tenthChemistrySecured) || undefined, max: Number(values.tenthChemistryMax) || undefined },
            totalSecured: Number(values.tenthTotalSecured) || undefined,
            totalMax: Number(values.tenthTotalMax) || undefined
          },
          twelfth: {
            board: values.twelfthBoard?.trim(),
            yearOfPassing: values.twelfthYearOfPassing?.trim(),
            english: { secured: Number(values.twelfthEnglishSecured) || undefined, max: Number(values.twelfthEnglishMax) || undefined },
            mathematics: { secured: Number(values.twelfthMathSecured) || undefined, max: Number(values.twelfthMathMax) || undefined },
            physics: { secured: Number(values.twelfthPhysicsSecured) || undefined, max: Number(values.twelfthPhysicsMax) || undefined },
            chemistry: { secured: Number(values.twelfthChemistrySecured) || undefined, max: Number(values.twelfthChemistryMax) || undefined },
            totalSecured: Number(values.twelfthTotalSecured) || undefined,
            totalMax: Number(values.twelfthTotalMax) || undefined
          }
        },
        health: {
          generalHealth: values.generalHealth?.trim(),
          eyeSight: values.eyeSight?.trim(),
          bloodGroup: values.bloodGroup?.trim(),
          otherDeficiency: values.otherDeficiency?.trim(),
          illnessLastThreeYears: values.illnessLastThreeYears?.trim()
        },
        achievements: {
          past: values.achievementsPast?.trim(),
          present: values.achievementsPresent?.trim(),
          features: values.achievementsFeatures?.trim()
        }
      };

      const response = await api.post('/students', body);
      message.success(`Success! Student ${response.data.name} created.`);
      if (onStudentAdded) {
        onStudentAdded(response.data);
      }
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create student.');
    } finally {
      setSaving(false);
    }
  };

  const renderSectionTitle = (title) => (
    <Divider orientation="left" style={{ borderColor: '#cbd5e1', color: '#0f172a', fontWeight: 700, marginTop: 32, marginBottom: 24 }}>
      {title}
    </Divider>
  );

  return (
    <div style={{ padding: '0' }}>
      <Title level={4} style={{ marginBottom: 24, color: '#0f172a' }}>Add New Student</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ batch: '2023-2027' }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}><Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Register Number" name="registerNumber" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="VM Number" name="vmNumber" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Batch" name="batch" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Section" name="section"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Semester" name="semester"><Input /></Form.Item></Col>
          <Col xs={24} sm={24}><Form.Item label="Mentor's MTS Number" name="mentorMtsNumber" rules={[{ required: true }]}><Input /></Form.Item></Col>
        </Row>

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, fontWeight: 600, padding: '0 32px' }}>
            {saving ? 'Creating...' : 'Create Student'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default AddStudentForm;
