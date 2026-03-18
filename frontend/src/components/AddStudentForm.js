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

        {renderSectionTitle('Personal Details')}
        <Row gutter={16}>
          <Col xs={24} sm={8}><Form.Item label="Date of Birth" name="dateOfBirth"><Input type="date" /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Place of Birth" name="placeOfBirth"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Mother Tongue" name="motherTongue"><Input /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Parents')}
        <Row gutter={16}>
          <Col xs={24} sm={8}><Form.Item label="Father Name" name="fatherName"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Father Qualification" name="fatherQualification"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Father Occupation" name="fatherOccupation"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Mother Name" name="motherName"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Mother Qualification" name="motherQualification"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Mother Occupation" name="motherOccupation"><Input /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Permanent Address')}
        <Row gutter={16}>
          <Col xs={24} sm={8}><Form.Item label="Door No" name="permanentDoorNo"><Input /></Form.Item></Col>
          <Col xs={24} sm={16}><Form.Item label="Street" name="permanentStreet"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Town/Village" name="permanentTownOrVillage"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Taluk" name="permanentTaluk"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="State" name="permanentState"><Input /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Local Address')}
        <Row gutter={16}>
          <Col xs={24} sm={8}><Form.Item label="Door No" name="localDoorNo"><Input /></Form.Item></Col>
          <Col xs={24} sm={16}><Form.Item label="Street" name="localStreet"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Town/Village" name="localTownOrVillage"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Taluk" name="localTaluk"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="State" name="localState"><Input /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Contact & Health')}
        <Row gutter={16}>
          <Col xs={24} sm={8}><Form.Item label="Contact Number" name="contactNumber"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Landline" name="landline"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Email" name="email"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="General Health" name="generalHealth"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Eye Sight" name="eyeSight"><Input /></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Blood Group" name="bloodGroup"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Other Deficiency" name="otherDeficiency"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Illness (Last 3 Years)" name="illnessLastThreeYears"><Input /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Academics – 10th')}
        <Row gutter={16}>
          <Col xs={24} sm={12}><Form.Item label="Board" name="tenthBoard"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Year of Passing" name="tenthYearOfPassing"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="English (Secured)" name="tenthEnglishSecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="English (Max)" name="tenthEnglishMax"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Maths (Secured)" name="tenthMathSecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Maths (Max)" name="tenthMathMax"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Physics (Secured)" name="tenthPhysicsSecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Physics (Max)" name="tenthPhysicsMax"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Chemistry (Secured)" name="tenthChemistrySecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Chemistry (Max)" name="tenthChemistryMax"><Input /></Form.Item></Col>
          <Col xs={12} sm={12}><Form.Item label="Total Secured" name="tenthTotalSecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={12}><Form.Item label="Total Max" name="tenthTotalMax"><Input /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Academics – 12th')}
        <Row gutter={16}>
          <Col xs={24} sm={12}><Form.Item label="Board" name="twelfthBoard"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Year of Passing" name="twelfthYearOfPassing"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="English (Secured)" name="twelfthEnglishSecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="English (Max)" name="twelfthEnglishMax"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Maths (Secured)" name="twelfthMathSecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Maths (Max)" name="twelfthMathMax"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Physics (Secured)" name="twelfthPhysicsSecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Physics (Max)" name="twelfthPhysicsMax"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Chemistry (Secured)" name="twelfthChemistrySecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Chemistry (Max)" name="twelfthChemistryMax"><Input /></Form.Item></Col>
          <Col xs={12} sm={12}><Form.Item label="Total Secured" name="twelfthTotalSecured"><Input /></Form.Item></Col>
          <Col xs={12} sm={12}><Form.Item label="Total Max" name="twelfthTotalMax"><Input /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Achievements')}
        <Row gutter={16}>
          <Col xs={24} sm={8}><Form.Item label="Past" name="achievementsPast"><Input.TextArea rows={3}/></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Present" name="achievementsPresent"><Input.TextArea rows={3}/></Form.Item></Col>
          <Col xs={24} sm={8}><Form.Item label="Features" name="achievementsFeatures"><Input.TextArea rows={3}/></Form.Item></Col>
        </Row>

        <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, fontWeight: 600, padding: '0 32px' }}>
            {saving ? 'Adding...' : 'Add Student'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default AddStudentForm;
