import React from "react";
import { motion } from "motion/react";
import { CleanMemberCard } from "./CleanMemberCard";
import { Member } from "../types";

export const SessionGroup: React.FC<{
  title: string;
  members: Member[];
  pinnedIds: string[];
  onTogglePin: (id: string) => void;
  getSlotStatus: (filled: number, total: number) => any;
}> = ({
  title,
  members,
  pinnedIds,
  onTogglePin,
  getSlotStatus
}) => {
  if (members.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Premium Apple-style Section Header */}
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-[20px] font-bold text-[#1d1d1f] tracking-tight whitespace-nowrap">
          {title}
        </h3>
        <div className="h-[1px] w-full bg-gradient-to-r from-[#e8e8ed] to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
        {members.map((member) => {
          const remaining = member.total - member.filled;
          const progressPercentage = Math.round((member.filled / member.total) * 100);
          const status = getSlotStatus(member.filled, member.total);
          const isPinned = pinnedIds.includes(member.id);

          return (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <CleanMemberCard
                member={member}
                status={status}
                remaining={remaining}
                progressPercentage={progressPercentage}
                isPinned={isPinned}
                onTogglePin={onTogglePin}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
