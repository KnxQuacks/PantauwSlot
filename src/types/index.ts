export interface Member {
  id: string;
  name: string;
  category: "2Shot" | "MeetGreet";
  total: number;
  filled: number;
  avatarBg: string;
  session: string;
  jkt48Gen: string;
  photoUrl?: string;
}

export interface ExclusiveEvent {
  exclusive_id: number;
  category: string;
  title: string;
  code: string;
  valid_date_from: string;
}
