import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CoverLetterState {
  personalInfo: {
    fullName: string;
    address: string;
    phone: string;
    email: string;
    linkedin: string;
    github: string;
  };
  date: string;
  employerInfo: {
    managerName: string;
    teamName: string;
    companyName: string;
  };
  salutation: string;
  mode: "structured" | "manual";
  manualContent: string;
  template: string;
  body: {
    intro: string;
    body1: string;
    body2: string;
    body3: string;
    conclusion: string;
  };
  signOff: string;
}

const initialState: CoverLetterState = {
  personalInfo: {
    fullName: "RUPESH JAGTAP",
    address: "Pune, PCMC",
    phone: "+91 7028083399",
    email: "rupeshjagtap157@gmail.com",
    linkedin: "https://www.linkedin.com/in/rupeshjagtap/",
    github: "https://github.com/rupeshjagtap",
  },
  date: new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  employerInfo: {
    managerName: "Hiring Manager",
    teamName: "Technology Recruiting Team",
    companyName: "JPMorgan Chase & Co.",
  },
  salutation: "Dear Hiring Manager,",
  mode: "structured",
  manualContent: "",
  template: "classic",
  body: {
    intro: "I am writing to express my interest in the Software Engineer Intern position at JPMorgan Chase & Co., which I learned about through my campus placement program. As a Bachelor of Engineering student in Computer Engineering at Dr. D. Y. Patil Institute of Technology, I am excited about the opportunity to apply my full-stack development skills to real-world financial technology systems.",
    body1: "Currently, I work as a Software Engineering Intern at COOLCLIQ, where I develop full-stack applications using TypeScript, Node.js, Express, Prisma, and PostgreSQL, along with cloud services on AWS. In this role, I designed and deployed backend APIs capable of handling more than 10,000 daily transactions with high reliability while also contributing to frontend improvements that enhanced user engagement.",
    body2: "Beyond my internship experience, I actively participate in hackathons and have placed in the top 10 in several competitions. These experiences have helped me develop strong problem-solving skills, rapid prototyping abilities, and the confidence to work under pressure while delivering innovative technical solutions.",
    body3: "I am particularly interested in JPMorgan Chase & Co. because of the opportunity to work on large-scale financial systems that impact millions of users worldwide. The chance to learn from experienced engineers while contributing to technology that supports global financial infrastructure is extremely motivating to me.",
    conclusion: "Thank you for your time and consideration. I look forward to the opportunity to discuss how my skills and experiences align with the Software Engineer Intern role.",
  },
  signOff: "Sincerely,",
};

const coverLetterSlice = createSlice({
  name: "coverLetter",
  initialState,
  reducers: {
    updatePersonalInfo: (state, action: PayloadAction<Partial<CoverLetterState["personalInfo"]>>) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    updateDate: (state, action: PayloadAction<string>) => {
      state.date = action.payload;
    },
    updateEmployerInfo: (state, action: PayloadAction<Partial<CoverLetterState["employerInfo"]>>) => {
      state.employerInfo = { ...state.employerInfo, ...action.payload };
    },
    updateSalutation: (state, action: PayloadAction<string>) => {
      state.salutation = action.payload;
    },
    updateMode: (state, action: PayloadAction<"structured" | "manual">) => {
      state.mode = action.payload;
    },
    updateTemplate: (state, action: PayloadAction<string>) => {
      state.template = action.payload;
    },
    updateManualContent: (state, action: PayloadAction<string>) => {
      state.manualContent = action.payload;
    },
    updateBody: (state, action: PayloadAction<Partial<CoverLetterState["body"]>>) => {
      state.body = { ...state.body, ...action.payload };
    },
    updateSignOff: (state, action: PayloadAction<string>) => {
      state.signOff = action.payload;
    },
    resetCoverLetter: () => initialState,
  },
});

export const {
  updatePersonalInfo,
  updateDate,
  updateEmployerInfo,
  updateSalutation,
  updateMode,
  updateTemplate,
  updateManualContent,
  updateBody,
  updateSignOff,
  resetCoverLetter,
} = coverLetterSlice.actions;

export default coverLetterSlice.reducer;
