import axios from "axios";

export interface PostData {
  title: string;
  body: string;
  userId: number;
  [key: string]: any;
}

export interface ApiResponse {
  status: number;
  data: any;
  method: string;
}

const apiHelper = {
  async createPost(postData: PostData): Promise<ApiResponse> {
    const response = await axios.post("https://jsonplaceholder.typicode.com/posts", postData);
    return {
      status: response.status,
      data: response.data,
      method: "createPost",
    };
  },
};

// Make available globally in browser
if (typeof window !== "undefined") {
  (window as any).apiHelper = apiHelper;
}

export default apiHelper;
