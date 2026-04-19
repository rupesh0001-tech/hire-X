import api from './axiosInstance';

export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  jobTitle?: string;
}

export interface MessageModel {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  contextType?: string;
  contextId?: string;
  createdAt: string;
  sender?: ChatUser;
  receiver?: ChatUser;
}

export interface InboxConversation {
  otherUser: ChatUser;
  latestMessage: MessageModel;
  unreadCount: number;
}

export const messageApi = {
  getInbox: async (): Promise<{ success: boolean; data: InboxConversation[] }> => {
    const res = await api.get('/messages/inbox');
    return res.data;
  },

  getChatHistory: async (userId: string): Promise<{ success: boolean; data: MessageModel[] }> => {
    const res = await api.get(`/messages/${userId}`);
    return res.data;
  }
};
