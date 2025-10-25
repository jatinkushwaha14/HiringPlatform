import { db } from './database';
import type { Job, Candidate } from '../types';

// Generate random names for candidates
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Jessica', 'Robert', 'Ashley', 'William', 'Amanda', 'Richard', 'Jennifer', 'Charles', 'Lisa', 'Joseph', 'Nancy', 'Thomas', 'Karen', 'Christopher', 'Betty', 'Daniel', 'Helen', 'Matthew', 'Sandra', 'Anthony', 'Donna', 'Mark', 'Carol', 'Donald', 'Ruth', 'Steven', 'Sharon', 'Paul', 'Michelle', 'Andrew', 'Laura', 'Joshua', 'Sarah', 'Kenneth', 'Kimberly', 'Kevin', 'Deborah', 'Brian', 'Dorothy', 'George', 'Lisa', 'Edward', 'Nancy', 'Ronald', 'Karen', 'Timothy', 'Betty', 'Jason', 'Helen', 'Jeffrey', 'Sandra', 'Ryan', 'Donna', 'Jacob', 'Carol', 'Gary', 'Ruth', 'Nicholas', 'Sharon', 'Eric', 'Michelle', 'Jonathan', 'Laura', 'Stephen', 'Sarah', 'Larry', 'Kimberly', 'Justin', 'Deborah', 'Scott', 'Dorothy', 'Brandon', 'Lisa', 'Benjamin', 'Nancy', 'Samuel', 'Karen', 'Gregory', 'Betty', 'Alexander', 'Helen', 'Patrick', 'Sandra', 'Jack', 'Donna', 'Dennis', 'Carol', 'Jerry', 'Ruth', 'Tyler', 'Sharon', 'Aaron', 'Michelle', 'Jose', 'Laura', 'Henry', 'Sarah', 'Adam', 'Kimberly', 'Douglas', 'Deborah', 'Nathan', 'Dorothy', 'Peter', 'Lisa', 'Zachary', 'Nancy', 'Kyle', 'Karen', 'Noah', 'Betty', 'Alan', 'Helen', 'Ethan', 'Sandra', 'Jeremy', 'Donna', 'Keith', 'Carol', 'Roger', 'Ruth', 'Terry', 'Sharon', 'Gerald', 'Michelle', 'Harold', 'Laura', 'Sean', 'Sarah', 'Christian', 'Kimberly', 'Arthur', 'Deborah', 'Austin', 'Dorothy', 'Noah', 'Lisa', 'Lawrence', 'Nancy', 'Jesse', 'Karen', 'Joe', 'Betty', 'Bryan', 'Helen', 'Billy', 'Sandra', 'Jordan', 'Donna', 'Albert', 'Carol', 'Dylan', 'Ruth', 'Bruce', 'Sharon', 'Willie', 'Michelle', 'Gabriel', 'Laura', 'Alan', 'Sarah', 'Juan', 'Kimberly', 'Wayne', 'Deborah', 'Roy', 'Dorothy', 'Ralph', 'Lisa', 'Randy', 'Nancy', 'Eugene', 'Karen', 'Vincent', 'Betty', 'Russell', 'Helen', 'Louis', 'Sandra', 'Philip', 'Donna', 'Bobby', 'Carol', 'Johnny', 'Ruth', 'Bradley', 'Sharon'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'];

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'] as const;

const generateRandomCandidate = (jobId: string, index: number): Candidate => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const stage = stages[Math.floor(Math.random() * stages.length)];
  
  return {
    id: `candidate-${index}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    stage,
    jobId,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const existingJobs = await db.jobs.count();
    const existingCandidates = await db.candidates.count();
    
    console.log('Existing jobs:', existingJobs);
    console.log('Existing candidates:', existingCandidates);
    
    if (existingJobs > 0 && existingCandidates > 0) {
      console.log('Database already seeded');
      return;
    }

    // Create 25 sample jobs
    const sampleJobs: Job[] = Array.from({ length: 25 }, (_, i) => ({
      id: `job-${i + 1}`,
      title: [
        'Senior Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 
        'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
        'Mobile Developer', 'QA Engineer', 'Technical Lead', 'Software Architect',
        'Cloud Engineer', 'Security Engineer', 'Machine Learning Engineer',
        'Blockchain Developer', 'Game Developer', 'iOS Developer', 'Android Developer',
        'React Developer', 'Node.js Developer', 'Python Developer', 'Java Developer',
        'Go Developer', 'Rust Developer', 'PHP Developer'
      ][i],
      slug: [
        'senior-frontend-developer', 'backend-engineer', 'full-stack-developer',
        'devops-engineer', 'data-scientist', 'product-manager', 'ux-designer',
        'mobile-developer', 'qa-engineer', 'technical-lead', 'software-architect',
        'cloud-engineer', 'security-engineer', 'machine-learning-engineer',
        'blockchain-developer', 'game-developer', 'ios-developer', 'android-developer',
        'react-developer', 'nodejs-developer', 'python-developer', 'java-developer',
        'go-developer', 'rust-developer', 'php-developer'
      ][i],
      status: Math.random() > 0.2 ? 'active' : 'archived',
      tags: [
        ['React', 'TypeScript', 'Frontend'],
        ['Node.js', 'Python', 'Backend'],
        ['React', 'Node.js', 'Full Stack'],
        ['AWS', 'Docker', 'DevOps'],
        ['Python', 'Machine Learning', 'Data Science'],
        ['Product', 'Strategy', 'Management'],
        ['Figma', 'Design', 'UX'],
        ['React Native', 'Mobile', 'iOS'],
        ['Testing', 'Automation', 'QA'],
        ['Leadership', 'Architecture', 'Technical'],
        ['System Design', 'Architecture', 'Leadership'],
        ['AWS', 'Azure', 'Cloud'],
        ['Security', 'Cybersecurity', 'Compliance'],
        ['Python', 'TensorFlow', 'AI'],
        ['Blockchain', 'Solidity', 'Web3'],
        ['Unity', 'C#', 'Game Development'],
        ['Swift', 'iOS', 'Mobile'],
        ['Kotlin', 'Android', 'Mobile'],
        ['React', 'JavaScript', 'Frontend'],
        ['Node.js', 'Express', 'Backend'],
        ['Python', 'Django', 'Backend'],
        ['Java', 'Spring', 'Backend'],
        ['Go', 'Microservices', 'Backend'],
        ['Rust', 'Systems', 'Backend'],
        ['PHP', 'Laravel', 'Backend']
      ][i],
      order: i + 1,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Add jobs to database
    await db.jobs.bulkAdd(sampleJobs);
    console.log('Added 25 jobs to database');

    // Create 1000 sample candidates
    const sampleCandidates: Candidate[] = [];
    for (let i = 0; i < 1000; i++) {
      const jobId = sampleJobs[Math.floor(Math.random() * sampleJobs.length)].id;
      sampleCandidates.push(generateRandomCandidate(jobId, i + 1));
    }

    await db.candidates.bulkAdd(sampleCandidates);
    console.log('Added 1000 candidates to database');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Force seed function that clears existing data
export const forceSeedDatabase = async () => {
  try {
    console.log('Force seeding database...');
    
    // Clear existing data
    await db.candidates.clear();
    await db.jobs.clear();
    console.log('Cleared existing data');
    
    // Create 25 sample jobs
    const sampleJobs: Job[] = Array.from({ length: 25 }, (_, i) => ({
      id: `job-${i + 1}`,
      title: [
        'Senior Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 
        'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
        'Mobile Developer', 'QA Engineer', 'Technical Lead', 'Software Architect',
        'Cloud Engineer', 'Security Engineer', 'Machine Learning Engineer',
        'Blockchain Developer', 'Game Developer', 'iOS Developer', 'Android Developer',
        'React Developer', 'Node.js Developer', 'Python Developer', 'Java Developer',
        'Go Developer', 'Rust Developer', 'PHP Developer'
      ][i],
      slug: [
        'senior-frontend-developer', 'backend-engineer', 'full-stack-developer',
        'devops-engineer', 'data-scientist', 'product-manager', 'ux-designer',
        'mobile-developer', 'qa-engineer', 'technical-lead', 'software-architect',
        'cloud-engineer', 'security-engineer', 'machine-learning-engineer',
        'blockchain-developer', 'game-developer', 'ios-developer', 'android-developer',
        'react-developer', 'nodejs-developer', 'python-developer', 'java-developer',
        'go-developer', 'rust-developer', 'php-developer'
      ][i],
      status: Math.random() > 0.2 ? 'active' : 'archived',
      tags: [
        ['React', 'TypeScript', 'Frontend'],
        ['Node.js', 'Python', 'Backend'],
        ['React', 'Node.js', 'Full Stack'],
        ['AWS', 'Docker', 'DevOps'],
        ['Python', 'Machine Learning', 'Data Science'],
        ['Product', 'Strategy', 'Management'],
        ['Figma', 'Design', 'UX'],
        ['React Native', 'Mobile', 'iOS'],
        ['Testing', 'Automation', 'QA'],
        ['Leadership', 'Architecture', 'Technical'],
        ['System Design', 'Architecture', 'Leadership'],
        ['AWS', 'Azure', 'Cloud'],
        ['Security', 'Cybersecurity', 'Compliance'],
        ['Python', 'TensorFlow', 'AI'],
        ['Blockchain', 'Solidity', 'Web3'],
        ['Unity', 'C#', 'Game Development'],
        ['Swift', 'iOS', 'Mobile'],
        ['Kotlin', 'Android', 'Mobile'],
        ['React', 'JavaScript', 'Frontend'],
        ['Node.js', 'Express', 'Backend'],
        ['Python', 'Django', 'Backend'],
        ['Java', 'Spring', 'Backend'],
        ['Go', 'Microservices', 'Backend'],
        ['Rust', 'Systems', 'Backend'],
        ['PHP', 'Laravel', 'Backend']
      ][i],
      order: i + 1,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Add jobs to database
    await db.jobs.bulkAdd(sampleJobs);
    console.log('Added 25 jobs to database');

    // Create 1000 sample candidates
    const sampleCandidates: Candidate[] = [];
    for (let i = 0; i < 1000; i++) {
      const jobId = sampleJobs[Math.floor(Math.random() * sampleJobs.length)].id;
      sampleCandidates.push(generateRandomCandidate(jobId, i + 1));
    }

    await db.candidates.bulkAdd(sampleCandidates);
    console.log('Added 1000 candidates to database');
    
    return true;
  } catch (error) {
    console.error('Error force seeding database:', error);
    return false;
  }
};

// Call this function when the app starts
forceSeedDatabase();