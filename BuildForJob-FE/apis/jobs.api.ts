import api from './axiosInstance';

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  salary?: string;
  experience?: string;
  skills: string[];
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
  companyId: string;
  founderId: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    industry?: string;
    website?: string;
    description?: string;
  };
  founder: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: { applications: number };
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  name: string;
  resumeUrl: string;
  note?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  job: Job;
  applicant?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    email?: string;
    jobTitle?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PublicCompany {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  logoUrl?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    jobTitle?: string;
  };
  _count?: { jobs: number };
  jobs?: Omit<Job, 'company' | 'founder' | '_count'>[]; // Used in single view
}

export const jobsApi = {
  // All open jobs
  getAllJobs: async (): Promise<{ success: boolean; data: Job[] }> => {
    const res = await api.get('/job');
    return res.data;
  },

  // Single job
  getJob: async (id: string): Promise<{ success: boolean; data: Job }> => {
    const res = await api.get(`/job/${id}`);
    return res.data;
  },

  // Founder: create job
  createJob: async (data: Partial<Job>): Promise<{ success: boolean; data: Job; message: string }> => {
    const res = await api.post('/job', data);
    return res.data;
  },

  // Founder: update job
  updateJob: async (id: string, data: Partial<Job>): Promise<{ success: boolean; data: Job; message: string }> => {
    const res = await api.patch(`/job/${id}`, data);
    return res.data;
  },

  // Founder: delete job
  deleteJob: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/job/${id}`);
    return res.data;
  },

  // Founder: get my posted jobs with all applications
  getMyJobs: async (): Promise<{ success: boolean; data: (Job & { applications: JobApplication[] })[] }> => {
    const res = await api.get('/job/my-jobs');
    return res.data;
  },

  // User: apply for job
  applyForJob: async (
    jobId: string,
    data: { name: string; resumeUrl: string; note?: string }
  ): Promise<{ success: boolean; data: JobApplication; message: string }> => {
    const res = await api.post(`/job/${jobId}/apply`, data);
    return res.data;
  },

  // User: get my applications
  getMyApplications: async (): Promise<{ success: boolean; data: JobApplication[] }> => {
    const res = await api.get('/job/my-applications');
    return res.data;
  },

  // Founder: accept or reject application
  updateApplicationStatus: async (
    jobId: string,
    appId: string,
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<{ success: boolean; data: JobApplication; message: string }> => {
    const res = await api.patch(`/job/${jobId}/applications/${appId}`, { status });
    return res.data;
  },
};

export const companiesApi = {
  // All public companies (any logged-in user)
  getAllCompanies: async (): Promise<{ success: boolean; data: PublicCompany[] }> => {
    const res = await api.get('/company');
    return res.data;
  },

  // Single public company with its jobs
  getCompany: async (id: string): Promise<{ success: boolean; data: PublicCompany }> => {
    const res = await api.get(`/company/${id}`);
    return res.data;
  },

  // Founder: get my company
  getMyCompany: async (): Promise<{ success: boolean; data: any }> => {
    const res = await api.get('/company/me');
    return res.data;
  },
};
