// This file calculates the total score based on the rules.

// Rule 1: CGPA (Max 10)
function calculateCgpaScore(cgpa) {
  if (cgpa >= 8.51) return 10;
  if (cgpa >= 7.51) return 8;
  if (cgpa >= 6.5) return 5;
  return 0;
}

// Rule 2: Attendance (Max 3)
function calculateAttendanceScore(attendance) {
  if (attendance >= 91) return 3;
  if (attendance >= 81) return 2;
  if (attendance >= 75) return 1;
  return 0;
}

// Rule 3: Co-curricular (Max 15)
function calculateCoCurricularScore(data) {
  let score = 0;
  
  // Workshops: 1 point per participation
  score += (data.workshop?.participated || 0) * 1;
  
  // Seminars: 1 point per participation
  score += (data.seminar?.participated || 0) * 1;
  
  // Talks/Lectures: 1 point per participation
  score += (data.talksLectures?.participated || 0) * 1;

  // Conference: P-1, Pr-2, W-3
  score += (data.conference?.participated || 0) * 1;
  score += (data.conference?.presented || 0) * 2;
  score += (data.conference?.prizesWon || 0) * 3;

  // Symposium: P-1, Pr-2, W-3
  score += (data.symposium?.participated || 0) * 1;
  score += (data.symposium?.presented || 0) * 2;
  score += (data.symposium?.prizesWon || 0) * 3;

  // Professional Body Activities: P-1, Pr-2, W-3
  score += (data.profBodyActivities?.participated || 0) * 1;
  score += (data.profBodyActivities?.presented || 0) * 2;
  score += (data.profBodyActivities?.prizesWon || 0) * 3;

  // Project Expo: Pr-2, W-3
  score += (data.projectExpo?.presented || 0) * 2;
  score += (data.projectExpo?.prizesWon || 0) * 3;

  // Return the score, but cap it at 15
  return Math.min(score, 15);
}

// Rule 4: Certification (Max 10)
function calculateCertificationScore(data) {
  let score = 0;
  
  // NPTEL/SWAYAM: C-3, MP-5
  score += (data.nptelSwayam?.completed || 0) * 3;
  score += (data.nptelSwayam?.miniprojects || 0) * 5;

  // Other Certifications: C-3, MP-5
  score += (data.otherCertifications?.completed || 0) * 3;
  score += (data.otherCertifications?.miniprojects || 0) * 5;

  // Return the score, but cap it at 10
  return Math.min(score, 10);
}

// Rule 5: Extra-curricular (Max 12)
function calculateExtraCurricularScore(data) {
  let score = 0;
  
  // Culturals: P-1, W-3
  score += (data.culturals?.participated || 0) * 1;
  score += (data.culturals?.prizesWon || 0) * 3;

  // Sports: P-1, W-3
  score += (data.sports?.participated || 0) * 1;
  score += (data.sports?.prizesWon || 0) * 3;

  // NCC: P-1, W-3
  score += (data.ncc?.participated || 0) * 1;
  score += (data.ncc?.prizesWon || 0) * 3;

  // NSS: P-1, W-3
  score += (data.nss?.participated || 0) * 1;
  score += (data.nss?.prizesWon || 0) * 3;

  // Return the score, but cap it at 12
  return Math.min(score, 12);
}

// --- The Main Function ---
// This function combines everything
function calculateTotalScore(data) {
  const cgpaScore = calculateCgpaScore(data.cgpa || 0);
  const attendanceScore = calculateAttendanceScore(data.attendancePercent || 0);
  const coCurricularScore = calculateCoCurricularScore(data);
  const certificationScore = calculateCertificationScore(data);
  const extraCurricularScore = calculateExtraCurricularScore(data);

  const totalScore = 
    cgpaScore + 
    attendanceScore + 
    coCurricularScore + 
    certificationScore + 
    extraCurricularScore;

  // Return an object with all the details
  return {
    cgpaScore,
    attendanceScore,
    coCurricularScore,
    certificationScore,
    extraCurricularScore,
    // Total score is capped at 50
    totalScore: Math.min(totalScore, 50) 
  };
}

// Export the main function so our routes can use it
module.exports = { calculateTotalScore };