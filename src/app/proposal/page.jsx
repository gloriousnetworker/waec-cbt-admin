'use client';

import { useEffect } from 'react';

export default function ProposalPage() {
  useEffect(() => {
    document.title = 'Proposal – CBT WAEC Simulation Platform | Etinan LGA';
  }, []);

  const handleDownload = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&family=Georgia:ital,wght@0,400;0,700;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #e8e8e8; font-family: 'Times New Roman', Times, serif; }

        .download-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          background: #1a3a5c;
          color: #fff;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .download-bar span { font-size: 14px; font-family: Arial, sans-serif; }
        .download-btn {
          background: #f5a623;
          color: #1a3a5c;
          border: none;
          padding: 10px 28px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          font-family: Arial, sans-serif;
          letter-spacing: 0.5px;
          transition: background 0.2s;
        }
        .download-btn:hover { background: #e09510; }

        .page-wrapper {
          margin-top: 60px;
          padding: 30px 20px 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .doc-page {
          background: #fff;
          width: 210mm;
          min-height: 297mm;
          padding: 25mm 22mm 25mm 22mm;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          margin-bottom: 20px;
          position: relative;
        }

        /* HEADER */
        .doc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px double #1a3a5c;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }
        .logo-area img {
          height: 80px;
          object-fit: contain;
        }
        .org-name {
          text-align: center;
          flex: 1;
          padding: 0 16px;
        }
        .org-name h1 {
          font-size: 15pt;
          color: #1a3a5c;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          line-height: 1.3;
        }
        .org-name p {
          font-size: 9pt;
          color: #555;
          margin-top: 4px;
        }
        .contact-area {
          text-align: right;
          font-size: 8pt;
          color: #444;
          line-height: 1.8;
        }

        /* TITLE BAND */
        .title-band {
          background: #1a3a5c;
          color: #fff;
          text-align: center;
          padding: 10px 16px;
          margin-bottom: 22px;
        }
        .title-band h2 {
          font-size: 12pt;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        /* REF / DATE */
        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 9.5pt;
          margin-bottom: 20px;
          color: #333;
        }

        /* ADDRESSEE */
        .addressee {
          margin-bottom: 18px;
          font-size: 10pt;
          line-height: 1.7;
        }
        .addressee strong { display: block; }

        /* SUBJECT */
        .subject-line {
          font-size: 10.5pt;
          font-weight: bold;
          text-decoration: underline;
          text-align: center;
          margin-bottom: 20px;
          color: #1a3a5c;
          text-transform: uppercase;
        }

        /* BODY */
        .body-text {
          font-size: 10.5pt;
          line-height: 1.85;
          color: #222;
          text-align: justify;
        }
        .body-text p { margin-bottom: 14px; }

        /* SECTIONS */
        .section { margin-bottom: 22px; }
        .section-title {
          font-size: 11pt;
          font-weight: bold;
          color: #1a3a5c;
          text-transform: uppercase;
          border-bottom: 1.5px solid #1a3a5c;
          padding-bottom: 4px;
          margin-bottom: 10px;
          letter-spacing: 0.8px;
        }

        /* BULLET LIST */
        .bullet-list {
          list-style: none;
          padding: 0;
          margin: 0 0 12px 0;
        }
        .bullet-list li {
          font-size: 10.5pt;
          line-height: 1.85;
          color: #222;
          padding-left: 20px;
          position: relative;
          margin-bottom: 6px;
        }
        .bullet-list li::before {
          content: '✦';
          position: absolute;
          left: 0;
          color: #f5a623;
          font-size: 8pt;
          top: 4px;
        }

        /* NUMBERED LIST */
        .numbered-list {
          counter-reset: item;
          list-style: none;
          padding: 0;
          margin: 0 0 12px 0;
        }
        .numbered-list li {
          font-size: 10.5pt;
          line-height: 1.85;
          color: #222;
          padding-left: 24px;
          position: relative;
          margin-bottom: 8px;
          counter-increment: item;
        }
        .numbered-list li::before {
          content: counter(item) '.';
          position: absolute;
          left: 0;
          color: #1a3a5c;
          font-weight: bold;
        }

        /* TABLE */
        .proposal-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 9.5pt;
        }
        .proposal-table th {
          background: #1a3a5c;
          color: #fff;
          padding: 8px 10px;
          text-align: left;
          font-weight: bold;
        }
        .proposal-table td {
          padding: 7px 10px;
          border-bottom: 1px solid #ddd;
          vertical-align: top;
        }
        .proposal-table tr:nth-child(even) td { background: #f5f8fc; }

        /* HIGHLIGHT BOX */
        .highlight-box {
          background: #f0f6ff;
          border-left: 4px solid #1a3a5c;
          padding: 12px 16px;
          margin: 16px 0;
          font-size: 10pt;
          color: #222;
          line-height: 1.7;
        }

        /* KOGI BADGE */
        .kogi-badge {
          background: #1a3a5c;
          color: #fff;
          display: inline-block;
          padding: 3px 10px;
          border-radius: 3px;
          font-size: 8.5pt;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        /* SIGNATURE */
        .signature-section {
          margin-top: 36px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
        }
        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 16px;
        }
        .sig-block { font-size: 9.5pt; line-height: 1.8; color: #333; }
        .sig-block strong { font-size: 10pt; color: #1a3a5c; }
        .sig-line {
          border-bottom: 1px solid #333;
          margin: 28px 0 6px;
          width: 80%;
        }

        /* FOOTER */
        .doc-footer {
          border-top: 2px solid #1a3a5c;
          margin-top: 30px;
          padding-top: 10px;
          text-align: center;
          font-size: 8pt;
          color: #777;
          line-height: 1.6;
        }

        /* PAGE BREAK */
        .page-break { page-break-before: always; }

        /* PRINT RULES */
        @media print {
          body { background: #fff; }
          .download-bar { display: none !important; }
          .page-wrapper { margin-top: 0; padding: 0; }
          .doc-page {
            box-shadow: none;
            margin-bottom: 0;
            padding: 18mm 20mm 18mm 20mm;
            width: 100%;
            min-height: auto;
          }
          .page-break { page-break-before: always; margin: 0; }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      {/* Download bar — hidden on print */}
      <div className="download-bar">
        <span>CBT WAEC Simulation Platform — Proposal for Etinan LGA | Code Pyramid Global</span>
        <button className="download-btn" onClick={handleDownload}>
          ⬇ Download as PDF
        </button>
      </div>

      <div className="page-wrapper">

        {/* ===== PAGE 1 ===== */}
        <div className="doc-page">

          {/* Header */}
          <div className="doc-header">
            <div className="logo-area">
              <img src="/cpg-logo.png" alt="CPG Logo" />
            </div>
            <div className="org-name">
              <h1>Code Pyramid Global</h1>
              <p>Code Pyramid Global · Innovative Educational Technology | CBT Examination Systems</p>
            </div>
            <div className="contact-area">
              <div>Email: iniubongudofot2000@gmail.com</div>
              <div>Platform: einsteincbt.vercel.app</div>
              <div>Admin: einsteinsadmin.vercel.app</div>
            </div>
          </div>

          {/* Title band */}
          <div className="title-band">
            <h2>Formal Proposal for Adoption of CBT WAEC Simulation Platform</h2>
          </div>

          {/* Ref / Date */}
          <div className="meta-row">
            <span><strong>Ref:</strong> CPG/EIT/LGA/2025/001</span>
            <span><strong>Date:</strong> April 14, 2025</span>
          </div>

          {/* Addressee */}
          <div className="addressee">
            <strong>The Chairman,</strong>
            <strong>Etinan Local Government Area Council,</strong>
            <strong>Akwa Ibom State, Nigeria.</strong>
          </div>

          {/* Subject */}
          <div className="subject-line">
            Proposal for the Adoption and Deployment of the Einstein CBT WAEC Simulation Platform
            Across Secondary Schools in Etinan Local Government Area
          </div>

          {/* Opening */}
          <div className="body-text">
            <p>
              Your Excellency, the Chairman, Sir/Ma,
            </p>
            <p>
              It is with great honour and a deep sense of commitment to educational excellence in Akwa Ibom State
              that we, Code Pyramid Global, submit this formal proposal for your esteemed consideration. We
              respectfully request the adoption and full deployment of our <strong>Einstein CBT WAEC Simulation
              Platform</strong> across secondary schools within the Etinan Local Government Area.
            </p>
            <p>
              The West African Senior School Certificate Examination (WASSCE) remains the most pivotal academic
              milestone in the educational journey of Nigerian secondary school students. Despite the critical
              importance of this examination, many students in Etinan LGA are denied the advantage of
              computer-based test (CBT) practice — the very format increasingly adopted by major examination
              bodies including WAEC, NECO, JAMB, and BECE. This proposal presents a sustainable, technology-driven
              solution designed to bridge that gap decisively.
            </p>

            <div className="section">
              <div className="section-title">1. Background and Problem Statement</div>
              <p>
                Secondary school students in Nigeria face a dual challenge: mastering the subject matter of the
                WAEC curriculum while simultaneously adapting to the pressures of computer-based examination
                environments. Research consistently shows that students who are unfamiliar with CBT interfaces
                underperform — not due to a lack of subject knowledge, but due to a lack of digital and
                examination-system literacy.
              </p>
              <p>In Etinan LGA specifically, several compounding challenges exist:</p>
              <ul className="bullet-list">
                <li>Limited access to CBT practice facilities and structured digital examination environments</li>
                <li>Absence of real-time performance analytics for teachers and school administrators</li>
                <li>No centralised platform for monitoring student readiness across multiple schools</li>
                <li>High cost of accessing private CBT centres, making quality preparation inaccessible to many families</li>
                <li>Inconsistent examination preparation standards between urban and rural schools in the LGA</li>
              </ul>
            </div>

            <div className="section">
              <div className="section-title">2. The Einstein CBT WAEC Simulation Platform</div>
              <p>
                The Einstein CBT WAEC Simulation Platform is a fully web-based, mobile-responsive examination
                simulation system built to replicate the exact interface, timing, and format of official WAEC
                computer-based tests. It has been engineered from the ground up for Nigerian secondary schools,
                incorporating all core WAEC subjects and examination regulations.
              </p>

              <div className="highlight-box">
                <strong>Platform URLs:</strong><br />
                Student Portal: <em>einsteincbt.vercel.app</em><br />
                Admin / School Portal: <em>einsteinsadmin.vercel.app</em>
              </div>

              <p><strong>Core Features:</strong></p>
              <ul className="bullet-list">
                <li><strong>Full WAEC Simulation:</strong> Authentic CBT examination environment with strict time control, auto-submission, and real-time countdown timers exactly mirroring the WAEC CBT format</li>
                <li><strong>Multi-Subject Coverage:</strong> English Language, Mathematics, Physics, Chemistry, Biology, Geography, Economics, Government, Literature, Agricultural Science, and more</li>
                <li><strong>School Registration & Management:</strong> Schools register once; administrators manage students, examinations, timetables, and result sheets from a unified dashboard</li>
                <li><strong>Student Identity Verification:</strong> Students log in using their National Identification Number (NIN) or an assigned Login ID, ensuring secure and authentic access</li>
                <li><strong>Real-Time Results & Analytics:</strong> Instant score computation, grade analytics, subject performance breakdowns, and progress tracking for individual students and entire classes</li>
                <li><strong>Examination Security Controls:</strong> Tab-switch detection, auto-submission on timeout, answer encryption, and session persistence for uninterrupted examinations</li>
                <li><strong>PWA Mobile Support:</strong> Works offline on smartphones and tablets — no dedicated computer lab required for basic access</li>
                <li><strong>Admin Exam Controls:</strong> Administrators can schedule, activate, deactivate, extend, and reopen examinations remotely in real time</li>
                <li><strong>Payment Integration:</strong> Optional Paystack-based payment processing for examination fees, registration, or subscription management</li>
              </ul>
            </div>

          </div>

          <div className="doc-footer">
            Code Pyramid Global · Confidential Proposal · Etinan LGA CBT Initiative · Page 1 of 3
          </div>
        </div>

        {/* ===== PAGE 2 ===== */}
        <div className="doc-page page-break">

          <div className="doc-header">
            <div className="logo-area">
              <img src="/cpg-logo.png" alt="CPG Logo" />
            </div>
            <div className="org-name">
              <h1>Code Pyramid Global</h1>
              <p>CBT WAEC Simulation Platform — Etinan LGA Proposal</p>
            </div>
            <div className="contact-area">
              <div>Ref: CPG/EIT/LGA/2025/001</div>
              <div>April 14, 2025</div>
            </div>
          </div>

          <div className="body-text">

            <div className="section">
              <div className="section-title">3. Precedent: Successful Deployment in Kogi State</div>
              <div style={{ marginBottom: '10px' }}>
                <span className="kogi-badge">LIVE DEPLOYMENT · KOGI STATE, NIGERIA</span>
              </div>
              <p>
                The Einstein CBT Simulation Platform is not a theoretical product — it is a battle-tested, live
                deployment with a proven track record. The platform has been successfully deployed and is
                actively in use in <strong>Kogi State, Nigeria</strong>, where it has demonstrated remarkable
                outcomes in improving WAEC CBT readiness among secondary school students.
              </p>
              <p>Key outcomes from the Kogi State deployment include:</p>
              <ul className="bullet-list">
                <li>Successful onboarding of multiple secondary schools under a single administrative portal</li>
                <li>Thousands of student examinations conducted without system downtime</li>
                <li>Measurable improvement in students' CBT examination confidence and completion rates</li>
                <li>Real-time result generation allowing teachers to identify and address performance gaps promptly</li>
                <li>Zero data loss — all student records, examination results, and school data are securely stored on cloud infrastructure</li>
                <li>Seamless mobile accessibility: students with smartphones could participate without dedicated computers</li>
              </ul>
              <p>
                The Kogi State experience validates the platform's stability, scalability, and fitness for
                deployment across an entire Local Government Area. Etinan LGA would benefit directly from
                every improvement and lesson learned in that deployment.
              </p>
            </div>

            <div className="section">
              <div className="section-title">4. Proposed Implementation Plan for Etinan LGA</div>
              <p>
                We propose a phased deployment model designed to maximise impact while minimising disruption
                to existing school operations:
              </p>

              <table className="proposal-table">
                <thead>
                  <tr>
                    <th>Phase</th>
                    <th>Activity</th>
                    <th>Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Phase 1</strong><br />Assessment</td>
                    <td>School census, device audit, internet connectivity mapping across Etinan LGA secondary schools</td>
                    <td>Weeks 1 – 2</td>
                  </tr>
                  <tr>
                    <td><strong>Phase 2</strong><br />Onboarding</td>
                    <td>Registration of all participating schools; creation of admin accounts; bulk student registration via NIN or assigned Login IDs</td>
                    <td>Weeks 3 – 4</td>
                  </tr>
                  <tr>
                    <td><strong>Phase 3</strong><br />Training</td>
                    <td>Hands-on teacher and school administrator training sessions; student orientation workshops; help documentation distributed</td>
                    <td>Weeks 5 – 6</td>
                  </tr>
                  <tr>
                    <td><strong>Phase 4</strong><br />Pilot Exams</td>
                    <td>First round of simulated WAEC examinations across pilot schools; performance analytics reviewed with teachers</td>
                    <td>Weeks 7 – 9</td>
                  </tr>
                  <tr>
                    <td><strong>Phase 5</strong><br />Full Rollout</td>
                    <td>Expansion to all Etinan LGA secondary schools; monthly examination cycles established; centralised result reporting to LGA Council</td>
                    <td>Month 3 onward</td>
                  </tr>
                  <tr>
                    <td><strong>Ongoing</strong><br />Support</td>
                    <td>Dedicated technical support, platform updates, quarterly review meetings with LGA education stakeholders</td>
                    <td>Continuous</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="section">
              <div className="section-title">5. Infrastructure Requirements</div>
              <p>
                The Einstein CBT Platform is deliberately designed to work with minimal infrastructure.
                We do not require the LGA to build expensive dedicated CBT centres before deployment can begin:
              </p>
              <ul className="bullet-list">
                <li><strong>Internet Connectivity:</strong> A basic mobile data or Wi-Fi connection (minimum 1 Mbps) per examination session is sufficient; the platform's PWA offline capability reduces dependency on constant connectivity</li>
                <li><strong>Devices:</strong> Any smartphone, tablet, laptop, or desktop computer with a modern web browser (Chrome, Firefox, Safari) can run the platform — no software installation required</li>
                <li><strong>Computer Labs:</strong> Existing school computer labs can be immediately leveraged; where computer labs are absent, smartphone-based sessions are fully supported</li>
                <li><strong>Server Infrastructure:</strong> All server infrastructure is cloud-hosted and fully managed by Code Pyramid Global — the LGA bears no hosting or server maintenance cost</li>
                <li><strong>Electricity:</strong> Device battery life is sufficient for most sessions; minimal power infrastructure needed compared to traditional CBT centre setups</li>
              </ul>
            </div>

            <div className="section">
              <div className="section-title">6. Benefits to Etinan LGA and Akwa Ibom State</div>
              <ul className="numbered-list">
                <li><strong>Improved WAEC Performance:</strong> Students who practice in a realistic CBT environment consistently demonstrate higher scores in the actual WAEC examination</li>
                <li><strong>Educational Equity:</strong> Every student across Etinan LGA, regardless of socioeconomic background, gains free or affordable access to quality CBT preparation</li>
                <li><strong>Digital Literacy:</strong> Regular exposure to the platform builds foundational computer skills that are essential in today's knowledge economy</li>
                <li><strong>Administrative Visibility:</strong> The LGA Council and education officers gain real-time visibility into school performance data, enabling evidence-based policy decisions</li>
                <li><strong>Teacher Empowerment:</strong> Teachers receive instant analytics identifying which students struggle with which topics, enabling targeted teaching interventions</li>
                <li><strong>Reduced Examination Malpractice:</strong> Structured, timed, and monitored digital examinations reduce the opportunity for malpractice that plagues manual examination processes</li>
                <li><strong>Cost Efficiency:</strong> The cloud-based model eliminates the need for LGA investment in dedicated CBT centre construction and maintenance</li>
                <li><strong>Precedent for Akwa Ibom State:</strong> A successful Etinan LGA deployment would position the council as a pioneer in technology-driven education in Akwa Ibom State, attracting further state and federal investment</li>
              </ul>
            </div>

          </div>

          <div className="doc-footer">
            Code Pyramid Global · Confidential Proposal · Etinan LGA CBT Initiative · Page 2 of 3
          </div>
        </div>

        {/* ===== PAGE 3 ===== */}
        <div className="doc-page page-break">

          <div className="doc-header">
            <div className="logo-area">
              <img src="/cpg-logo.png" alt="CPG Logo" />
            </div>
            <div className="org-name">
              <h1>Code Pyramid Global</h1>
              <p>CBT WAEC Simulation Platform — Etinan LGA Proposal</p>
            </div>
            <div className="contact-area">
              <div>Ref: CPG/EIT/LGA/2025/001</div>
              <div>April 14, 2025</div>
            </div>
          </div>

          <div className="body-text">

            <div className="section">
              <div className="section-title">7. Pricing and Partnership Models</div>
              <p>
                Code Pyramid Global offers flexible partnership models tailored to the financial realities of
                Local Government Area education budgets. We are open to the following arrangements:
              </p>
              <table className="proposal-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Description</th>
                    <th>Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>LGA Subscription</strong></td>
                    <td>Single annual fee covers all schools and unlimited student registrations within Etinan LGA</td>
                    <td>Full LGA-wide deployment</td>
                  </tr>
                  <tr>
                    <td><strong>Per-School Licensing</strong></td>
                    <td>Individual school subscription; each school manages its own student pool and examination calendar</td>
                    <td>Phased school-by-school rollout</td>
                  </tr>
                  <tr>
                    <td><strong>Student Subscription</strong></td>
                    <td>Per-student annual or termly fee collected via the platform's Paystack integration; minimal cost to the LGA</td>
                    <td>Self-sustaining model</td>
                  </tr>
                  <tr>
                    <td><strong>Government Grant Model</strong></td>
                    <td>Platform provided free to students; costs covered by LGA council allocation or state education grants</td>
                    <td>Maximum accessibility</td>
                  </tr>
                </tbody>
              </table>
              <p>
                We are committed to arriving at a mutually agreeable pricing structure during formal discussions.
                All models include full platform access, technical support, training, and regular updates at
                no additional charge.
              </p>
            </div>

            <div className="section">
              <div className="section-title">8. Security, Privacy, and Data Protection</div>
              <p>
                All student data is handled in strict compliance with Nigerian data protection principles and
                best-practice cloud security standards:
              </p>
              <ul className="bullet-list">
                <li>All data is encrypted in transit (HTTPS/TLS) and at rest within Google Firebase cloud infrastructure</li>
                <li>Student NIN and personal data are stored securely; no third-party data sharing occurs</li>
                <li>Role-based access control ensures that school admins only access their own school's data</li>
                <li>Automated session management prevents unauthorised access to ongoing examinations</li>
                <li>Regular platform security audits and updates are conducted by the Code Pyramid Global engineering team</li>
              </ul>
            </div>

            <div className="section">
              <div className="section-title">9. Our Commitment to Etinan LGA</div>
              <p>
                Code Pyramid Global is not merely a software vendor — we are an educational technology partner
                with a vested interest in the academic success of every secondary school student in Etinan
                Local Government Area. We commit to:
              </p>
              <ul className="bullet-list">
                <li>Dedicated on-site onboarding support during the initial deployment phase</li>
                <li>24/7 technical support via email and phone during examination periods</li>
                <li>Quarterly performance reports presented to the LGA Education Committee</li>
                <li>Free platform upgrades and new subject additions throughout the partnership</li>
                <li>Customisation of the platform to reflect Etinan LGA branding if required</li>
              </ul>
            </div>

            <div className="section">
              <div className="section-title">10. Conclusion and Call to Action</div>
              <p>
                Your Excellency, the moment to invest in the digital future of Etinan LGA students is now.
                The WAEC examination will not wait; the competitive landscape of university admissions will
                not wait. Every year that students sit for WAEC without adequate CBT preparation is a year
                of missed potential — potential that this platform is engineered to unlock.
              </p>
              <p>
                We respectfully urge the Etinan Local Government Area Council to seize this opportunity to
                place Etinan on the map as a leader in educational technology adoption in Akwa Ibom State.
                The precedent set in Kogi State confirms that this is achievable, scalable, and impactful.
              </p>
              <div className="highlight-box">
                We welcome an audience with Your Excellency and the Council to present a live demonstration of the
                Einstein CBT WAEC Simulation Platform and to discuss a formalised partnership agreement.
                Please reach us at <strong>iniubongudofot2000@gmail.com</strong> to schedule a demonstration
                at your earliest convenience.
              </div>
              <p>
                We thank you most sincerely for your time and for your tireless commitment to the educational
                advancement of the people of Etinan Local Government Area. We look forward to a partnership
                that will transform the examination outcomes of thousands of Etinan students for years to come.
              </p>
              <p>
                Yours faithfully,
              </p>
            </div>

            {/* Signature */}
            <div className="signature-section">
              <div className="signature-grid">
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <strong>Iniubong Udofot</strong><br />
                  Founder &amp; Lead Developer<br />
                  Code Pyramid Global<br />
                  Email: iniubongudofot2000@gmail.com<br />
                  Date: ________________
                </div>
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <strong>Authorised Representative</strong><br />
                  Code Pyramid Global<br />
                  Date: ________________
                </div>
              </div>
            </div>

          </div>

          <div className="doc-footer">
            Code Pyramid Global · Confidential Proposal · Etinan LGA CBT Initiative · Page 3 of 3<br />
            <em>This proposal is confidential and intended solely for the addressee named herein.</em>
          </div>
        </div>

      </div>
    </>
  );
}
