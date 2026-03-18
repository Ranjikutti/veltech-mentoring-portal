import React, { useState, useEffect } from 'react';
import api from 'api';
import { Link } from 'react-router-dom';
import { Card, Typography, Spin, Empty, List, message } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function PerformanceReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get('/assessments/mentor/performance');
        setReportData(response.data);
        setLoading(false);
      } catch (err) {
        message.error('Failed to fetch performance report.');
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Dashboard
        </Link>

        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0, color: '#0f172a' }}>Mentees Performance Report</Title>
            <Text type="secondary">Students are ranked by total score from their latest assessment.</Text>
          </div>

          {reportData.length === 0 ? (
            <Empty description="No performance data found for any mentees." style={{ margin: '40px 0' }} />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={reportData}
              renderItem={(student, index) => (
                <List.Item
                  style={{
                    background: index === 0 ? '#eff6ff' : index === 1 ? '#f8fafc' : index === 2 ? '#fdf8f6' : '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    marginBottom: 16,
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        width: 48, height: 48, borderRadius: '50%', background: index < 3 ? '#0ea5e9' : '#e2e8f0', 
                        color: index < 3 ? '#fff' : '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: 20, fontWeight: 'bold'
                      }}>
                        {index === 0 ? <TrophyOutlined style={{ color: '#fbbf24', fontSize: 24 }}/> : index === 1 ? <TrophyOutlined style={{ color: '#94a3b8', fontSize: 24 }}/> : index === 2 ? <TrophyOutlined style={{ color: '#b45309', fontSize: 24 }}/> : `#${index + 1}`}
                      </div>
                    }
                    title={<Title level={4} style={{ margin: 0, color: '#0f172a' }}>{student.name}</Title>}
                    description={<Text type="secondary">Reg No: {student.registerNumber} | Latest: <span style={{fontWeight: 600, color: '#334155'}}>{student.academicYear}</span></Text>}
                    style={{ margin: 0 }}
                  />
                  <div style={{ textAlign: 'center', padding: '8px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minWidth: 80 }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#0ea5e9', lineHeight: 1 }}>{student.totalScore}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 }}>Total Score</div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

export default PerformanceReportPage;