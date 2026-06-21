import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with the SERVICE ROLE KEY so it can write directly without RLS issues.
// Note: This runs on Vercel Node Serverless, so we use process.env instead of import.meta.env
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  try {
    console.log("Starting JKT48 data sync to Supabase...");

    // 1. Fetch Events
    const eventsRes = await fetch("https://jkt48.com/api/v1/exclusives?lang=id");
    const eventsData = await eventsRes.json();
    
    if (eventsData && eventsData.status && eventsData.data) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const activeEvents = eventsData.data.filter((ev: any) => {
        if (!ev.valid_date_from) return false;
        const eventDate = new Date(ev.valid_date_from);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      });

      // 2. Process each active event
      for (const event of activeEvents) {
        const is2Shot = event.category === "TWO_SHOT" || event.title?.toLowerCase().includes("2shot");
        const category = is2Shot ? "2Shot" : "MeetGreet";
        const endpoint = category === "2Shot"
          ? `https://jkt48.com/api/v1/exclusives/${event.code}/bonus?lang=id`
          : `https://jkt48.com/api/v1/exclusives/${event.code}?lang=id`;

        const memberRes = await fetch(endpoint);
        const memberData = await memberRes.json();

        if (memberData && memberData.status && memberData.data) {
          const sessions = Array.isArray(memberData.data) ? memberData.data : (memberData.data.session || []);
          
          const recordsToUpsert: any[] = [];
          
          sessions.forEach((session: any, sessionIndex: number) => {
            const details = session.session_members || session.session_detail || [];
            details.forEach((sm: any, memberIndex: number) => {
              const name = sm.member_name || sm.jkt48_member_name;
              const quota = Number(sm.quota !== undefined ? sm.quota : sm.available_quota) || 0;
              const filled = Number(sm.tickets_sold) || 0;
              const id = sm.session_detail_code || sm.id || `session-${sessionIndex}-${session.label}-${name}-${memberIndex}`;

              recordsToUpsert.push({
                id: id,
                event_code: event.code,
                name: name,
                category: category,
                total_quota: quota + filled,
                filled_quota: filled,
                session_label: session.label,
                jkt48_gen: sm.label || "Jalur Khusus",
                updated_at: new Date().toISOString()
              });
            });
          });

          // 3. Upsert to Supabase
          if (recordsToUpsert.length > 0) {
            const { error } = await supabase
              .from('jkt48_slots')
              .upsert(recordsToUpsert, { onConflict: 'id' });
              
            if (error) {
              console.error("Supabase upsert error for event", event.code, error);
            } else {
              console.log(`Successfully synced ${recordsToUpsert.length} slots for event ${event.code}`);
            }
          }
        }
      }

      return res.status(200).json({ status: true, message: "Sync complete." });
    } else {
      return res.status(500).json({ status: false, message: "Failed to fetch events from JKT48." });
    }
  } catch (error: any) {
    console.error("Sync error:", error);
    return res.status(500).json({ status: false, error: error.message });
  }
}
