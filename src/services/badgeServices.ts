// badgeService.ts

import { API_URL } from './config'; 
import { Badge, BadgeType } from '../screens/AppNav/Badges/Badges.types'; 

export const fetchUserBadges = async (userEmail: string): Promise<Badge[]> => {
  try {
    const response = await fetch(`${API_URL}/getUserBadges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'getUserBadges',
        userEmail,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch badges: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    if (responseData.data && Array.isArray(responseData.data.badges)) {
      return responseData.data.badges.map((badge: any) => ({
        id: badge.BadgeType,
        type: badge.BadgeType as BadgeType,
        title: badge.BadgeName,
        description: badge.Description,
        earned: true,
        progress: 100,
        acquiredDate: badge.AwardedDate,
        holdersCount: 0,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw error;
  }
};