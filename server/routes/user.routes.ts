import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../lib/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { APIError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Update user profile schema
const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.string().min(1).max(50)
});

// Update user profile
router.put('/user/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const validatedData = updateProfileSchema.parse(req.body);

    // Check if email is already taken by another user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== userId) {
      throw new APIError(400, 'Email is already taken', 'EMAIL_TAKEN');
    }

    // Update user profile
    await db
      .update(users)
      .set({
        displayName: validatedData.displayName,
        email: validatedData.email,
        role: validatedData.role
      })
      .where(eq(users.id, userId));

    // Fetch updated user data
    const updatedUser = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        role: users.role,
        avatar: users.avatar
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    res.json({
      success: true,
      data: updatedUser[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid profile data', 'VALIDATION_ERROR', error.errors);
    }
    console.error('Profile update error:', error);
    throw new APIError(500, 'Failed to update profile', 'UPDATE_ERROR');
  }
});

// User preferences storage table (we'll add this to schema if needed)
const userPreferencesSchema = z.object({
  financialAlerts: z.boolean().default(true),
  invoiceReminders: z.boolean().default(true),
  aiInsights: z.boolean().default(true),
  accountActivity: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false)
});

// Update user notification preferences
router.put('/user/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const validatedPreferences = userPreferencesSchema.parse(req.body);

    // For now, we'll store preferences in the user's replitAuthData field
    // In a real implementation, you'd want a separate preferences table
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (currentUser.length === 0) {
      throw new APIError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const currentReplitData = currentUser[0].replitAuthData as any || {};
    
    await db
      .update(users)
      .set({
        replitAuthData: {
          ...currentReplitData,
          preferences: validatedPreferences
        }
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      data: validatedPreferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid preferences data', 'VALIDATION_ERROR', error.errors);
    }
    console.error('Preferences update error:', error);
    throw new APIError(500, 'Failed to update preferences', 'UPDATE_ERROR');
  }
});

// Get user preferences
router.get('/user/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new APIError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const replitData = user[0].replitAuthData as any || {};
    const preferences = replitData.preferences || {
      financialAlerts: true,
      invoiceReminders: true,
      aiInsights: true,
      accountActivity: true,
      emailNotifications: true,
      pushNotifications: false
    };

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    throw new APIError(500, 'Failed to get preferences', 'GET_ERROR');
  }
});

export default router;