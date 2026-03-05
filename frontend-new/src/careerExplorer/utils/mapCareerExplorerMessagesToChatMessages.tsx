import React from "react";
import type { IChatMessage } from "src/chat/Chat.types";
import { ConversationMessageSender } from "src/chat/ChatService/ChatService.types";
import { generateUserMessage } from "src/chat/util";
import type { CareerExplorerMessage } from "src/careerExplorer/types";
import CareerExplorerAgentMessage, {
  CAREER_EXPLORER_AGENT_MESSAGE_TYPE,
  type CareerExplorerAgentMessageProps,
} from "src/careerExplorer/components/CareerExplorerAgentMessage/CareerExplorerAgentMessage";

export const mapCareerExplorerMessageToChatMessage = (
  msg: CareerExplorerMessage
): IChatMessage<CareerExplorerAgentMessageProps> | ReturnType<typeof generateUserMessage> => {
  const sentAt = msg.sent_at;
  if (msg.sender === "USER") {
    return generateUserMessage(msg.message, sentAt, msg.message_id);
  }
  const payload: CareerExplorerAgentMessageProps = {
    message_id: msg.message_id,
    message: msg.message,
    sent_at: sentAt,
  };
  return {
    type: CAREER_EXPLORER_AGENT_MESSAGE_TYPE,
    message_id: msg.message_id,
    sender: ConversationMessageSender.COMPASS,
    payload,
    component: (p: CareerExplorerAgentMessageProps) => <CareerExplorerAgentMessage {...p} />,
  };
};

export const mapCareerExplorerMessagesToChatMessages = (messages: CareerExplorerMessage[]): IChatMessage<any>[] => {
  return messages.map(mapCareerExplorerMessageToChatMessage);
};
