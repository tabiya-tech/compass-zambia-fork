export type ModuleStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type ModuleStatusDisplay = "not_started" | "in_progress" | "done";

export const mapModuleStatusToDisplay = (status: ModuleStatus): ModuleStatusDisplay => {
  switch (status) {
    case "NOT_STARTED":
      return "not_started";
    case "IN_PROGRESS":
      return "in_progress";
    case "COMPLETED":
      return "done";
    default:
      return "not_started";
  }
};

export type CareerReadinessMessageSender = "USER" | "AGENT";

export interface ModuleSummary {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: ModuleStatus;
  sort_order: number;
  input_placeholder: string;
}

export interface ModuleDetail extends ModuleSummary {
  scope: string;
  active_conversation_id: string | null;
}

export interface ModuleListResponse {
  modules: ModuleSummary[];
}

export interface CareerReadinessMessage {
  message_id: string;
  message: string;
  sent_at: string;
  sender: CareerReadinessMessageSender;
}

export interface CareerReadinessConversationResponse {
  conversation_id: string;
  module_id: string;
  messages: CareerReadinessMessage[];
  module_completed: boolean;
}

export interface CareerReadinessConversationInput {
  user_input: string;
}
