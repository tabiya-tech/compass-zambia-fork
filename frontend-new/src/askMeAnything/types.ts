export interface SuggestedAction {
  label: string;
  route: string;
}

export type AMAMessageSender = "USER" | "AGENT";

export interface AMAMessage {
  message_id: string;
  message: string;
  sent_at: string;
  sender: AMAMessageSender;
  suggested_actions?: SuggestedAction[];
}

export interface AMAConversationInput {
  user_input: string;
  history: AMAMessage[];
}

export interface AMAConversationResponse {
  conversation_id: string;
  messages: AMAMessage[];
}
