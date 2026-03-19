import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from 'api';
import AssessmentForm from '../components/AssessmentForm';
import InterventionForm from '../components/InterventionForm';
import HodMentorSwitch from '../components/HodMentorSwitch';
import AcademicLogSection from '../components/AcademicLogSection';
import ActivityLogSection from '../components/ActivityLogSection';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import { Card, Typography, Button, Spin, Alert, Row, Col, Space, Tag, Modal } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function MenteeDetailsPage() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { studentId } = useParams();
  const { user } = useAuth();

  const [editingAssessment, setEditingAssessment] = useState(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);

  const [editingIntervention, setEditingIntervention] = useState(null);
  const [showInterventionForm, setShowInterventionForm] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const fetchStudentDetails = useCallback(async () => {
    if (!student) setLoading(true);
    try {
      const res = await api.get(`/students/${studentId}/details`);
      setStudent(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch student details.');
      setLoading(false);
    }
  }, [studentId, student]);

  useEffect(() => {
    if (!student) fetchStudentDetails();
  }, [fetchStudentDetails, student]);

  const handleDeleteAssessment = async (assessmentId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this assessment record?',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/assessments/${assessmentId}`);
          toast.success('Assessment deleted successfully');
          fetchStudentDetails();
        } catch (err) {
          const msg = err?.response?.data?.message || 'Failed to delete assessment.';
          toast.error(msg);
        }
      }
    });
  };

  const handleAddNewClick = () => {
    setEditingAssessment(null);
    setShowAssessmentForm(true);
  };

  const handleEditClick = (assessment) => {
    setEditingAssessment(assessment);
    setShowAssessmentForm(true);
  };

  const handleFormSave = () => {
    setShowAssessmentForm(false);
    fetchStudentDetails();
  };

  const handleFormCancel = () => setShowAssessmentForm(false);

  const handleDeleteIntervention = async (interventionId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this intervention log?',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/interventions/${interventionId}`);
          toast.success('Intervention deleted successfully');
          fetchStudentDetails();
        } catch (err) {
          const msg = err?.response?.data?.message || 'Failed to delete intervention.';
          toast.error(msg);
        }
      }
    });
  };

  const handleAddNewInterventionClick = () => {
    setEditingIntervention(null);
    setShowInterventionForm(true);
  };

  const handleEditInterventionClick = (data) => {
    setEditingIntervention(data);
    setShowInterventionForm(true);
  };

  const handleInterventionFormSave = () => {
    setShowInterventionForm(false);
    fetchStudentDetails();
  };

  const handleInterventionFormCancel = () => setShowInterventionForm(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(`/assessments/report/${studentId}`);
      const { studentProfile, mentorName, kpiTotals, finalScores } = response.data;
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(
        'Vel Tech Multi Tech Dr.Rangarajan Dr.Sakunthala Engineering College',
        doc.internal.pageSize.getWidth() / 2,
        15,
        { align: 'center' }
      );
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        '(Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai)',
        doc.internal.pageSize.getWidth() / 2,
        20,
        { align: 'center' }
      );
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(
        'STUDENT MENTORING ASSESSMENT SHEET',
        doc.internal.pageSize.getWidth() / 2,
        30,
        { align: 'center' }
      );

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Department: ${studentProfile.department}`, 14, 40);
      doc.text(`Mentor Name: ${mentorName}`, 14, 45);
      doc.text(`Mentee Name: ${studentProfile.name}`, 14, 50);
      doc.text(`Mentee VM No: ${studentProfile.vmNumber}`, 14, 55);
      doc.text(`Batch: ${studentProfile.batch}`, 100, 55);

      const tableBody = [
        ['1', 'CGPA', studentProfile.latestCgpa, '', '', finalScores.cgpaScore],
        ['2', '% Attendance', `${finalScores.attendanceScore.toFixed(2)}%`, '', '', finalScores.attendanceScore],
        ['3', 'Workshop', kpiTotals.workshop.participated, '', '', ''],
        ['4', 'Seminar', kpiTotals.seminar.participated, '', '', ''],
        [
          '5',
          'Conference',
          `${kpiTotals.conference.participated} (P) / ${kpiTotals.conference.presented} (Pr) / ${kpiTotals.conference.prizesWon} (W)`,
          '', '', ''
        ],
        [
          '6',
          'Symposium',
          `${kpiTotals.symposium.participated} (P) / ${kpiTotals.symposium.presented} (Pr) / ${kpiTotals.symposium.prizesWon} (W)`,
          '', '', ''
        ],
        [
          '7',
          'Professional Body activities',
          `${kpiTotals.profBodyActivities.participated} (P) / ${kpiTotals.profBodyActivities.presented} (Pr) / ${kpiTotals.profBodyActivities.prizesWon} (W)`,
          '', '', ''
        ],
        ['', '', '', '', 'Score', finalScores.coCurricularScore],
        ['8', 'Talks/Lectures', kpiTotals.talksLectures.participated, '', '', ''],
        [
          '9',
          'Project Expo',
          `${kpiTotals.projectExpo.presented} (Pr) / ${kpiTotals.projectExpo.prizesWon} (W)`,
          '', '', ''
        ],
        [
          '10',
          'NPTEL/SWAYAM',
          `${kpiTotals.nptelSwayam.completed} (C) / ${kpiTotals.nptelSwayam.miniprojects} (MP)`,
          '', '', ''
        ],
        [
          '11',
          'Certification Courses',
          `${kpiTotals.otherCertifications.completed} (C) / ${kpiTotals.otherCertifications.miniprojects} (MP)`,
          '', '', ''
        ],
        ['', '', '', '', 'Score', finalScores.certificationScore],
        [
          '12',
          'Culturals',
          `${kpiTotals.culturals.participated} (P) / ${kpiTotals.culturals.prizesWon} (W)`,
          '', '', ''
        ],
        [
          '13',
          'Sports',
          `${kpiTotals.sports.participated} (P) / ${kpiTotals.sports.prizesWon} (W)`,
          '', '', ''
        ],
        ['14', 'NCC', `${kpiTotals.ncc.participated} (P) / ${kpiTotals.ncc.prizesWon} (W)`, '', '', ''],
        ['15', 'NSS', `${kpiTotals.nss.participated} (P) / ${kpiTotals.nss.prizesWon} (W)`, '', '', ''],
        ['', '', '', '', 'Score', finalScores.extraCurricularScore]
      ];

      autoTable(doc, {
        startY: 60,
        head: [['Sl. No', 'KPI', 'Earned / No. of events attended', 'Remarks', 'Average Score', 'Score']],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5, halign: 'center' },
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
          1: { halign: 'left' },
          2: { halign: 'left' }
        },
        didParseCell: data => {
          if (data.cell.raw === 'Score') {
            data.cell.colSpan = 2;
            data.cell.halign = 'right';
            data.cell.fontStyle = 'bold';
          }
        }
      });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const finalY = doc.lastAutoTable.finalY || 200;
      doc.text('Overall Score (out of 50)', 140, finalY + 10);
      doc.text(finalScores.totalScore.toString(), 190, finalY + 10, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('Mentor', 30, finalY + 30);
      doc.text('Head of the Department', 160, finalY + 30);

      doc.save(`Mentoring_Report_${studentProfile.name}.pdf`);
      toast.success('Report downloaded');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to download report.';
      toast.error(msg);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading && !student) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!student || !student.profile) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
        <Card bordered={false} style={{ textAlign: 'center' }}>
          <Text type="secondary">No student data found.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Dashboard
        </Link>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {user?.role === 'hod' && (
             <HodMentorSwitch
              studentId={student.profile._id}
              currentMentorId={student.profile.currentMentor}
              onMentorSwitched={fetchStudentDetails}
            />
          )}

          <Card
            bordered={false}
            title={<Title level={4} style={{ margin: 0 }}>Profile</Title>}
            style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            extra={
              <Space wrap>
                <Link to={`/mentee/${student.profile._id}/edit`}>
                  <Button type="default" icon={<EditOutlined />} style={{ color: '#d97706', borderColor: '#d97706' }}>
                    Edit Profile
                  </Button>
                </Link>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={handleDownloadReport} 
                  loading={isDownloading}
                  style={{ background: '#0ea5e9', borderColor: '#0ea5e9' }}
                >
                  Download Report
                </Button>
              </Space>
            }
          >
            <Title level={2} style={{ marginTop: 0, marginBottom: 16, color: '#0f172a' }}>{student.profile.name}</Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <Text type="secondary" style={{ display: 'block', textTransform: 'uppercase', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>Register No</Text>
                <Text strong style={{ fontSize: 18 }}>{student.profile.registerNumber}</Text>
              </Col>
              <Col xs={24} sm={8}>
                <Text type="secondary" style={{ display: 'block', textTransform: 'uppercase', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>VM No</Text>
                <Text strong style={{ fontSize: 18 }}>{student.profile.vmNumber}</Text>
              </Col>
              <Col xs={24} sm={8}>
                <Text type="secondary" style={{ display: 'block', textTransform: 'uppercase', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>Department</Text>
                <Text strong style={{ fontSize: 18 }}>{student.profile.department}</Text>
              </Col>
            </Row>
          </Card>

          <Card
            bordered={false}
            title={
              <Space>
                <Title level={4} style={{ margin: 0 }}>Assessment Data</Title>
                <Tag color="cyan">Sheet 1</Tag>
              </Space>
            }
            extra={
              !showAssessmentForm && (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNewClick} style={{ background: '#10b981', borderColor: '#10b981' }}>
                  Add New
                </Button>
              )
            }
            style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
          >
            {showAssessmentForm ? (
              <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <AssessmentForm
                  studentId={studentId}
                  assessmentToEdit={editingAssessment}
                  onAssessmentAdded={handleFormSave}
                  onCancel={handleFormCancel}
                />
              </div>
            ) : (
              student.assessments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', border: '2px dashed #e2e8f0', borderRadius: 12 }}>
                  <Text type="secondary">No assessment data found.</Text>
                </div>
              )
            )}

            {!showAssessmentForm && student.assessments.length > 0 && (
              <Space direction="vertical" style={{ width: '100%' }}>
                {student.assessments.map(ass => (
                  <Card key={ass._id} size="small" style={{ background: '#f8fafc', borderRadius: 8, borderColor: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <Title level={5} style={{ margin: 0 }}>{ass.academicYear}</Title>
                        <Text type="secondary">Attendance: <Text strong>{ass.attendancePercent}%</Text></Text>
                      </div>
                      <Space>
                        <Button type="default" icon={<EditOutlined />} onClick={() => handleEditClick(ass)} style={{ color: '#d97706', borderColor: '#d97706' }}>Edit</Button>
                        <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDeleteAssessment(ass._id)}>Delete</Button>
                      </Space>
                    </div>
                  </Card>
                ))}
              </Space>
            )}
          </Card>

          <Card
            bordered={false}
            title={
              <Space>
                <Title level={4} style={{ margin: 0 }}>Intervention Log</Title>
                <Tag color="purple">Sheet 2</Tag>
              </Space>
            }
            extra={
              !showInterventionForm && (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNewInterventionClick} style={{ background: '#10b981', borderColor: '#10b981' }}>
                  Add New
                </Button>
              )
            }
            style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
          >
            {showInterventionForm ? (
              <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <InterventionForm
                  studentId={studentId}
                  interventionToEdit={editingIntervention}
                  onInterventionAdded={handleInterventionFormSave}
                  onCancel={handleInterventionFormCancel}
                />
              </div>
            ) : (
              student.interventions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', border: '2px dashed #e2e8f0', borderRadius: 12 }}>
                  <Text type="secondary">No intervention data found.</Text>
                </div>
              )
            )}

            {!showInterventionForm && student.interventions.length > 0 && (
              <Space direction="vertical" style={{ width: '100%' }}>
                {student.interventions.map(int => (
                  <Card key={int._id} size="small" style={{ background: '#f8fafc', borderRadius: 8, borderColor: '#e2e8f0' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {int.monthYear} <Text type="secondary" style={{ fontSize: 13, color: '#0ea5e9' }}>({int.category})</Text>
                      </Title>
                      <Space>
                        <Button type="default" size="small" icon={<EditOutlined />} onClick={() => handleEditInterventionClick(int)} style={{ color: '#d97706', borderColor: '#d97706' }}>Edit</Button>
                        <Button type="primary" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteIntervention(int._id)}>Delete</Button>
                      </Space>
                    </div>
                    <Text style={{ display: 'block', marginBottom: 4 }}><Text strong>Action:</Text> {int.actionTaken}</Text>
                    <Text style={{ display: 'block' }}><Text strong>Impact:</Text> {int.impact}</Text>
                  </Card>
                ))}
              </Space>
            )}
          </Card>

          <div style={{ marginBottom: 24 }}>
             <AcademicLogSection studentId={studentId} />
          </div>

          <div>
             <ActivityLogSection studentId={studentId} />
          </div>

        </Space>
      </div>
    </div>
  );
}

export default MenteeDetailsPage;
