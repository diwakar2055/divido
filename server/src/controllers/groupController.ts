import crypto from 'crypto';
import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Expense } from '../models/Expense';
import { Group } from '../models/Group';
import { Invitation } from '../models/Invitation';
import { User } from '../models/User';
import { sendInvitationEmail } from '../utils/emailService';

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    const group = new Group({
      name,
      description,
      createdBy: new Types.ObjectId(req.userId),
      members: [new Types.ObjectId(req.userId)],
    });

    await group.save();
    await group.populate('members createdBy');

    res.status(201).json({
      message: 'Group created successfully',
      group,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
};

export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const groups = await Group.find({ members: req.userId })
      .populate('members')
      .populate('createdBy')
      .sort({ createdAt: -1 });

    res.status(200).json({ groups });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
};

export const getGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members')
      .populate('createdBy');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.some((m: any) => m._id.toString() === req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ group });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch group', error: error.message });
  }
};

export const updateGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can update' });
    }

    group.name = name || group.name;
    group.description = description || group.description;

    await group.save();
    await group.populate('members createdBy');

    res.status(200).json({
      message: 'Group updated successfully',
      group,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update group', error: error.message });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can add members' });
    }

    if (group.members.some((m) => m.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    group.members.push(new Types.ObjectId(userId));
    await group.save();
    await group.populate('members createdBy');

    res.status(200).json({
      message: 'Member added successfully',
      group,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add member', error: error.message });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can remove members' });
    }

    group.members = group.members.filter((m) => m.toString() !== userId);
    await group.save();
    await group.populate('members createdBy');

    res.status(200).json({
      message: 'Member removed successfully',
      group,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can delete' });
    }

    // Delete all expenses in the group
    await Expense.deleteMany({ groupId });

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      message: 'Group deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete group', error: error.message });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('[searchUsers] Searching for email:', email, 'Current user:', req.userId);

    // Search for exact match first, then regex match
    let users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.userId }, // Exclude current user
    }).select('_id name email').limit(10);

    console.log('[searchUsers] Found users:', users);
    console.log('[searchUsers] Total users count:', users.length);

    // If no results, try to get all users for debugging
    if (users.length === 0) {
      const allUsers = await User.find().select('_id name email').limit(5);
      console.log('[searchUsers] Debug - All users in DB (first 5):', allUsers);
    }

    res.status(200).json({ users });
  } catch (error: any) {
    console.error('[searchUsers] Error:', error);
    res.status(500).json({ message: 'Failed to search users', error: error.message });
  }
};

export const inviteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const group = await Group.findById(groupId).populate('members createdBy');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const creator = await User.findById(req.userId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    const creatorId = (group.createdBy as any)._id?.toString() || group.createdBy.toString();
    if (creatorId !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can invite members' });
    }

    const inviteeEmail = email.toLowerCase();

    // Check if user already exists and is a member
    const existingUser = await User.findOne({ email: inviteeEmail });
    if (existingUser && group.members.some((m: any) => m._id.toString() === existingUser._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Check if invitation already exists and is not expired
    const existingInvitation = await Invitation.findOne({
      email: inviteeEmail,
      groupId: groupId,
      accepted: false,
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'An active invitation already exists for this email' });
    }

    // Create invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save invitation
    const invitation = new Invitation({
      email: inviteeEmail,
      groupId: new Types.ObjectId(groupId),
      token,
      createdBy: new Types.ObjectId(req.userId),
      expiresAt,
    });

    await invitation.save();

    // Send invitation email
    try {
      await sendInvitationEmail(inviteeEmail, group.name, token, creator.name);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the request, just warn the user
      return res.status(200).json({
        message: 'Invitation created but email failed to send',
        invitation: { token, email: inviteeEmail, expiresAt },
      });
    }

    res.status(200).json({
      message: 'Invitation sent successfully',
      invitation: { token, email: inviteeEmail, expiresAt },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to invite user', error: error.message });
  }
};

export const acceptInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;
    const userId = req.userId;

    if (!token) {
      return res.status(400).json({ message: 'Invitation token is required' });
    }

    // Find the invitation
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or expired' });
    }

    // Check if invitation is still valid
    if (invitation.accepted) {
      return res.status(400).json({ message: 'This invitation has already been accepted' });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ message: 'This invitation has expired' });
    }

    // Get user and group
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const group = await Group.findById(invitation.groupId).populate('members');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    if (group.members.some((m: any) => m._id.toString() === userId)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Add user to group
    group.members.push(new Types.ObjectId(userId));
    await group.save();

    // Mark invitation as accepted
    invitation.accepted = true;
    await invitation.save();

    // Populate and return group
    await group.populate('members createdBy');

    res.status(200).json({
      message: 'Successfully joined the group!',
      group,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to accept invitation', error: error.message });
  }
};

export const getPendingInvitations = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const invitations = await Invitation.find({
      email: user.email.toLowerCase(),
      accepted: false,
      expiresAt: { $gt: new Date() },
    })
      .populate('groupId', 'name description')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ invitations });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch invitations', error: error.message });
  }
};

