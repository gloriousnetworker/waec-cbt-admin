import { mathematicsQuestions } from './mathematics';
import { englishQuestions } from './english';
import { physicsQuestions } from './physics';
import { chemistryQuestions } from './chemistry';
import { biologyQuestions } from './biology';
import { economicsQuestions } from './economics';
import { geographyQuestions } from './geography';
import { governmentQuestions } from './government';
import { crkQuestions } from './crk';
import { irkQuestions } from './irk';
import { literatureQuestions } from './literature';
import { commerceQuestions } from './commerce';
import { accountingQuestions } from './accounting';
import { agricscienceQuestions } from './agricscience';
import { civileduQuestions } from './civiledu';
import { dataprocessingQuestions } from './dataprocessing';

export const subjectQuestions = {
  mathematics: mathematicsQuestions,
  english: englishQuestions,
  physics: physicsQuestions,
  chemistry: chemistryQuestions,
  biology: biologyQuestions,
  economics: economicsQuestions,
  geography: geographyQuestions,
  government: governmentQuestions,
  crk: crkQuestions,
  irk: irkQuestions,
  literature: literatureQuestions,
  commerce: commerceQuestions,
  accounting: accountingQuestions,
  agricscience: agricscienceQuestions,
  civiledu: civileduQuestions,
  dataprocessing: dataprocessingQuestions,
};

export const getSubjectQuestions = (subjectId, count = null) => {
  const questions = subjectQuestions[subjectId] || mathematicsQuestions;
  
  if (!count) return questions;
  
  // Return specified number of questions
  return questions.slice(0, Math.min(count, questions.length));
};

export const getAllQuestionsCount = () => {
  return Object.keys(subjectQuestions).reduce((acc, subject) => {
    acc[subject] = subjectQuestions[subject].length;
    return acc;
  }, {});
};