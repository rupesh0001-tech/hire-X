import api from './axiosInstance';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  type: 'FUND_REQUEST' | 'FUND_OFFER';
  amountText: string;
  promisesOrExpectations: string;
  status: 'OPEN' | 'CLOSED';
  creatorId: string;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    jobTitle?: string;
    role: string;
  };
  _count?: {
    applications: number;
  };
  applications?: MarketplaceApplication[];
}

export interface MarketplaceApplication {
  id: string;
  listingId: string;
  applicantId: string;
  note?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    jobTitle?: string;
  };
  listing?: MarketplaceListing;
}

export const marketplaceApi = {
  // Get all listings
  getAllListings: async (): Promise<{ success: boolean; data: MarketplaceListing[] }> => {
    const res = await api.get('/marketplace');
    return res.data;
  },

  // Create a listing
  createListing: async (data: { title: string; description: string; amountText: string; promisesOrExpectations: string }): Promise<{ success: boolean; data: MarketplaceListing }> => {
    const res = await api.post('/marketplace', data);
    return res.data;
  },

  // Get my listings (with applications inside)
  getMyListings: async (): Promise<{ success: boolean; data: MarketplaceListing[] }> => {
    const res = await api.get('/marketplace/my-listings');
    return res.data;
  },

  // Apply for a listing
  apply: async (id: string, note?: string): Promise<{ success: boolean; data: MarketplaceApplication }> => {
    const res = await api.post(`/marketplace/${id}/apply`, { note });
    return res.data;
  },

  // Get applications I've sent
  getMyApplications: async (): Promise<{ success: boolean; data: MarketplaceApplication[] }> => {
    const res = await api.get('/marketplace/my-applications');
    return res.data;
  },

  // Accept or reject an application
  updateApplicationStatus: async (listingId: string, appId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<{ success: boolean; data: any }> => {
    const res = await api.patch(`/marketplace/${listingId}/applications/${appId}`, { status });
    return res.data;
  }
};
