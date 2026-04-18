import api from './axiosInstance';

export interface PostAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  role: 'USER' | 'FOUNDER';
  company?: { name: string; logoUrl?: string | null } | null;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  type: 'TEXT' | 'IMAGE';
  content?: string | null;
  imageUrl?: string | null;
  authorId: string;
  author: PostAuthor;
  likes: { userId: string }[];
  comments: Comment[];
  isLikedByMe: boolean;
  _count: { likes: number; comments: number };
  createdAt: string;
  updatedAt: string;
}

export const postsApi = {
  /** Fetch global feed (paginated) */
  getFeed: async (page = 1, limit = 20) => {
    const res = await api.get<{ success: boolean; data: Post[] }>(
      `/post/feed?page=${page}&limit=${limit}`
    );
    return res.data;
  },

  /** Create a new post (text or image) */
  createPost: async (formData: FormData) => {
    const res = await api.post<{ success: boolean; data: Post }>('/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Delete own post */
  deletePost: async (postId: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/post/${postId}`);
    return res.data;
  },

  /** Toggle like on a post */
  toggleLike: async (postId: string) => {
    const res = await api.post<{ success: boolean; liked: boolean; likeCount: number }>(
      `/post/${postId}/like`
    );
    return res.data;
  },

  /** Add a comment to a post */
  addComment: async (postId: string, content: string) => {
    const res = await api.post<{ success: boolean; data: Comment }>(
      `/post/${postId}/comment`,
      { content }
    );
    return res.data;
  },

  /** Delete own comment */
  deleteComment: async (postId: string, commentId: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/post/${postId}/comment/${commentId}`
    );
    return res.data;
  },

  /** Get posts by a specific user */
  getUserPosts: async (userId: string) => {
    const res = await api.get<{ success: boolean; data: Post[] }>(`/post/user/${userId}`);
    return res.data;
  },
};
