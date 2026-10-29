'use client';

import { RoomCard } from '@/components/RoomCard';
import { RoomCardSkeleton } from '@/components/ui/Skeleton';
import type { Room } from '@/types/booking';

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  selectedPackageId: string | null;
  onSelectPackage: (roomId: string, packageId: string) => void;
}

export const RoomListSkeleton = () => (
  <div className="space-y-2.5">
    <RoomCardSkeleton />
    <RoomCardSkeleton />
    <RoomCardSkeleton />
  </div>
);

export const RoomList = ({
  rooms,
  selectedRoomId,
  selectedPackageId,
  onSelectPackage,
}: RoomListProps) => (
  <div className="space-y-2.5">
    {rooms.map((room) => (
      <RoomCard
        key={room.id}
        room={room}
        highlightedPackageId={selectedRoomId === room.id ? selectedPackageId : null}
        onSelectPackage={onSelectPackage}
        onOpenDetail={() =>
          onSelectPackage(
            room.id,
            selectedRoomId === room.id && selectedPackageId
              ? selectedPackageId
              : room.packages[0].id
          )
        }
      />
    ))}
  </div>
);
