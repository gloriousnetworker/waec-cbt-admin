// ─────────────────────────────────────────────────────────────────────────────
// Einstein's CBT App — Admin Panel Style Constants
// Single source of truth for all Tailwind class strings.
// Primary: #1F2A49 (brand-primary navy) | Body font: Inter | Headings: Playfair
// ─────────────────────────────────────────────────────────────────────────────

// ─── General Form / Registration ─────────────────────────────────────────────
export const mainContainer =
  'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-surface-muted';
export const headingContainer = 'relative w-full flex flex-col items-center mb-2';
export const backArrow =
  'absolute left-4 top-0 text-brand-primary cursor-pointer z-10';
export const pageTitle =
  'mb-4 font-bold text-4xl tracking-tight text-brand-primary text-center font-playfair';
export const progressContainer =
  'w-full max-w-md flex items-center justify-between mb-6';
export const progressBarWrapper =
  'flex-1 h-1 bg-brand-primary-lt rounded-full mr-4';
export const progressBarActive =
  'h-1 bg-brand-primary rounded-full';
export const progressStepText =
  'text-sm font-medium text-content-muted';
export const formWrapper =
  'w-full max-w-md space-y-6';
export const labelClass =
  'block mb-2 text-sm font-medium text-content-primary';
export const selectClass =
  'w-full rounded-lg border border-border px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-content-secondary transition-all';
export const inputClass =
  'w-full rounded-lg border border-border px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-content-primary transition-all';
export const fileInputWrapper =
  'relative flex-1 border border-border rounded-lg px-3 py-3 text-sm text-content-muted bg-surface-muted focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-primary cursor-pointer';
export const noteText =
  'mt-2 text-xs font-normal italic text-content-muted';
export const rowWrapper = 'flex space-x-4';
export const halfWidth = 'w-1/2';
export const grayPlaceholder = 'bg-surface-subtle';
export const buttonPrimary =
  'w-full rounded-lg bg-brand-primary text-white font-semibold py-3 hover:bg-brand-primary-dk focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all min-h-[44px]';
export const spinnerOverlay =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/20';
export const spinner =
  'h-12 w-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin';
export const termsTextContainer =
  'mt-6 text-center text-xs font-bold underline text-content-primary';
export const uploadHeading =
  'block mb-2 text-sm font-medium text-content-primary';
export const uploadFieldWrapper = 'flex items-center space-x-3';
export const uploadInputLabel =
  'relative flex-1 border border-border rounded-lg px-3 py-3 text-sm text-content-muted bg-surface-muted focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-primary cursor-pointer';
export const uploadIconContainer =
  'absolute right-3 top-1/2 -translate-y-1/2 text-content-muted';
export const uploadButtonStyle =
  'px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all';
export const uploadNoteStyle =
  'mt-2 text-xs font-normal italic text-content-muted';

// ─── Splash Screen ────────────────────────────────────────────────────────────
export const splashContainer =
  'fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden';
export const splashContent =
  'text-center px-6 w-full max-w-md';
export const splashLogo =
  'text-[64px] font-bold tracking-tight text-brand-primary mb-8 font-playfair';
export const splashTitle =
  'text-3xl font-semibold tracking-tight text-content-primary mb-3 font-playfair';
export const splashSubtitle =
  'text-base font-normal text-content-secondary mb-12';
export const splashProgressBar =
  'w-full h-1 bg-brand-primary-lt rounded-full overflow-hidden mb-3';
export const splashProgressFill =
  'h-full bg-brand-primary transition-all duration-300 ease-out';
export const splashProgressText =
  'text-sm font-medium text-content-muted';
export const splashDots =
  'flex justify-center space-x-2 mt-8';
export const splashDot =
  'w-2 h-2 bg-brand-primary rounded-full';

// ─── Login Page ───────────────────────────────────────────────────────────────
// (These are the legacy light-mode login styles — kept for reference.
//  The actual login page is now the full dark-navy redesign in login/page.jsx)
export const loginContainer =
  'fixed inset-0 flex items-center justify-center overflow-hidden';
export const loginContent =
  'w-full max-w-sm px-6 py-8 relative z-10';
export const loginLogo =
  'text-[56px] font-bold tracking-tight text-white text-center mb-2 font-playfair';
export const loginTitle =
  'text-2xl font-semibold tracking-tight text-white text-center mb-2 font-playfair';
export const loginSubtitle =
  'text-sm font-normal text-white/60 text-center mb-8';
export const loginForm = 'space-y-5 mb-6';
export const loginLabel =
  'block mb-2 text-xs font-medium text-white/75';
export const loginInput =
  'w-full px-0 py-3 border-b border-white/25 text-sm font-medium text-white bg-transparent placeholder-white/25 focus:outline-none focus:border-white/80 transition-colors';
export const loginPasswordWrapper = 'relative';
export const loginPasswordToggle =
  'absolute right-0 top-1/2 -translate-y-1/2 text-white/50 cursor-pointer hover:text-white transition-colors text-lg';
export const loginRememberRow =
  'flex items-center justify-between mb-6';
export const loginCheckboxLabel =
  'flex items-center gap-2 cursor-pointer';
export const loginCheckbox =
  'w-4 h-4 border-2 border-white/30 rounded cursor-pointer accent-white';
export const loginCheckboxText =
  'text-xs font-normal text-white/70';
export const loginForgotPassword =
  'text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer';
export const loginButton =
  'w-full py-3 bg-white text-brand-primary text-sm font-bold tracking-tight rounded-lg hover:bg-brand-primary-lt focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-primary transition-all min-h-[44px]';
export const loginDivider = 'flex items-center my-6';
export const loginDividerLine =
  'flex-1 h-px bg-white/15';
export const loginDividerText =
  'px-4 text-xs font-medium text-white/40';
export const loginDemoSection = 'space-y-3';
export const loginDemoTitle =
  'text-sm font-semibold tracking-tight text-white mb-3';
export const loginDemoButton =
  'w-full px-4 py-3 border border-white/15 text-left rounded-lg hover:bg-white/8 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
export const loginDemoEmail =
  'text-xs font-medium text-white mb-1';
export const loginDemoPassword =
  'text-xs font-normal text-white/60';
export const loginDemoArrow = 'text-white/50 text-lg';
export const loginNote =
  'mt-6 px-4 py-3 bg-white/8 border border-white/12 rounded-lg';
export const loginNoteText =
  'text-xs font-normal text-white/70';
export const loginFeatures =
  'mt-8 grid grid-cols-2 gap-3';
export const loginFeatureItem =
  'text-center py-3 px-2 rounded-lg';
export const loginFeatureIcon = 'text-2xl mb-1';
export const loginFeatureText =
  'text-xs font-medium text-white/70';

// ─── Loading Spinner (inline) ─────────────────────────────────────────────────
export const loadingSpinner = 'inline-flex items-center justify-center';
export const loadingSpinnerSvg = 'animate-spin h-5 w-5 text-white';
export const loadingText = 'ml-2 text-sm font-semibold';

// ─── Dashboard Shell ──────────────────────────────────────────────────────────
export const dashboardContainer =
  'min-h-screen bg-surface-muted flex flex-col';
export const dashboardMain = 'flex flex-1';
export const dashboardContent =
  'flex-1 bg-surface-muted';
export const dashboardInner = 'p-4 md:p-6 pb-safe';
export const dashboardLoading =
  'fixed inset-0 z-50 flex items-center justify-center bg-white';
export const dashboardLoadingInner = 'text-center';
export const dashboardLoadingSpinner =
  'w-14 h-14 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4';
export const dashboardLoadingText =
  'text-sm font-medium text-content-muted font-inter';

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const navbarContainer =
  'sticky top-0 z-50 bg-white border-b border-border shadow-card pt-safe';
export const navbarInner = 'px-4 sm:px-6 lg:px-8';
export const navbarContent =
  'flex items-center justify-between h-16';
export const navbarLeft = 'flex items-center';
export const navbarMenuButton =
  'p-2 text-content-muted hover:text-brand-primary hover:bg-brand-primary-lt rounded-lg transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center';
export const navbarLogo =
  'flex items-center ml-3';
export const navbarLogoImage = 'w-9 h-9 mr-3 flex-shrink-0';
export const navbarLogoText =
  'text-sm sm:text-base font-bold tracking-tight text-brand-primary leading-none truncate max-w-[140px] sm:max-w-none';
export const navbarLogoSubtext =
  'hidden sm:block text-xs font-normal text-content-muted mt-0.5';
export const navbarNav =
  'hidden 2xl:flex items-center space-x-1';
export const navbarNavButton =
  'px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center min-h-[44px]';
export const navbarNavButtonActive =
  'bg-brand-primary text-white shadow-brand';
export const navbarNavButtonInactive =
  'text-content-secondary hover:bg-brand-primary-lt hover:text-brand-primary';
export const navbarRight =
  'flex items-center space-x-2';
export const navbarSearch =
  'hidden lg:block relative';
export const navbarSearchIcon =
  'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted';
export const navbarSearchInput =
  'pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary w-48 xl:w-56 text-sm text-content-primary placeholder-content-muted bg-surface-muted transition-all';
export const navbarNotification =
  'relative p-2 text-content-muted hover:text-brand-primary hover:bg-brand-primary-lt rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center';
export const navbarNotificationBadge =
  'absolute top-1.5 right-1.5 h-2 w-2 bg-danger rounded-full';
export const navbarProfile = 'relative';
export const navbarProfileButton =
  'flex items-center space-x-2.5 p-2 rounded-lg hover:bg-brand-primary-lt transition-all min-h-[44px]';
export const navbarProfileAvatar =
  'w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0';
export const navbarProfileAvatarText =
  'text-white text-sm font-semibold';
export const navbarProfileInfo = 'hidden xl:block text-left';
export const navbarProfileName =
  'text-sm font-semibold text-content-primary leading-none';
export const navbarProfileId =
  'text-xs font-normal text-content-muted mt-0.5';
// Note: navbarDropdown visibility is handled entirely via React state ({showDropdown && ...})
// Do NOT add CSS opacity/visibility rules here — they conflict with state toggling.
export const navbarDropdown =
  'absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-border shadow-card-lg z-50 max-w-[calc(100vw-1rem)]';
export const navbarDropdownHeader =
  'p-4 border-b border-border';
export const navbarDropdownHeaderName =
  'font-semibold text-content-primary text-sm leading-none';
export const navbarDropdownHeaderEmail =
  'text-xs text-content-muted mt-1';
export const navbarDropdownMenu = 'p-2';
export const navbarDropdownItem =
  'w-full text-left px-3 py-2.5 text-sm font-medium text-content-secondary hover:bg-brand-primary-lt hover:text-brand-primary rounded-lg transition-all';
export const navbarDropdownItemDanger =
  'w-full text-left px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-light rounded-lg transition-all';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export const sidebarContainer =
  'fixed top-0 lg:top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-border flex flex-col shadow-card-lg';
export const sidebarOverlay =
  'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden';

// Header — deep navy brand background
export const sidebarHeader =
  'p-5 border-b border-white/10 flex-shrink-0';
export const sidebarHeaderBg =
  'bg-brand-navy'; // applied via style on the header element
export const sidebarHeaderInner =
  'flex items-center gap-3';
export const sidebarHeaderLogo =
  'w-10 h-10 flex-shrink-0';
export const sidebarHeaderTitle =
  'text-base font-bold tracking-tight text-white leading-tight';
export const sidebarHeaderSubtitle =
  'text-xs font-normal text-white/60 mt-0.5';

// Navigation
export const sidebarNav =
  'flex-1 px-3 py-4 space-y-0.5 overflow-y-auto';
export const sidebarNavGroup =
  'mb-5';
export const sidebarNavGroupLabel =
  'px-3 mb-2 text-2xs font-semibold uppercase tracking-widest text-content-muted';
export const sidebarNavItem =
  'nav-item relative';
export const sidebarNavItemActive =
  'nav-item-active font-semibold';
export const sidebarNavItemInactive =
  'nav-item-inactive';
export const sidebarNavItemIcon =
  'text-lg mr-3 flex-shrink-0';
export const sidebarNavItemLabel =
  'text-sm font-medium truncate';
export const sidebarNavItemBadge =
  'ml-auto w-1.5 h-1.5 bg-brand-primary rounded-full flex-shrink-0';
// Left active border (add as an absolute inner div when active)
export const sidebarNavItemActiveBorder =
  'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-primary rounded-r-full';

// Footer
export const sidebarFooter =
  'p-3 border-t border-border flex-shrink-0';
export const sidebarLogout =
  'flex items-center w-full px-3 py-2.5 text-danger hover:bg-danger-light rounded-lg transition-all min-h-[44px]';
export const sidebarLogoutIcon = 'text-lg mr-3';
export const sidebarLogoutText = 'text-sm font-medium';
export const sidebarHelp =
  'mt-3 p-3 bg-brand-primary-lt rounded-xl border border-brand-primary/10';
export const sidebarHelpTitle =
  'text-xs text-content-secondary mb-1';
export const sidebarHelpButton =
  'text-xs font-semibold text-brand-primary hover:underline';

// ─── Dashboard Home ───────────────────────────────────────────────────────────
export const homeContainer = 'max-w-7xl mx-auto space-y-6';
export const homeHeader = 'mb-2';
export const homeTitle =
  'text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair';
export const homeSubtitle =
  'text-sm font-normal text-content-secondary mt-2';

// KPI Stat Cards — brand gradient
export const homeStatsGrid =
  'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4';
export const homeStatCard =
  'rounded-xl p-5 text-white shadow-brand relative overflow-hidden';
export const homeStatCardTop =
  'flex items-start justify-between mb-4';
export const homeStatCardIconWrap =
  'w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0';
export const homeStatCardIcon = 'text-xl';
export const homeStatCardValue =
  'text-xl sm:text-2xl font-bold tracking-tight font-playfair';
export const homeStatCardLabel =
  'text-xs font-medium text-white/70 uppercase tracking-wide';

// Quick Actions Grid — 5 items
export const homeActionsGrid =
  'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4';
export const homeActionButton =
  'p-5 rounded-xl transition-all border-2 text-left hover:-translate-y-0.5 hover:shadow-brand';
export const homeActionIcon = 'text-3xl mb-3';
export const homeActionTitle =
  'font-semibold text-sm leading-snug';

// Content Cards
export const homeContentGrid =
  'grid grid-cols-1 lg:grid-cols-2 gap-6';
export const homeCard =
  'bg-white rounded-xl border border-border shadow-card p-4 sm:p-6';
export const homeCardTitle =
  'text-lg font-bold tracking-tight text-content-primary mb-4 font-playfair';

// Activity
export const homeActivityItem =
  'flex items-center justify-between p-3 hover:bg-surface-subtle rounded-lg transition-colors';
export const homeActivityLeft = 'flex items-center';
export const homeActivityIcon =
  'w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-brand-primary-lt';
export const homeActivitySubject =
  'font-medium text-sm text-content-primary';
export const homeActivityTime =
  'text-xs text-content-muted mt-0.5';
export const homeActivityScore =
  'font-bold text-base text-content-primary font-playfair';
export const homeActivityContinue =
  'text-xs font-medium text-brand-primary hover:underline';

// Quick Access Grid
export const homeSubjectGrid = 'grid grid-cols-1 sm:grid-cols-2 gap-3';
export const homeSubjectButton =
  'p-3 rounded-xl border border-border hover:border-brand-primary hover:bg-brand-primary-lt transition-all text-left min-h-[44px]';
export const homeSubjectInner = 'flex items-center';
export const homeSubjectIcon = 'text-2xl mr-3 flex-shrink-0';
export const homeSubjectName =
  'font-medium text-content-primary text-sm leading-tight';
export const homeSubjectCount =
  'text-xs text-content-muted mt-0.5';
export const homeViewAllButton =
  'w-full mt-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk transition-colors font-semibold text-sm min-h-[44px]';

// Support / CTA Banner
export const homeBanner =
  'rounded-xl p-6 text-white shadow-brand';
export const homeBannerContent =
  'flex flex-col md:flex-row md:items-center justify-between gap-4';
export const homeBannerTitle =
  'text-xl font-bold tracking-tight mb-2 font-playfair';
export const homeBannerText =
  'text-sm font-normal opacity-90';
export const homeBannerActions =
  'flex flex-wrap gap-3';
export const homeBannerButtonPrimary =
  'bg-white text-brand-primary px-5 py-2.5 rounded-lg hover:bg-brand-primary-lt transition-colors font-bold text-sm min-h-[44px] inline-flex items-center';
export const homeBannerButtonSecondary =
  'bg-white/15 text-white border border-white/25 px-5 py-2.5 rounded-lg hover:bg-white/25 transition-colors font-medium text-sm min-h-[44px] inline-flex items-center';
export const homeBannerStats =
  'mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4';
export const homeBannerStatItem =
  'text-center p-4 bg-white/10 rounded-xl border border-white/10';
export const homeBannerStatValue =
  'text-base font-bold font-playfair';
export const homeBannerStatLabel =
  'text-xs font-normal opacity-80 mt-1';

// ─── Modal ────────────────────────────────────────────────────────────────────
export const modalOverlay =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4';
export const modalContainer =
  'bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full shadow-card-lg max-h-[90vh] overflow-y-auto';
export const modalTitle =
  'text-lg font-bold tracking-tight text-content-primary mb-3';
export const modalText =
  'text-sm text-content-secondary mb-6';
export const modalActions = 'flex gap-3';
export const modalButtonSecondary =
  'flex-1 px-4 py-3 border border-border text-content-secondary rounded-lg hover:bg-surface-subtle transition-colors text-sm font-medium min-h-[44px]';
export const modalButtonDanger =
  'flex-1 px-4 py-3 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors text-sm font-semibold min-h-[44px]';
export const modalButtonPrimary =
  'flex-1 px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk transition-colors text-sm font-semibold min-h-[44px]';

// ─── Exams Page ───────────────────────────────────────────────────────────────
export const examsContainer = 'max-w-7xl mx-auto';
export const examsHeader = 'mb-8';
export const examsTitle =
  'text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair';
export const examsSubtitle =
  'text-sm text-content-secondary mt-2';
export const examsTabsGrid =
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8';
export const examsTabButton =
  'p-5 rounded-xl border-2 transition-all text-left hover:-translate-y-0.5';
export const examsTabButtonActive =
  'border-brand-primary bg-brand-primary-lt text-brand-primary shadow-brand';
export const examsTabButtonInactive =
  'border-border bg-white text-content-secondary hover:border-brand-primary hover:shadow-card';
export const examsTabTitle =
  'font-bold text-base leading-tight mb-1 font-playfair';
export const examsTabDesc =
  'text-xs text-content-muted';
export const examsSubjectsGrid =
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
export const examsSubjectCard =
  'bg-white rounded-xl border border-border overflow-hidden hover:border-brand-primary hover:shadow-card-md transition-all';
export const examsSubjectColorBar = 'h-1.5';
export const examsSubjectCardInner = 'p-5';
export const examsSubjectHeader = 'flex items-center mb-4';
export const examsSubjectIcon = 'text-3xl mr-3';
export const examsSubjectName =
  'font-bold text-sm text-content-primary font-playfair leading-tight';
export const examsSubjectQuestions =
  'text-xs text-content-muted mt-0.5';
export const examsSubjectStats = 'space-y-2.5 mb-5';
export const examsSubjectStatRow =
  'flex justify-between text-xs';
export const examsSubjectStatLabel =
  'text-content-muted';
export const examsSubjectStatValue =
  'font-medium text-content-primary';
export const examsSubjectButton =
  'w-full py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-dk transition-colors text-sm min-h-[44px]';
export const examsInstructions =
  'mt-8 bg-brand-primary-lt border border-brand-primary/20 rounded-xl p-6';
export const examsInstructionsTitle =
  'text-base font-bold tracking-tight text-brand-primary mb-3 font-playfair';
export const examsInstructionsList = 'space-y-2';
export const examsInstructionsItem =
  'flex items-start text-sm text-content-primary';
export const examsInstructionsBullet =
  'mr-2 text-brand-primary mt-0.5 flex-shrink-0';

// ─── Exam Room ────────────────────────────────────────────────────────────────
export const examRoomContainer =
  'fixed inset-0 bg-white overflow-hidden flex flex-col';
export const examRoomHeader =
  'sticky top-0 z-30 bg-white border-b-2 border-border shadow-sm h-16 px-6';
export const examRoomHeaderInner =
  'max-w-7xl mx-auto h-full flex items-center justify-between';
export const examRoomSubject =
  'text-lg font-bold tracking-tight text-content-primary font-playfair';
export const examRoomTimer = 'flex items-center space-x-4';
export const examRoomTimerText =
  'text-lg font-black tracking-widest tabular-nums font-mono';
export const examRoomTimerNormal =
  'text-brand-primary border border-brand-primary bg-brand-primary-lt px-3 py-1.5 rounded-lg';
export const examRoomTimerWarning =
  'text-amber-600 border border-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg';
export const examRoomTimerDanger =
  'text-red-600 border border-red-500 bg-red-50 px-3 py-1.5 rounded-lg animate-pulse';
export const examRoomMain = 'flex-1 overflow-hidden flex';
export const examRoomContent = 'flex-1 overflow-y-auto p-6';
export const examRoomContentInner = 'max-w-4xl mx-auto';
export const examRoomQuestionCard =
  'bg-white border border-border rounded-xl p-6 mb-6 shadow-card';
export const examRoomQuestionHeader =
  'flex items-start justify-between mb-4';
export const examRoomQuestionNumber =
  'text-sm font-bold text-brand-primary';
export const examRoomQuestionMark =
  'text-xs font-medium text-content-muted';
export const examRoomQuestionText =
  'text-base leading-relaxed font-medium text-content-primary mb-6';
export const examRoomOptionsGrid = 'space-y-3';
export const examRoomOption =
  'flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:-translate-y-px';
export const examRoomOptionInactive =
  'border-border hover:border-brand-primary hover:bg-brand-primary-lt';
export const examRoomOptionActive =
  'border-brand-primary bg-brand-primary-lt shadow-brand';
export const examRoomOptionLabel =
  'w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 font-bold text-sm';
export const examRoomOptionLabelInactive =
  'bg-surface-subtle text-content-muted';
export const examRoomOptionLabelActive =
  'bg-brand-primary text-white';
export const examRoomOptionText =
  'text-sm leading-relaxed text-content-primary flex-1';
export const examRoomNavigation =
  'flex items-center justify-between mt-8 pt-6 border-t border-border';
export const examRoomNavButton =
  'px-6 py-3 rounded-lg font-semibold text-sm transition-all min-h-[44px]';
export const examRoomNavButtonPrimary =
  'bg-brand-primary text-white hover:bg-brand-primary-dk shadow-brand';
export const examRoomNavButtonSecondary =
  'border-2 border-border text-content-secondary hover:border-brand-primary hover:text-brand-primary';
export const examRoomNavButtonDisabled =
  'opacity-40 cursor-not-allowed pointer-events-none';
export const examRoomSidebar =
  'w-80 bg-white border-l border-border overflow-y-auto p-6';
export const examRoomSidebarTitle =
  'text-base font-bold tracking-tight text-content-primary mb-4 font-playfair';
export const examRoomProgressBar = 'mb-6';
export const examRoomProgressText =
  'flex justify-between text-xs font-medium text-content-muted mb-2';
export const examRoomProgressBarBg =
  'w-full h-2 bg-brand-primary-lt rounded-full overflow-hidden';
export const examRoomProgressBarFill =
  'h-full bg-brand-primary transition-all duration-300';
export const examRoomQuestionGrid =
  'grid grid-cols-5 gap-2';
export const examRoomQuestionDot =
  'aspect-square rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all min-h-[40px]';
export const examRoomQuestionDotUnanswered =
  'bg-surface-subtle text-content-muted hover:bg-surface-subtle';
export const examRoomQuestionDotAnswered =
  'bg-brand-primary-lt text-brand-primary hover:bg-brand-primary-lt';
export const examRoomQuestionDotCurrent =
  'bg-brand-primary text-white shadow-brand';
export const examRoomActions = 'mt-6 space-y-3';
export const examRoomActionButton =
  'w-full py-3 rounded-lg font-semibold text-sm transition-all min-h-[44px]';
export const examRoomSubmitButton =
  'bg-danger text-white hover:bg-danger-dark';
export const examRoomReviewButton =
  'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary-lt';

// ─── Exam Warning Modal ───────────────────────────────────────────────────────
export const examWarningModal =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4';
export const examWarningCard =
  'bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-card-lg';
export const examWarningIcon = 'text-5xl mb-4';
export const examWarningTitle =
  'text-xl font-bold tracking-tight text-danger mb-3 font-playfair';
export const examWarningText =
  'text-sm leading-relaxed text-content-secondary mb-6';
export const examWarningButton =
  'w-full py-3 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors font-semibold text-sm min-h-[44px]';
