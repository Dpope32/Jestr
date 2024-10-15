// src/services/badgeServices.ts

import { API_URL } from './config';
import { Badge, BadgeType } from '../screens/AppNav/Badges/Badges.types';

export interface BadgeWithCounts extends Badge {
  currentCounts: number;
}

export const fetchUserBadges = async (userEmail: string): Promise<Badge[]> => {
  try {
    console.log(`[BadgeServices] Fetching user badges for: ${userEmail} ********** TOUCHES SERVER **********`);
    const response = await fetch(`${API_URL}/getUserBadges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'getUserBadges', userEmail }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user badges: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[BadgeServices] Fetched user badges:`, data);
    return data.data.badges.map(normalizeBadge);
  } catch (error) {
    console.error('[BadgeServices] Error fetching user badges:', error);
    throw error;
  }
};


export const checkBadgeEligibility = async (userEmail: string, action: BadgeType): Promise<BadgeType | null> => {
  try {
    console.log(`[BadgeServices] Checking badge eligibility for user: ${userEmail}, action: ${action} ********** TOUCHES SERVER **********`);
    const response = await fetch(`${API_URL}/checkBadgeEligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'checkBadgeEligibility', userEmail, action }),
    });

    if (!response.ok) {
      if (response.status === 500) {
        console.error(`[BadgeServices] Server error (500) when checking badge eligibility. This might be due to a server-side issue.`);
        // Instead of throwing an error, we'll return null to indicate no eligible badge
        return null;
      }
      throw new Error(`Failed to check badge eligibility: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`[BadgeServices] Badge eligibility check result:`, data);
    return data.data.badgeType ? normalizeBadgeType(data.data.badgeType) : null;
  } catch (error) {
    console.error('[BadgeServices] Error checking badge eligibility:', error);
    // Instead of rethrowing the error, we'll return null
    return null;
  }
};

export const awardBadge = async (userEmail: string, badgeType: BadgeType): Promise<Badge | null> => {
  try {
    console.log(`[BadgeServices] Awarding badge for user: ${userEmail}, badgeType: ${badgeType} ********** TOUCHES SERVER **********`);
    const response = await fetch(`${API_URL}/awardBadge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'awardBadge', userEmail, badgeType }),
    });

    if (!response.ok) {
      throw new Error(`Failed to award badge: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[BadgeServices] Badge award result:`, data);
    return data.data ? normalizeBadge(data.data) : null;
  } catch (error) {
    console.error('[BadgeServices] Error awarding badge:', error);
    throw error;
  }
};

const normalizeBadge = (rawBadge: any): Badge => {
//  console.log(`[BadgeServices] Normalizing badge:`, rawBadge);
  const badgeData = rawBadge.badge || rawBadge; // Handle cases where badge data is nested
  return {
    id: badgeData.BadgeType,
    type: normalizeBadgeType(badgeData.BadgeType),
    title: badgeData.BadgeName,
    description: badgeData.Description,
    earned: badgeData.Earned === true || badgeData.Progress === 100,
    progress: badgeData.Progress || 0,
    acquiredDate: badgeData.AwardedDate,
    holdersCount: badgeData.HoldersCount || 0,
    currentCounts: rawBadge.currentCounts || 0,
  };
};

const normalizeBadgeType = (badgeType: string): BadgeType => {
  //console.log(`[BadgeServices] Normalizing badge type: ${badgeType}`);
  return badgeType as BadgeType;
};
