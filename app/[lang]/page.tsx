import { Studio } from "@/components/studio/studio";
import { loadChatPresets, loadNotifPresets, loadUsers } from "@/lib/presets";

export default async function Page() {
  const [chatPresets, notifPresets, usersById] = await Promise.all([
    loadChatPresets(),
    loadNotifPresets(),
    loadUsers(),
  ]);

  return (
    <Studio
      chatPresets={chatPresets}
      notifPresets={notifPresets}
      usersById={usersById}
    />
  );
}
