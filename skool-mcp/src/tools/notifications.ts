import { z } from "zod";
import { api2Request } from "../client.js";

// Skool's notification bell calls GET api2.skool.com/self/notifications (recorded 2026-10-30).
// The feed spans every community the logged-in user belongs to, not just the default one.
// Reading it does not mark anything as read.

interface RawNotification {
  id: string;
  created_at: string;
  group_id: string;
  action: string;
  unread: boolean;
  metadata?: { data?: string };
}

interface NotificationData {
  action?: string;
  text?: string;
  content?: string;
  display_name?: string;
  group_display_name?: string;
  link_as?: string;
  post_id?: string;
  root_post_id?: string;
}

function parseData(raw: string | undefined): NotificationData {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as NotificationData;
  } catch {
    return {};
  }
}

export const notificationsTool = {
  name: "skool_notifications",
  description:
    "List the logged-in user's Skool notifications (the bell) across all communities, newest first. " +
    "Read-only; does not mark anything as read. Filter by community slug and unread state; page with the returned cursor.",
  inputSchema: {
    limit: z.number().min(1).max(30).default(30).describe("Notifications to fetch per page (Skool rejects more than 30)"),
    cursor: z.string().optional().describe("Cursor from a previous call's nextCursor, for the next page"),
    unreadOnly: z.boolean().default(false).describe("Keep only unread notifications"),
    community: z
      .string()
      .optional()
      .describe("Keep only one community: its URL slug (e.g. thirdbrain-tech-3102), group id or display name"),
    raw: z.boolean().default(false).describe("Return Skool's unprocessed response instead of the summary"),
  },
  async handler(args: {
    limit: number;
    cursor?: string;
    unreadOnly: boolean;
    community?: string;
    raw: boolean;
  }) {
    const queryParams: Record<string, string> = { limit: String(args.limit), type: "all" };
    if (args.cursor) queryParams.cursor = args.cursor;

    const data = (await api2Request("/self/notifications", { queryParams })) as {
      messages?: RawNotification[];
      cursor?: string;
      has_more?: boolean;
    };
    if (args.raw) return JSON.stringify(data, null, 2);

    const wanted = args.community?.toLowerCase();
    const items = (data.messages ?? [])
      .map((n) => {
        const d = parseData(n.metadata?.data);
        const slug = d.link_as?.split("/")[1] ?? "";
        return {
          created_at: n.created_at,
          unread: n.unread,
          action: n.action || d.action,
          community: d.group_display_name ?? "",
          communitySlug: slug,
          groupId: n.group_id,
          from: d.display_name ?? "",
          text: d.text ?? "",
          content: (d.content ?? "").slice(0, 200),
          url: d.link_as ? `https://www.skool.com${d.link_as}` : "",
        };
      })
      .filter((n) => !args.unreadOnly || n.unread)
      .filter(
        (n) =>
          !wanted ||
          n.communitySlug.toLowerCase() === wanted ||
          n.groupId === wanted ||
          n.community.toLowerCase() === wanted,
      );

    return JSON.stringify(
      {
        fetched: data.messages?.length ?? 0,
        returned: items.length,
        unreadReturned: items.filter((n) => n.unread).length,
        hasMore: data.has_more ?? false,
        nextCursor: data.cursor ?? null,
        notifications: items,
      },
      null,
      2,
    );
  },
};
