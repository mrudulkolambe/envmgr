import { NextRequest } from 'next/server';
import { getAuthUser, unauthorized } from './auth';
import OrganizationMember from '../models/OrganizationMember';
import mongoose from 'mongoose';

export async function getOrgMember(req: NextRequest, orgId: string) {
  const user = await getAuthUser(req);
  if (!user) {
    return { error: unauthorized() };
  }

  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return { 
      error: Response.json(
        { success: false, error: 'Invalid organization ID' },
        { status: 400 }
      )
    };
  }

  const member = await OrganizationMember.findOne({
    organizationId: orgId,
    userId: user._id,
  });

  if (!member) {
    return {
      error: Response.json(
        { success: false, error: 'Not a member of this organization' },
        { status: 403 }
      )
    };
  }

  return { user, member };
}

export function hasRole(memberRole: string, requiredRole: 'owner' | 'admin' | 'member'): boolean {
  const roleHierarchy = { owner: 3, admin: 2, member: 1 };
  return roleHierarchy[memberRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole];
}

export function requireRole(memberRole: string, requiredRole: 'owner' | 'admin' | 'member') {
  if (!hasRole(memberRole, requiredRole)) {
    return Response.json(
      { success: false, error: `Requires ${requiredRole.toUpperCase()} role or higher` },
      { status: 403 }
    );
  }
  return null;
}
