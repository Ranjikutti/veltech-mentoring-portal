import React, { useState, useEffect } from 'react';
import api from 'api';
import { Form, Input, InputNumber, Button, Row, Col, Typography, message, Divider } from 'antd';

const { Title } = Typography;

const getDefaultFormData = () => ({
  academicYear: '1st Year - Sem 1', cgpa: 0, attendancePercent: 0,
  workshopP: 0, seminarP: 0, conferenceP: 0, conferencePr: 0, conferenceW: 0,
  symposiumP: 0, symposiumPr: 0, symposiumW: 0, profBodyP: 0, profBodyPr: 0, profBodyW: 0,
  talksP: 0, projectExpoPr: 0, projectExpoW: 0, nptelC: 0, nptelMp: 0,
  otherCertC: 0, otherCertMp: 0, culturalsP: 0, culturalsW: 0, sportsP: 0, sportsW: 0,
  nccP: 0, nccW: 0, nssP: 0, nssW: 0,
});

const flattenData = (data) => ({
  academicYear: data.academicYear || '1st Year - Sem 1', cgpa: data.cgpa || 0, attendancePercent: data.attendancePercent || 0,
  workshopP: data.workshop?.participated || 0, seminarP: data.seminar?.participated || 0,
  conferenceP: data.conference?.participated || 0, conferencePr: data.conference?.presented || 0, conferenceW: data.conference?.prizesWon || 0,
  symposiumP: data.symposium?.participated || 0, symposiumPr: data.symposium?.presented || 0, symposiumW: data.symposium?.prizesWon || 0,
  profBodyP: data.profBodyActivities?.participated || 0, profBodyPr: data.profBodyActivities?.presented || 0, profBodyW: data.profBodyActivities?.prizesWon || 0,
  talksP: data.talksLectures?.participated || 0, projectExpoPr: data.projectExpo?.presented || 0, projectExpoW: data.projectExpo?.prizesWon || 0,
  nptelC: data.nptelSwayam?.completed || 0, nptelMp: data.nptelSwayam?.miniprojects || 0,
  otherCertC: data.otherCertifications?.completed || 0, otherCertMp: data.otherCertifications?.miniprojects || 0,
  culturalsP: data.culturals?.participated || 0, culturalsW: data.culturals?.prizesWon || 0,
  sportsP: data.sports?.participated || 0, sportsW: data.sports?.prizesWon || 0,
  nccP: data.ncc?.participated || 0, nccW: data.ncc?.prizesWon || 0,
  nssP: data.nss?.participated || 0, nssW: data.nss?.prizesWon || 0,
});

function AssessmentForm({ studentId, onAssessmentAdded, onCancel, assessmentToEdit = null }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (assessmentToEdit) {
      form.setFieldsValue(flattenData(assessmentToEdit));
    } else {
      form.setFieldsValue(getDefaultFormData());
    }
  }, [assessmentToEdit, form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const body = {
        studentId: studentId,
        academicYear: values.academicYear,
        cgpa: parseFloat(values.cgpa) || 0,
        attendancePercent: parseInt(values.attendancePercent) || 0,
        workshop: { participated: parseInt(values.workshopP) || 0 },
        seminar: { participated: parseInt(values.seminarP) || 0 },
        conference: { participated: parseInt(values.conferenceP) || 0, presented: parseInt(values.conferencePr) || 0, prizesWon: parseInt(values.conferenceW) || 0 },
        symposium: { participated: parseInt(values.symposiumP) || 0, presented: parseInt(values.symposiumPr) || 0, prizesWon: parseInt(values.symposiumW) || 0 },
        profBodyActivities: { participated: parseInt(values.profBodyP) || 0, presented: parseInt(values.profBodyPr) || 0, prizesWon: parseInt(values.profBodyW) || 0 },
        talksLectures: { participated: parseInt(values.talksP) || 0 },
        projectExpo: { presented: parseInt(values.projectExpoPr) || 0, prizesWon: parseInt(values.projectExpoW) || 0 },
        nptelSwayam: { completed: parseInt(values.nptelC) || 0, miniprojects: parseInt(values.nptelMp) || 0 },
        otherCertifications: { completed: parseInt(values.otherCertC) || 0, miniprojects: parseInt(values.otherCertMp) || 0 },
        culturals: { participated: parseInt(values.culturalsP) || 0, prizesWon: parseInt(values.culturalsW) || 0 },
        sports: { participated: parseInt(values.sportsP) || 0, prizesWon: parseInt(values.sportsW) || 0 },
        ncc: { participated: parseInt(values.nccP) || 0, prizesWon: parseInt(values.nccW) || 0 },
        nss: { participated: parseInt(values.nssP) || 0, prizesWon: parseInt(values.nssW) || 0 }
      };

      await api.post('/assessments', body);
      message.success(assessmentToEdit ? 'Success! Assessment updated.' : 'Success! Assessment saved.');
      onAssessmentAdded();
    } catch (err) {
      message.error('Failed to save assessment. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  const renderSectionTitle = (title, subtitle) => (
    <Divider orientation="left" style={{ borderColor: '#cbd5e1', color: '#0f172a', fontWeight: 700 }}>
      {title} {subtitle && <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginLeft: 8 }}>{subtitle}</span>}
    </Divider>
  );

  return (
    <div style={{ padding: 0 }}>
      <Title level={4} style={{ marginBottom: 24, color: '#0f172a' }}>
        {assessmentToEdit ? `Editing: ${assessmentToEdit.academicYear}` : 'Add New Assessment'}
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} sm={8}><Form.Item label="Academic Year" name="academicYear" rules={[{ required: true }]}><Input disabled={!!assessmentToEdit} /></Form.Item></Col>
          <Col xs={12} sm={8}><Form.Item label="CGPA (e.g., 8.7)" name="cgpa"><InputNumber style={{ width: '100%' }} step="0.01" /></Form.Item></Col>
          <Col xs={12} sm={8}><Form.Item label="Attendance (%)" name="attendancePercent"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Co-Curricular (Max 15)', 'P: Participated, Pr: Presented, W: Won')}
        <Row gutter={16}>
          <Col xs={8} sm={4}><Form.Item label="Workshop (P)" name="workshopP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Seminar (P)" name="seminarP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Talks (P)" name="talksP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Conference (P)" name="conferenceP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Conference (Pr)" name="conferencePr"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Conference (W)" name="conferenceW"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Symposium (P)" name="symposiumP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Symposium (Pr)" name="symposiumPr"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Symposium (W)" name="symposiumW"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Prof. Body (P)" name="profBodyP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Prof. Body (Pr)" name="profBodyPr"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Prof. Body (W)" name="profBodyW"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Project Expo (Pr)" name="projectExpoPr"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={4}><Form.Item label="Project Expo (W)" name="projectExpoW"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Certifications (Max 10)', 'C: Completed, MP: Mini-Project')}
        <Row gutter={16}>
          <Col xs={12} sm={6}><Form.Item label="NPTEL/SWAYAM (C)" name="nptelC"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="NPTEL/SWAYAM (MP)" name="nptelMp"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Other Certs (C)" name="otherCertC"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={12} sm={6}><Form.Item label="Other Certs (MP)" name="otherCertMp"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>

        {renderSectionTitle('Extra-Curricular (Max 12)', 'P: Participated, W: Won')}
        <Row gutter={16}>
          <Col xs={8} sm={6}><Form.Item label="Culturals (P)" name="culturalsP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={6}><Form.Item label="Culturals (W)" name="culturalsW"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={6}><Form.Item label="Sports (P)" name="sportsP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={6}><Form.Item label="Sports (W)" name="sportsW"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={6}><Form.Item label="NCC (P)" name="nccP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={6}><Form.Item label="NCC (W)" name="nccW"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={6}><Form.Item label="NSS (P)" name="nssP"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={8} sm={6}><Form.Item label="NSS (W)" name="nssW"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, fontWeight: 600 }}>
              {assessmentToEdit ? 'Update Assessment' : 'Save Assessment'}
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

export default AssessmentForm;