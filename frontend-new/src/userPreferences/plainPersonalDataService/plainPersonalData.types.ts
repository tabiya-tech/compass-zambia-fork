export interface PlainPersonalData {
  user_id: string;
  created_at: string;
  updated_at: string;
  data: {
    [key: string]: string;
  };
}
