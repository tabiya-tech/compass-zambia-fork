/**
 * Maps Career Readiness API messages to the chat UI format (IChatMessage).
 * Converts backend payloads into the shape ChatList expects and wires agent
 * messages to CareerReadinessAgentMessage so the first message can explain the module.
 */
import React from "react";
import type { IChatMessage } from "src/chat/Chat.types";
import { ConversationMessageSender } from "src/chat/ChatService/ChatService.types";
import { generateUserMessage } from "src/chat/util";
import type { CareerReadinessMessage } from "src/careerReadiness/types";
import CareerReadinessAgentMessage, {
  CAREER_READINESS_AGENT_MESSAGE_TYPE,
  type CareerReadinessAgentMessageProps,
} from "src/careerReadiness/components/CareerReadinessAgentMessage/CareerReadinessAgentMessage";

export const mapCareerReadinessMessageToChatMessage = (
  msg: CareerReadinessMessage
): IChatMessage<CareerReadinessAgentMessageProps> | ReturnType<typeof generateUserMessage> => {
  const sentAt = msg.sent_at;
  if (msg.sender === "USER") {
    return generateUserMessage(msg.message, sentAt, msg.message_id);
  }
  const payload: CareerReadinessAgentMessageProps = {
    message_id: msg.message_id,
    message: msg.message,
    sent_at: sentAt,
  };
  return {
    type: CAREER_READINESS_AGENT_MESSAGE_TYPE,
    message_id: msg.message_id,
    sender: ConversationMessageSender.COMPASS,
    payload,
    component: (p: CareerReadinessAgentMessageProps) => <CareerReadinessAgentMessage {...p} />,
  };
};

export const mapCareerReadinessMessagesToChatMessages = (messages: CareerReadinessMessage[]): IChatMessage<any>[] => {
  return messages.map(mapCareerReadinessMessageToChatMessage);
};
