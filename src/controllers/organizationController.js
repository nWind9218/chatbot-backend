const { successResponse, errorResponse, paginatedResponse, catchAsync } = require('../utils/response');
const { createSlug } = require('../utils/crypto');
const config = require('../config');
const prisma = require('../config/database');

/**
 * Create new organization
 */
const createOrganization = catchAsync(async (req, res) => {
  const { name, description, logo } = req.body;
  
  // Create slug from name
  let slug = createSlug(name);
  
  // Ensure slug is unique
  let slugExists = await prisma.organization.findUnique({ where: { slug } });
  let slugSuffix = 1;
  
  while (slugExists) {
    slug = `${createSlug(name)}-${slugSuffix}`;
    slugExists = await prisma.organization.findUnique({ where: { slug } });
    slugSuffix++;
  }
  
  // Create organization with creator as owner
  const organization = await prisma.organization.create({
    data: {
      name,
      slug,
      description,
      logo,
      creatorId: req.user.id,
      members: {
        create: {
          userId: req.user.id,
          role: 'OWNER',
        },
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          apiKeys: true,
        },
      },
    },
  });
  
  return successResponse(res, organization, 'Organization created successfully', 201);
});

/**
 * Get user's organizations
 */
const getUserOrganizations = catchAsync(async (req, res) => {
  const organizations = await prisma.organizationMember.findMany({
    where: { userId: req.user.id },
    include: {
      organization: {
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              members: true,
              apiKeys: true,
            },
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });
  
  const formattedOrganizations = organizations.map(membership => ({
    ...membership.organization,
    membershipRole: membership.role,
    joinedAt: membership.joinedAt,
  }));
  
  return successResponse(res, formattedOrganizations, 'Organizations retrieved successfully');
});

/**
 * Get organization by ID
 */
const getOrganizationById = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
      _count: {
        select: {
          members: true,
          apiKeys: true,
        },
      },
    },
  });
  
  if (!organization) {
    return errorResponse(res, 'Organization not found', 404);
  }
  
  return successResponse(res, organization, 'Organization retrieved successfully');
});

/**
 * Update organization
 */
const updateOrganization = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const { name, description, logo } = req.body;
  
  // Update organization
  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      name,
      description,
      logo,
      updatedAt: new Date(),
    },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          members: true,
          apiKeys: true,
        },
      },
    },
  });
  
  return successResponse(res, organization, 'Organization updated successfully');
});

/**
 * Delete organization
 */
const deleteOrganization = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  
  // Delete organization (cascade will handle members, api keys, etc.)
  await prisma.organization.delete({
    where: { id: organizationId },
  });
  
  return successResponse(res, null, 'Organization deleted successfully');
});

/**
 * Get organization members
 */
const getOrganizationMembers = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const { page = 1, limit = config.DEFAULT_PAGE_SIZE } = req.query;
  
  const skip = (page - 1) * limit;
  
  const [members, total] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { organizationId },
      skip,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            lastLogin: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    }),
    prisma.organizationMember.count({
      where: { organizationId },
    }),
  ]);
  
  return paginatedResponse(res, members, total, parseInt(page), parseInt(limit));
});

/**
 * Invite user to organization
 */
const inviteMember = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const { email, role = 'MEMBER' } = req.body;
  
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
    },
  });
  
  if (!user) {
    return errorResponse(res, 'User with this email not found', 404);
  }
  
  if (!user.isActive) {
    return errorResponse(res, 'User account is disabled', 400);
  }
  
  // Check if user is already a member
  const existingMembership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId,
      },
    },
  });
  
  if (existingMembership) {
    return errorResponse(res, 'User is already a member of this organization', 409);
  }
  
  // Create membership
  const membership = await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });
  
  return successResponse(res, membership, 'Member invited successfully', 201);
});

/**
 * Update member role
 */
const updateMemberRole = catchAsync(async (req, res) => {
  const { organizationId, userId } = req.params;
  const { role } = req.body;
  
  // Cannot change role of organization creator
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { creatorId: true },
  });
  
  if (organization.creatorId === userId) {
    return errorResponse(res, 'Cannot change role of organization creator', 400);
  }
  
  // Update member role
  const membership = await prisma.organizationMember.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    data: {
      role,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });
  
  return successResponse(res, membership, 'Member role updated successfully');
});

/**
 * Remove member from organization
 */
const removeMember = catchAsync(async (req, res) => {
  const { organizationId, userId } = req.params;
  
  // Cannot remove organization creator
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { creatorId: true },
  });
  
  if (organization.creatorId === userId) {
    return errorResponse(res, 'Cannot remove organization creator', 400);
  }
  
  // Remove member
  await prisma.organizationMember.delete({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });
  
  return successResponse(res, null, 'Member removed successfully');
});

/**
 * Leave organization
 */
const leaveOrganization = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  
  // Cannot leave if user is the creator
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { creatorId: true },
  });
  
  if (organization.creatorId === req.user.id) {
    return errorResponse(res, 'Organization creator cannot leave. Transfer ownership or delete organization.', 400);
  }
  
  // Remove membership
  await prisma.organizationMember.delete({
    where: {
      userId_organizationId: {
        userId: req.user.id,
        organizationId,
      },
    },
  });
  
  return successResponse(res, null, 'Left organization successfully');
});

module.exports = {
  createOrganization,
  getUserOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  leaveOrganization,
};
