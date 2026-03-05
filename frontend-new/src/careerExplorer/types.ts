export type CareerExplorerMessageSender = "USER" | "AGENT";

export interface CareerExplorerMessage {
  message_id: string;
  message: string;
  sent_at: string;
  sender: CareerExplorerMessageSender;
}

export interface CareerExplorerConversationResponse {
  messages: CareerExplorerMessage[];
  finished: boolean;
}

export interface CareerExplorerConversationInput {
  user_input: string;
}
