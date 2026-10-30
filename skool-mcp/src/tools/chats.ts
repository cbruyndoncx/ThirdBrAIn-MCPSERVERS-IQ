import { z } from "zod";
import { api2Request } from "../client.js";

// Skool's chat panel calls GET api2.skool.com/self/chat-channels (recorded 2026-10-30).
// Listing channels does not mark messages as read; only opening a conversation does.

interface RawChannel {
  id: string;
  group_id: string;
  last_message_at: string;
  user_ids?: string[];
  metadata?: { num_unread?: number; unread?: number };
  user?: { id?: string; name?: string; first_name?: string; last_name?: string };
  last_message?: { metadata?: { content?: string; src?: string } };
}

export const chatsTool = {
  name: "skool_chats",
  description:
    "List the logged-in user's Skool chat conversations (DMs) across all communities, most recent first, " +
    "with unread counts and the last message. Read-only; does not mark anything as read.",
  inputSchema: {
    limit: z.number().min(1).max(30).default(30).describe("Conversations to fetch (Skool rejects more than 30)"),
    offset: z.number().min(0).default(0).describe("Offset for paging"),
    unreadOnly: z.boolean().default(false).describe("Only conversations with unread messages"),
    raw: z.boolean().default(false).describe("Return Skool's unprocessed response instead of the summary"),
  },
  async handler(args: { limit: number; offset: number; unreadOnly: boolean; raw: boolean }) {
    const data = (await api2Request("/self/chat-channels", {
      queryParams: {
        offset: String(args.offset),
        limit: String(args.limit),
        last: "true",
        "unread-only": String(args.unreadOnly),
      },
    })) as { channels?: RawChannel[] };
    if (args.raw) return JSON.stringify(data, null, 2);

    const channels = (data.channels ?? []).map((c) => {
      const other = c.user ?? {};
      const last = c.last_message?.metadata ?? {};
      return {
        channelId: c.id,
        with: [other.first_name, other.last_name].filter(Boolean).join(" ") || other.name || "",
        withHandle: other.name ?? "",
        unreadMessages: c.metadata?.num_unread ?? 0,
        lastMessageAt: c.last_message_at,
        lastMessageFromThem: last.src ? last.src === other.id : null,
        lastMessage: (last.content ?? "").slice(0, 300),
        url: other.name ? `https://www.skool.com/@${other.name}` : "",
      };
    });

    return JSON.stringify(
      {
        returned: channels.length,
        withUnread: channels.filter((c) => c.unreadMessages > 0).length,
        unreadMessages: channels.reduce((sum, c) => sum + c.unreadMessages, 0),
        nextOffset: args.offset + channels.length,
        channels,
      },
      null,
      2,
    );
  },
};
